import React, { useEffect, useState } from 'react';
import api from '../api';
import Card from './ui/Card';

export default function Analytics() {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        const res = await api.get('/test/my-tests');
        setTests(res.data.tests || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const total = tests.length;
  const avg = total ? Math.round((tests.reduce((s, t) => s + (t.score || 0), 0) / total) * 10) / 10 : 0;
  const latest = tests[0] ? tests[0].score : 0;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Overall Analytics</h1>
      <div className="grid grid-cols-3 gap-4 mb-6">
        <Card className="p-4"> <div className="text-sm text-gray-500">Total Tests</div> <div className="text-2xl font-semibold">{total}</div> </Card>
        <Card className="p-4"> <div className="text-sm text-gray-500">Average Score</div> <div className="text-2xl font-semibold">{avg}</div> </Card>
        <Card className="p-4"> <div className="text-sm text-gray-500">Latest Score</div> <div className="text-2xl font-semibold">{latest}</div> </Card>
      </div>

      <h2 className="text-xl font-semibold mb-2">All Tests</h2>
      <div className="space-y-3">
        {tests.map((t) => (
          <Card key={t._id || t.id} className="flex justify-between items-center">
            <div>
              <div className="font-medium">{new Date(t.startedAt).toLocaleString()}</div>
              {t.finishedAt && <div className="text-sm text-gray-600">Score: {t.score}</div>}
            </div>
            <div className="text-sm text-gray-500">{t.finishedAt ? 'Finished' : 'In progress'}</div>
          </Card>
        ))}
      </div>
    </div>
  );
}
