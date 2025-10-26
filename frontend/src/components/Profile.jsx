import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../api';
import Card from './ui/Card';
import Button from './ui/Button';

export default function Profile() {
  const { user, token } = useContext(AuthContext);
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
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
  }, [token]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Profile</h1>
      <Card className="p-4 mb-4">
        <p className="font-semibold">Name: {user?.name}</p>
        <p className="text-gray-600">Email: {user?.email}</p>
        <p className="text-gray-600">Total tests given: {tests.length}</p>
      </Card>

      <h2 className="text-xl font-semibold mb-2">Recent Tests</h2>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="space-y-3">
          {tests.map((t) => (
            <Card key={t._id || t.id} className="flex justify-between items-center">
              <div>
                <div className="font-medium">{new Date(t.startedAt).toLocaleString()}</div>
                {t.finishedAt && <div className="text-sm text-gray-600">Score: {t.score}</div>}
              </div>
              <Button onClick={() => window.location.href = `/result/${t._id || t.id}`} className="bg-green-500 text-white">View</Button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
