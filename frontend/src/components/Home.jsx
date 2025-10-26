import React from 'react';
import { Link } from 'react-router-dom';
import Button from './ui/Button';
import Card from './ui/Card';

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: 'linear-gradient(180deg, #f0fbfd 0%, #f7fbff 100%)' }}>
      <div className="w-full max-w-6xl grid grid-cols-2 gap-8 items-center">
        <div className="space-y-6">
          <h1 className="text-4xl font-extrabold leading-tight">Clinical Dementia Rating</h1>
          <p className="text-lg text-gray-600">A lightweight clinical tool to assess cognitive and functional performance. Designed for clinicians and caretakers to quickly capture structured observations.</p>

          <div className="flex gap-4">
            <Link to="/signin">
              <Button className="btn-primary px-8 py-4 rounded-lg">Sign In</Button>
            </Link>
            <Link to="/signup">
              <Button className="px-8 py-4 rounded-lg border border-gray-200">Sign Up</Button>
            </Link>
          </div>

          <div className="mt-6 text-sm text-gray-500">Quick actions: Start test • Resume saved • View results</div>
        </div>

        <div className="flex justify-center">
          <Card className="p-8 w-full max-w-md" style={{ borderRadius: 20 }}>
            <div className="flex flex-col items-center text-center">
              <svg width="96" height="96" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="8" r="3" fill="var(--primary)" />
                <path d="M4 20c0-3.3137 2.6863-6 6-6h4c3.3137 0 6 2.6863 6 6" stroke="rgba(15,23,42,0.08)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <h3 className="text-xl font-semibold mt-4">Patient / Clinician</h3>
              <p className="text-sm text-gray-600 mt-2">Use the simple guided flow to capture observations — mobile-friendly and quick.</p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
