import React from 'react';

export default function Header({ sidebarOpen, setSidebarOpen }) {
  return (
    <header className="w-full bg-white border-b p-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button onClick={() => setSidebarOpen((s) => !s)} className="p-2">
          <div className="space-y-1">
            <span className="block w-6 h-0.5 bg-gray-800"></span>
            <span className="block w-6 h-0.5 bg-gray-800"></span>
            <span className="block w-6 h-0.5 bg-gray-800"></span>
          </div>
        </button>
        <h1 className="text-lg font-bold">Clinical Dementia Rating Test</h1>
      </div>
      <div className="text-sm text-gray-600">&nbsp;</div>
    </header>
  );
}
