import React, { useEffect, useState, useContext } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import api from "../api";
import { AuthContext } from "../context/AuthContext";
import Button from "./ui/Button";
import Card from "./ui/Card";

export default function ResultPage() {
  const { token } = useContext(AuthContext);
  const { testId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [result, setResult] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [domains, setDomains] = useState([]);
  const [analytics, setAnalytics] = useState([]);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [answeredCount, setAnsweredCount] = useState(0);

  useEffect(() => {
    if (!token) return navigate("/signin");
    const fetchResult = async () => {
      try {
        const userId = searchParams.get('userId');
        // if admin context (we rely on backend admin routes) and a userId is present, fetch via admin endpoint
        if (userId) {
          try {
            const res = await api.get(`/admin/users/${userId}/tests/${testId}`);
            setResult(res.data.test);
            // try fetch user info for display
            try {
              const usersRes = await api.get('/admin/users');
              const u = (usersRes.data.users || []).find((x) => String(x._id) === String(userId) || String(x.id) === String(userId));
              if (u) setUserInfo(u);
            } catch (e) {
              // ignore
            }
            return;
          } catch (e) {
            // fallback to normal endpoint
            console.warn('admin fetch failed, falling back', e);
          }
        }

        const res = await api.get(`/test/results/${testId}`);
        setResult(res.data.test);
      } catch (err) {
        console.error(err);
      }
    };

    fetchResult();
  }, [token, testId, navigate]);

  // when result is loaded, fetch domain/question metadata to compute per-domain analytics
  useEffect(() => {
    if (!result) return;

    const fetchDomainsAndCompute = async () => {
      try {
        const res = await api.get("/domains");
        const domainList = res.data || [];
        setDomains(domainList);

        // flatten questions with domain info
        const qMap = {};
        let totalQ = 0;
        domainList.forEach((d) => {
          (d.questions || []).forEach((q) => {
            qMap[q.id] = { text: q.text, domain: d.domain };
            totalQ += 1;
          });
        });

        setTotalQuestions(totalQ);

        const answers = result.answers || [];
        setAnsweredCount(answers.filter((a) => a.rating !== undefined && a.rating !== null).length);

        // compute per-domain analytics
        const byDomain = domainList.map((d) => {
          const qIds = (d.questions || []).map((q) => q.id);
          const domainAnswers = answers.filter((a) => qIds.includes(a.qId));
          const answered = domainAnswers.length;
          const score = domainAnswers.reduce((s, a) => s + (Number(a.rating) || 0), 0);
          const maxScore = qIds.length * 3; // each question max 3
          const percent = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;

          // severity for domain based on percent
          const getDomSeverity = () => {
            if (percent <= 15) return { label: "None / Normal", className: "bg-green-200 text-green-800" };
            if (percent <= 40) return { label: "Questionable / Very Mild", className: "bg-yellow-200 text-yellow-800" };
            if (percent <= 60) return { label: "Mild", className: "bg-orange-200 text-orange-800" };
            if (percent <= 85) return { label: "Moderate", className: "bg-red-200 text-red-800" };
            return { label: "Severe", className: "bg-red-700 text-white" };
          };

          // top concerning questions (highest ratings)
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
        console.error("Failed to fetch domains for analytics", err);
      }
    };

    fetchDomainsAndCompute();
  }, [result]);

  if (!result)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );

  const { score = 0, answers = [] } = result;

  const overallSeverity = () => {
    if (score <= 9) return { label: "None / Normal", className: "bg-green-200 text-green-800" };
    if (score <= 22) return { label: "Questionable / Very Mild", className: "bg-yellow-200 text-yellow-800" };
    if (score <= 45) return { label: "Mild", className: "bg-orange-200 text-orange-800" };
    if (score <= 67) return { label: "Moderate", className: "bg-red-200 text-red-800" };
    return { label: "Severe", className: "bg-red-700 text-white" };
  };

  const overall = overallSeverity();

  const getSeverity = () => {
    if (score <= 9) return { label: "None / Normal", className: "bg-green-200 text-green-800" };
    if (score <= 22) return { label: "Questionable / Very Mild", className: "bg-yellow-200 text-yellow-800" };
    if (score <= 45) return { label: "Mild", className: "bg-orange-200 text-orange-800" };
    if (score <= 67) return { label: "Moderate", className: "bg-red-200 text-red-800" };
    return { label: "Severe", className: "bg-red-700 text-white" };
  };

  const severity = getSeverity();

  return (
    <div className="min-h-screen p-6 bg-blue-50 flex justify-center">
      <div className="w-full max-w-3xl">
        <Card>
          <h1 className="text-3xl font-bold text-center mb-4">Test Result</h1>
            <div className="text-center mb-4">
              {/* show user info if available (admin view) */}
              {userInfo ? (
                <div className="mb-3">
                  <div className="font-semibold">{userInfo.name}</div>
                  <div className="text-sm text-gray-600">{userInfo.email}</div>
                </div>
              ) : null}

              <p>Score: <span className="font-semibold">{score}</span></p>
              <p className={`inline-block mt-2 px-4 py-2 rounded-full font-semibold ${overall.className}`}>
                Severity: {overall.label}
              </p>
              <p className="text-sm text-gray-600 mt-2">Answered: {answeredCount}/{totalQuestions || "?"}</p>
            </div>
          <h2 className="text-2xl font-semibold mb-2">Per-domain analysis</h2>
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

          <h2 className="text-2xl font-semibold mt-4 mb-2">All answers</h2>
          <div className="space-y-2">
            {answers.map((a) => {
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
            <Button
              onClick={() => {
                const userId = searchParams.get('userId');
                if (userId) return navigate(`/admin/user/${userId}`);
                return navigate('/dashboard');
              }}
              className="bg-green-500 hover:bg-green-600 text-white"
            >
              Back to Dashboard
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
