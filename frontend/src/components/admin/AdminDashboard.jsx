import React, { useEffect, useState, useContext } from 'react';
import api from '../../api';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { AuthContext } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function AdminDashboard() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || user.email !== 'admin@gmail.com') {
      navigate('/signin');
      return;
    }
    const fetch = async () => {
      try {
        setLoading(true);
        const res = await api.get('/admin/users');
        setUsers(res.data.users || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [user, navigate]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
      <p className="mb-4">Total users: {users.length}</p>
      <div className="space-y-3">
        {loading ? <p>Loading...</p> : users.map((u) => (
          <Card key={u._id || u.id} className="p-4 flex justify-between items-center">
            <div>
              <div className="font-semibold">{u.name} ({u.email})</div>
              <div className="text-sm text-gray-600">Tests: {u.totalTests} — Avg score: {u.avgScore}</div>
            </div>
            <div>
              <Button onClick={() => navigate(`/admin/user/${u._id || u.id}`)} className="bg-blue-600 text-white">View</Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
