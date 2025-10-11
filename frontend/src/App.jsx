import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Signup from './components/Signup';
import Signin from './components/Signin';
import Dashboard from './components/Dashboard';
import TestPage from './components/TestPage';
import ResultPage from './components/ResultPage';
import { AuthContext } from './context/AuthContext';
import './App.css';

function App() {
  const { token } = useContext(AuthContext);
  try {
    return (
      <Router>
        <Routes>
          <Route path="/" element={token ? <Navigate to="/dashboard" /> : <Signin />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/signin" element={<Signin />} />
          <Route path="/dashboard" element={token ? <Dashboard /> : <Navigate to="/signin" />} />
          <Route path="/test/:testId" element={token ? <TestPage /> : <Navigate to="/signin" />} />
          <Route path="/result/:testId" element={token ? <ResultPage /> : <Navigate to="/signin" />} />
        </Routes>
      </Router>
    );
  } catch (err) {
    console.error('Error in App.jsx:', err);
    return <div style={{ color: 'red', padding: 20 }}>Something went wrong: {err.message}</div>;
  }
}

export default App;
