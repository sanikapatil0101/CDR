// src/components/ResultPage.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';

export default function ResultPage() {
  const { testId } = useParams();
  const navigate = useNavigate(); // ✅ moved inside component
  const [result, setResult] = useState(null);

  useEffect(() => {
    const fetchResult = async () => {
      try {
        const res = await api.get(`/test/results/${testId}`);
        setResult(res.data.test);
      } catch (err) {
        console.error(err);
      }
    };
    fetchResult();
  }, [testId]);

  if (!result) return <div className="page-container">Loading...</div>;

  return (
    <div className="page-container">
      <h2>Test Result</h2>
      <p><strong>Score:</strong> {result.score}</p>
      <p>
        <strong>Severity:</strong> {result.score <= 9 ? 'None / Normal' :
          result.score <= 22 ? 'Questionable / Very Mild' :
          result.score <= 45 ? 'Mild' :
          result.score <= 67 ? 'Moderate' : 'Severe'}
      </p>

      <h3>Answers:</h3>
      <ul>
        {result.answers.map(a => (
          <li key={a.qId}>Question {a.qId}: {a.rating}</li>
        ))}
      </ul>

      {/* ✅ Back to Dashboard Button */}
      <div style={{ marginTop: 20 }}>
        <button
          onClick={() => navigate("/dashboard")}
          style={{
            padding: "10px 18px",
            background: "#28a745",
            color: "white",
            border: "none",
            borderRadius: 6,
            cursor: "pointer"
          }}
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );
}
