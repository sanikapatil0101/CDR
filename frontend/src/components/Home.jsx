import React from 'react';
import { Link } from 'react-router-dom';
import Card from './ui/Card';
import Button from './ui/Button';

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-50 p-4">
      <Card className="w-full max-w-md p-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Welcome to Clinical Dementia Rating</h1>
        <p className="text-gray-600 mb-6">Take a quick test or review past results.</p>

        <div className="flex flex-col gap-3">
          <Link to="/signin">
            <Button className="w-full bg-blue-500 hover:bg-blue-600 text-white">Sign In</Button>
          </Link>
          <Link to="/signup">
            <Button className="w-full bg-gray-100 border hover:bg-gray-200">Sign Up</Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
