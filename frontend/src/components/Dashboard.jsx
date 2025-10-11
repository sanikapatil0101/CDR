// src/components/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

export default function Dashboard() {
  const navigate = useNavigate();
  const [tests, setTests] = useState([]);

  const fetchTests = async () => {
    try {
      const res = await api.get('/test/my-tests');
      setTests(res.data.tests);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchTests();
  }, []);

  const startTest = async () => {
    try {
      const res = await api.post('/test/start');
      navigate(`/test/${res.data.testId}`);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="page-container">
      <h2>Dashboard</h2>
      <button onClick={startTest}>Start New Test</button>

      <h3>Previous Tests:</h3>
      <ul>
        {tests.map(t => (
          <li key={t.id}>
            {new Date(t.startedAt).toLocaleString()} - 
            {t.finishedAt ? (
              <button onClick={() => navigate(`/result/${t.id}`)}>View Result</button>
            ) : (
              <button onClick={() => navigate(`/test/${t.id}`)}>Continue</button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
