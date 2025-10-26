import React, { useEffect, useState, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api";
import { AuthContext } from "../context/AuthContext";
import Button from "./ui/Button";
import Card from "./ui/Card";

export default function TestPage() {
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();
  const { testId: routeTestId } = useParams();
  const [groupedQuestions, setGroupedQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [testId, setTestId] = useState(routeTestId || null);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!token) return navigate("/signin");

    const fetchQuestions = async () => {
      try {
        setLoading(true);
        const res = await api.get("/test/questions");
        const domains = res.data.questions || [];
        const seen = new Set();

        const groups = domains.map((domainObj, dIdx) => {
          const domainName = domainObj.domain || `Domain ${dIdx + 1}`;
          const questions = (domainObj.questions || []).map((q, qIdx) => {
            let uniqueId = q.id || `q-${dIdx}-${qIdx}`;
            let suffix = 1;
            while (seen.has(uniqueId)) uniqueId = `${q.id}-${suffix++}`;
            seen.add(uniqueId);
            return { uniqueId, qId: q.id || uniqueId, text: q.text || "No text" };
          });
          return { domain: domainName, questions };
        });

        setGroupedQuestions(groups);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [token, navigate]);

  // reset current index whenever questions change
  useEffect(() => {
    setCurrentIndex(0);
  }, [groupedQuestions]);

  useEffect(() => {
    if (!token) return navigate("/signin");

    const startOrResume = async () => {
      try {
        if (testId) return; // already set from route
        const res = await api.get("/test/my-tests");
        const unfinished = res.data.tests.find((t) => !t.finishedAt);
  if (unfinished) setTestId(unfinished._id || unfinished.id);
        else {
          const newTest = await api.post("/test/start");
          setTestId(newTest.data.testId);
        }
      } catch (err) {
        console.error(err);
      }
    };

    startOrResume();
  }, [token, navigate, testId]);

  // when we have a testId and the questions are loaded, fetch any saved answers
  useEffect(() => {
    const loadSavedAnswers = async () => {
      if (!testId || !groupedQuestions.length) return;

      try {
        const res = await api.get(`/test/results/${testId}`);
        const saved = res.data.test?.answers || [];

        // build a map from qId -> rating
        const savedMap = {};
        saved.forEach((a) => { if (a && a.qId) savedMap[a.qId] = a.rating; });

        // map saved qIds to our uniqueIds and set answers state
        const flat = groupedQuestions.flatMap((g) => g.questions);
        const mapped = {};
        flat.forEach((q) => {
          // q.qId is the original question id
          if (savedMap[q.qId] !== undefined) mapped[q.uniqueId] = Number(savedMap[q.qId]);
        });

        setAnswers((prev) => ({ ...mapped, ...prev }));

        // set currentIndex to next unanswered question (i.e., last answered + 1)
        const all = groupedQuestions.flatMap((g) => g.questions.map((q) => q.uniqueId));
        let lastAnswered = -1;
        all.forEach((uId, idx) => {
          if (mapped[uId] !== undefined) lastAnswered = idx;
        });
        const startIndex = Math.min(lastAnswered + 1, all.length - 1);
        setCurrentIndex(startIndex < 0 ? 0 : startIndex);
      } catch (err) {
        console.error("Failed to load saved answers", err);
      }
    };

    loadSavedAnswers();
  }, [testId, groupedQuestions]);

  const handleChange = (uniqueId, value) => {
    const numeric = parseFloat(value);
    setAnswers((prev) => ({ ...prev, [uniqueId]: numeric }));

    // persist this single answer to the server (merge)
    (async () => {
      try {
        // find qId for this uniqueId
        const flat = groupedQuestions.flatMap((g) => g.questions);
        const q = flat.find((qq) => qq.uniqueId === uniqueId);
        const qId = q?.qId || uniqueId;
        await api.post("/test/save", { testId, answers: [{ qId, rating: numeric }] });
      } catch (err) {
        // non-fatal; keep working offline
        console.error("Failed to save answer", err);
      }
    })();
  };

  const handleSubmit = async () => {
    if (!testId) return alert("No active test found");
    const allQuestions = groupedQuestions.flatMap((g) => g.questions);

    // ensure every question has an answer
    const allAnswered = allQuestions.every((q) => answers[q.uniqueId] !== undefined && answers[q.uniqueId] !== null);
    if (!allAnswered) return alert("Please answer all questions before submitting");

    const payload = allQuestions.map((q) => ({ qId: q.qId, rating: answers[q.uniqueId] || 0 }));

    try {
      await api.post("/test/submit", { testId, answers: payload });
      navigate(`/result/${testId}`);
    } catch (err) {
      console.error(err);
      alert("Submit failed");
    }
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading questions...</p>
      </div>
    );

  if (!groupedQuestions.length)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">No questions found.</p>
      </div>
    );

  // flattened questions for single-question navigation
  const allQuestions = groupedQuestions.flatMap((g) =>
    g.questions.map((q) => ({ ...q, domain: g.domain }))
  );

  const total = allQuestions.length;
  const currentQuestion = allQuestions[currentIndex];

  // answered count (0 is a valid answer so check for undefined)
  const answeredCount = allQuestions.filter((q) => answers[q.uniqueId] !== undefined).length;

  // domain and question-in-domain calculations
  let domainIndex = 0;
  let qNumberInDomain = 0;
  let domainQuestions = [];
  if (currentQuestion) {
    domainQuestions = allQuestions.filter((q) => q.domain === currentQuestion.domain);
    qNumberInDomain = domainQuestions.findIndex((q) => q.uniqueId === currentQuestion.uniqueId) + 1;
    domainIndex = groupedQuestions.findIndex((g) => g.domain === currentQuestion.domain) + 1;
  }

  return (
    <div className="min-h-screen p-6 flex items-center justify-center">
      <div className="w-full max-w-5xl">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold">CDR Test</h1>
          <div className="text-sm text-gray-600">Answered: {answeredCount}/{total || "?"}</div>
        </div>

        {/* large full-screen card for current question */}
        {currentQuestion && (
          <div className="h-[70vh] flex items-center justify-center">
            <Card className="w-full rounded-3xl shadow-2xl p-10" style={{ minHeight: '56vh' }}>
              <div className="flex flex-col h-full">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-semibold">Question {currentIndex + 1} of {total}</h2>
                    <p className="text-sm text-gray-600 mt-1">Domain {domainIndex}: {currentQuestion.domain} — Q {qNumberInDomain}/{domainQuestions.length}</p>
                  </div>
                  <div className="text-sm text-gray-500">{new Date().toLocaleDateString()}</div>
                </div>

                <div className="flex-1 flex items-center justify-center">
                  <div className="max-w-3xl text-center">
                    <p className="text-2xl leading-relaxed mb-6">{currentQuestion.text}</p>

                    <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
                      {[{ label: 'None', val: 0 }, { label: 'Questionable', val: 0.5 }, { label: 'Mild', val: 1 }, { label: 'Moderate', val: 2 }, { label: 'Severe', val: 3 }].map((opt) => {
                        const selected = answers[currentQuestion.uniqueId] === opt.val;
                        return (
                          <button
                            key={opt.val}
                            onClick={() => handleChange(currentQuestion.uniqueId, opt.val)}
                            className={`py-5 px-4 rounded-xl font-semibold focus:outline-none transition ${selected ? 'bg-[rgba(14,165,164,0.12)]' : 'big-option'}`}
                            style={selected ? { borderWidth: 2, borderColor: 'var(--primary-600)' } : undefined}
                          >
                            <div className="text-lg">{opt.label}</div>
                            <div className="text-sm text-gray-500 mt-1">{opt.val}</div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-between">
                  <div>
                    <Button
                      onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
                      className={`mr-3 ${currentIndex === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                      disabled={currentIndex === 0}
                    >
                      Previous
                    </Button>
                  </div>

                  <div>
                    {currentIndex < total - 1 ? (
                      <Button
                        onClick={() => setCurrentIndex((i) => Math.min(total - 1, i + 1))}
                        className={`btn-primary ${answers[currentQuestion?.uniqueId] === undefined ? 'opacity-50 cursor-not-allowed' : ''}`}
                        disabled={answers[currentQuestion?.uniqueId] === undefined}
                      >
                        Next
                      </Button>
                    ) : (
                      <Button onClick={handleSubmit} className="bg-green-600 hover:bg-green-700 text-white">
                        Submit Test
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
