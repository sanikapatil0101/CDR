import React from 'react';

export default function Footer() {
  return (
    <footer className="w-full bg-white border-t p-4 text-center text-sm text-gray-600">
      © {new Date().getFullYear()} Clinical Dementia Rating — Built with care
    </footer>
  );
}
