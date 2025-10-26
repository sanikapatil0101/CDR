import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { AuthContext } from '../../context/AuthContext';

export default function AdminUserDetail() {
  const { user } = useContext(AuthContext);
  const { userId, testId } = useParams();
  const navigate = useNavigate();

  const [tests, setTests] = useState([]);
  const [selectedTest, setSelectedTest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userInfo, setUserInfo] = useState(null);
  const [domains, setDomains] = useState([]);
  const [analytics, setAnalytics] = useState([]);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [answeredCount, setAnsweredCount] = useState(0);

  useEffect(() => {
    if (!user || user.email !== 'admin@gmail.com') {
      navigate('/signin');
      return;
    }

    const fetch = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/admin/users/${userId}/tests`);
        setTests(res.data.tests || []);

        // fetch single user info via new admin endpoint
        try {
          const userRes = await api.get(`/admin/users/${userId}`);
          if (userRes.data?.user) setUserInfo(userRes.data.user);
        } catch (e) {
          // fallback: try fetching users list (older behavior)
          try {
            const usersRes = await api.get('/admin/users');
            const u = (usersRes.data.users || []).find((x) => String(x._id) === String(userId) || String(x.id) === String(userId));
            if (u) setUserInfo(u);
          } catch (e2) {
            console.warn('Could not fetch user info', e2);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetch();
  }, [user, userId, navigate]);

  useEffect(() => {
    const fetchTest = async () => {
      if (!testId) return;
      try {
        const res = await api.get(`/admin/users/${userId}/tests/${testId}`);
        setSelectedTest(res.data.test || null);
      } catch (err) {
        console.error(err);
      }
    };
    fetchTest();
  }, [testId, userId]);

  // compute analytics when a test is selected
  useEffect(() => {
    if (!selectedTest) return;

    const fetchDomainsAndCompute = async () => {
      try {
        const res = await api.get('/domains');
        const domainList = res.data || [];
        setDomains(domainList);

        const qMap = {};
        let totalQ = 0;
        domainList.forEach((d) => {
          (d.questions || []).forEach((q) => {
            qMap[q.id] = { text: q.text, domain: d.domain };
            totalQ += 1;
          });
        });

        setTotalQuestions(totalQ);

        const answers = selectedTest.answers || [];
        setAnsweredCount(answers.filter((a) => a.rating !== undefined && a.rating !== null).length);

        const byDomain = domainList.map((d) => {
          const qIds = (d.questions || []).map((q) => q.id);
          const domainAnswers = answers.filter((a) => qIds.includes(a.qId));
          const answered = domainAnswers.length;
          const score = domainAnswers.reduce((s, a) => s + (Number(a.rating) || 0), 0);
          const maxScore = qIds.length * 3;
          const percent = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;

          const getDomSeverity = () => {
            if (percent <= 15) return { label: 'None / Normal', className: 'bg-green-200 text-green-800' };
            if (percent <= 40) return { label: 'Questionable / Very Mild', className: 'bg-yellow-200 text-yellow-800' };
            if (percent <= 60) return { label: 'Mild', className: 'bg-orange-200 text-orange-800' };
            if (percent <= 85) return { label: 'Moderate', className: 'bg-red-200 text-red-800' };
            return { label: 'Severe', className: 'bg-red-700 text-white' };
          };

          const topQuestions = domainAnswers
            .slice()
            .sort((a, b) => (b.rating || 0) - (a.rating || 0))
            .slice(0, 3)
            .map((a) => ({ qId: a.qId, rating: a.rating, text: qMap[a.qId]?.text || a.qId }));

          return {
            domain: d.domain,
            totalQuestions: qIds.length,
            answered,
            score,
            maxScore,
            percent,
            severity: getDomSeverity(),
            topQuestions,
          };
        });

        setAnalytics(byDomain);
      } catch (err) {
        console.error('Failed to fetch domains for analytics', err);
      }
    };

    fetchDomainsAndCompute();
  }, [selectedTest]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">User: {userInfo ? userInfo.name + ` (${userInfo.email})` : userId}</h1>

      {/* When a test is selected, show two-column view; otherwise center the tests list */}
      {selectedTest ? (
        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-1">
            <h2 className="font-semibold mb-2">Tests</h2>
            {loading ? <p>Loading...</p> : (
              <div className="space-y-2">
                {tests.map((t) => (
                  <Card key={t._id || t.id} className="p-3 flex justify-between items-center">
                    <div>
                      <div className="font-medium">{new Date(t.startedAt).toLocaleString()}</div>
                      {t.finishedAt && <div className="text-sm text-gray-600">Score: {t.score}</div>}
                    </div>
                    <Button onClick={() => navigate(`/result/${t._id || t.id}?userId=${userId}`)} className="bg-green-500 text-white">View</Button>
                  </Card>
                ))}
              </div>
            )}
          </div>

          <div className="col-span-2">
            {/* selectedTest content (unchanged) */}
            <h2 className="text-xl font-semibold mb-2">Test Result</h2>
            <Card className="p-4">
              <div className="text-center mb-4">
                {userInfo ? (
                  <div className="mb-3">
                    <div className="font-semibold">{userInfo.name}</div>
                    <div className="text-sm text-gray-600">{userInfo.email}</div>
                  </div>
                ) : (
                  <div className="mb-3">
                    <div className="font-semibold">User ID: {userId}</div>
                  </div>
                )}

                <p>Score: <span className="font-semibold">{selectedTest.score}</span></p>
                <p className={`inline-block mt-2 px-4 py-2 rounded-full font-semibold ${(() => {
                  const s = selectedTest.score || 0;
                  if (s <= 9) return 'bg-green-200 text-green-800';
                  if (s <= 22) return 'bg-yellow-200 text-yellow-800';
                  if (s <= 45) return 'bg-orange-200 text-orange-800';
                  if (s <= 67) return 'bg-red-200 text-red-800';
                  return 'bg-red-700 text-white';
                })()}`}>Severity: {(() => {
                  const s = selectedTest.score || 0;
                  if (s <= 9) return 'None / Normal';
                  if (s <= 22) return 'Questionable / Very Mild';
                  if (s <= 45) return 'Mild';
                  if (s <= 67) return 'Moderate';
                  return 'Severe';
                })()}</p>
                <p className="text-sm text-gray-600 mt-2">Answered: {answeredCount}/{totalQuestions || '?'}</p>
              </div>

              <h3 className="text-lg font-semibold">Per-domain analysis</h3>
              <div className="space-y-3">
                {analytics.map((d) => (
                  <Card key={d.domain} className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-semibold">{d.domain}</h3>
                        <p className="text-sm text-gray-600">Questions answered: {d.answered}/{d.totalQuestions} — Score: {d.score}/{d.maxScore} ({d.percent}%)</p>
                      </div>
                      <div className="ml-4">
                        <span className={`inline-block px-3 py-1 rounded-full font-semibold ${d.severity.className}`}>{d.severity.label}</span>
                      </div>
                    </div>

                    {d.topQuestions && d.topQuestions.length > 0 && (
                      <div className="mt-3">
                        <h4 className="font-semibold">Top concerns</h4>
                        <ul className="list-disc list-inside text-sm">
                          {d.topQuestions.map((t) => (
                            <li key={t.qId} className="mt-1">
                              <span className="font-medium">{t.rating}</span> — {t.text}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </Card>
                ))}
              </div>

              <h3 className="text-lg font-semibold mt-4 mb-2">All answers</h3>
              <div className="space-y-2">
                {(selectedTest.answers || []).map((a) => {
                  const domainObj = domains.find((d) => d.questions && d.questions.find((q) => q.id === a.qId));
                  const questionObj = domainObj?.questions.find((q) => q.id === a.qId);
                  const questionText = questionObj?.text || `Question ${a.qId}`;
                  const domainName = domainObj?.domain || null;

                  return (
                    <Card key={a.qId} className="flex justify-between items-center">
                      <div className="flex flex-col">
                        <span className="font-medium">{questionText}</span>
                        {domainName && <span className="text-sm text-gray-500">{domainName} — {a.qId}</span>}
                      </div>
                      <span className="font-semibold">{a.rating}</span>
                    </Card>
                  );
                })}
              </div>

              <div className="text-center mt-6">
                <Button onClick={() => navigate(`/admin/user/${userId}`)} className="bg-gray-500 text-white">Back</Button>
              </div>
            </Card>
          </div>
        </div>
      ) : (
        // centered single-column list when no test selected
        <div className="max-w-2xl mx-auto">
          <h2 className="font-semibold mb-4 text-center">Tests</h2>
          {loading ? <p className="text-center">Loading...</p> : (
            <div className="space-y-3">
              {tests.map((t) => (
                <Card key={t._id || t.id} className="p-3 flex justify-between items-center">
                  <div>
                    <div className="font-medium">{new Date(t.startedAt).toLocaleString()}</div>
                    {t.finishedAt && <div className="text-sm text-gray-600">Score: {t.score}</div>}
                  </div>
                  <Button onClick={() => navigate(`/result/${t._id || t.id}?userId=${userId}`)} className="bg-green-500 text-white">View</Button>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

