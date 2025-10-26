import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import { AuthContext } from "../context/AuthContext";
import Button from "./ui/Button";
import Card from "./ui/Card";

export default function Dashboard() {
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return navigate("/signin");

    const fetchTests = async () => {
      try {
        setLoading(true);
        const res = await api.get("/test/my-tests");
  setTests(res.data.tests || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchTests();
  }, [token, navigate]);

  const startTest = async () => {
    if (!token) return navigate("/signin");
    try {
      const res = await api.post("/test/start");
      navigate(`/test/${res.data.testId}`);
    } catch (err) {
      console.error(err);
      alert("Failed to start test.");
    }
  };

  const hasPending = tests.some((t) => !t.finishedAt);

  return (
    <div className="min-h-screen bg-blue-50 p-6">
      <h1 className="text-3xl font-bold text-center mb-6">Dashboard</h1>

      <div className="text-center mb-8">
        <Button
          onClick={startTest}
          className={`bg-blue-500 hover:bg-blue-600 text-white ${hasPending ? "opacity-50 cursor-not-allowed" : ""}`}
          disabled={hasPending}
        >
          Start New Test
        </Button>
      </div>

      <h2 className="text-2xl font-semibold mb-4">Previous Tests</h2>
      {loading ? (
        <p className="text-center text-gray-500">Loading...</p>
      ) : tests.length === 0 ? (
        <p className="text-center text-gray-500">No tests taken yet.</p>
      ) : (
        <div className="space-y-4">
          {tests.map((t) => (
            <Card key={t._id || t.id} className="flex justify-between items-center">
              <div>
                <p className="font-medium text-gray-700">
                  {new Date(t.startedAt).toLocaleString()}
                </p>
                {t.finishedAt && <p className="text-gray-500">Score: {t.score}</p>}
              </div>

              {t.finishedAt ? (
                <Button
                  onClick={() => navigate(`/result/${t._id || t.id}`)}
                  className="bg-green-500 hover:bg-green-600 text-white"
                >
                  View Result
                </Button>
              ) : (
                <Button
                  onClick={() => navigate(`/test/${t._id || t.id}`)}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white"
                >
                  Continue
                </Button>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
