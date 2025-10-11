import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import { AuthContext } from "../context/AuthContext";

/**
 * TestPage:
 * - GET /api/test/questions → returns domain-structured questions
 * - GET /api/test/my-tests → returns previous tests
 * - POST /api/test/start → starts new test (only if no active one)
 * - POST /api/test/submit → submits answers
 */
export default function TestPage() {
  const { token } = useContext(AuthContext);
  const [groupedQuestions, setGroupedQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [testId, setTestId] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // 🔹 Fetch questions once
useEffect(() => {
  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const res = await api.get("/test/questions");
      const domainArray = res.data.questions || [];

      const seen = new Set();
      const groups = domainArray.map((domainObj, dIdx) => {
        const domainName = domainObj.domain || `Domain ${dIdx + 1}`;
        const qs = (domainObj.questions || []).map((q, qIdx) => {
          const baseQid = q.id || `q-${dIdx}-${qIdx}`;
          let uniqueId = baseQid;
          let suffix = 1;
          while (seen.has(uniqueId)) uniqueId = `${baseQid}-${suffix++}`;
          seen.add(uniqueId);
          return {
            uniqueId,
            qId: q.id || baseQid,
            text: q.text || q.question || "No text provided",
          };
        });
        return { domain: domainName, questions: qs };
      });

      setGroupedQuestions(groups);
    } catch (err) {
      console.error("Failed to fetch questions:", err);
      setGroupedQuestions([]);
    } finally {
      setLoading(false);
    }
  };

  if (token) fetchQuestions();
}, [token]);


  // 🔹 Start or resume test session
  useEffect(() => {
  const startOrResumeTest = async () => {
    try {
      const res = await api.get("/test/my-tests"); // fetch all tests for user
      const tests = res.data.tests || [];

      // look for unfinished test first
      const unfinished = tests.find(t => !t.finishedAt);

      if (unfinished) {
        console.log("Resuming unfinished test:", unfinished.id);
        setTestId(unfinished.id);
      } else {
        // only create new if none exists
        const newTest = await api.post("/test/start");
        console.log("Starting new test:", newTest.data.testId);
        setTestId(newTest.data.testId);
      }
    } catch (err) {
      console.error("Failed to start/resume test:", err);
    }
  };

  if (token) startOrResumeTest();
}, [token]);

  // 🔹 Handle answer change per question
  const handleChange = (uniqueId, value) => {
    const num = parseFloat(value);
    setAnswers((prev) => ({ ...prev, [uniqueId]: num }));
  };

  // 🔹 Local result computation
  const computeLocalResults = () => {
    const allQuestions = groupedQuestions.flatMap((g) => g.questions);
    const totalQuestions = allQuestions.length;
    const maxScore = totalQuestions * 3;
    let total = 0;

    allQuestions.forEach((q) => {
      const r = answers[q.uniqueId];
      total += typeof r === "number" ? r : 0;
    });

    const percent = (total / (maxScore || 1)) * 100;
    let severity = "";
    if (percent <= 10) severity = "None / Normal";
    else if (percent <= 25) severity = "Questionable / Very Mild";
    else if (percent <= 50) severity = "Mild";
    else if (percent <= 75) severity = "Moderate";
    else severity = "Severe";

    const domainResults = groupedQuestions.map((group) => {
      const domainTotal = group.questions.reduce((acc, q) => {
        const r = answers[q.uniqueId];
        return acc + (typeof r === "number" ? r : 0);
      }, 0);
      const domainMax = group.questions.length * 3;
      const domainPercent = (domainTotal / (domainMax || 1)) * 100;
      let domainSeverity = "";
      if (domainPercent <= 10) domainSeverity = "None";
      else if (domainPercent <= 25) domainSeverity = "Questionable";
      else if (domainPercent <= 50) domainSeverity = "Mild";
      else if (domainPercent <= 75) domainSeverity = "Moderate";
      else domainSeverity = "Severe";

      return {
        domain: group.domain,
        score: domainTotal,
        max: domainMax,
        percent: Math.round(domainPercent * 100) / 100,
        severity: domainSeverity,
      };
    });

    return {
      totalScore: Math.round(total * 100) / 100,
      maxScore,
      percent: Math.round(percent * 100) / 100,
      severity,
      domainResults,
    };
  };

  // 🔹 Submit test
  const handleSubmit = async () => {
    const allQuestions = groupedQuestions.flatMap((g) => g.questions);
    const answersArray = allQuestions.map((q) => ({
      qId: q.qId,
      rating: typeof answers[q.uniqueId] === "number" ? answers[q.uniqueId] : 0,
    }));

    const localRes = computeLocalResults();

    try {
      await api.post("/test/submit", {
  testId,
  answers: answersArray,
  finishedAt: new Date().toISOString()  
});

      alert(`Submitted! Score: ${localRes.totalScore} (${localRes.severity})`);
      navigate(`/result/${testId}`);
    } catch (err) {
      console.error("Submit failed:", err);
      alert("Submit failed. Please try again.");
    }
  };

  // 🔹 UI Rendering
  if (loading) return <div className="page-container">Loading questions...</div>;
  if (!groupedQuestions.length)
    return <div className="page-container">No questions found.</div>;

  return (
    <div className="page-container">
      <h2>CDR Test</h2>

      {groupedQuestions.map((group) => (
        <section key={group.domain} style={{ marginBottom: 24 }}>
          <h3 style={{ marginBottom: 8 }}>{group.domain}</h3>

          {group.questions.map((q) => (
            <div
              key={q.uniqueId}
              style={{
                padding: 10,
                borderRadius: 8,
                background: "#fafafa",
                marginBottom: 10,
              }}
            >
              <div style={{ marginBottom: 8 }}>{q.text}</div>

              {/* Inline Radio Options */}
              <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                {[
                  { label: "None (0)", val: 0 },
                  { label: "Questionable (0.5)", val: 0.5 },
                  { label: "Mild (1)", val: 1 },
                  { label: "Moderate (2)", val: 2 },
                  { label: "Severe (3)", val: 3 },
                ].map((opt) => (
                  <label
                    key={opt.val}
                    style={{ display: "flex", alignItems: "center", gap: 6 }}
                  >
                    <input
                      type="radio"
                      name={`r-${q.uniqueId}`}
                      value={opt.val}
                      checked={answers[q.uniqueId] === opt.val}
                      onChange={(e) =>
                        handleChange(q.uniqueId, e.target.value)
                      }
                    />
                    {opt.label}
                  </label>
                ))}
              </div>
            </div>
          ))}
        </section>
      ))}

      <div style={{ marginTop: 18 }}>
        <button
          onClick={handleSubmit}
          style={{
            padding: "10px 18px",
            background: "#007bff",
            color: "white",
            border: "none",
            borderRadius: 6,
          }}
        >
          Submit Test
        </button>
      </div>
    </div>
  );
}
