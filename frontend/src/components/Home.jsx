import React from 'react';
import { Link } from 'react-router-dom';
import Button from './ui/Button';
import Card from './ui/Card';

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-cyan-50 via-blue-50 to-teal-50">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Left Content */}
        <div className="space-y-8 animate-fade-in-up">
          <div className="space-y-4">
            <h1 className="text-5xl font-bold leading-tight bg-gradient-to-r from-cyan-600 to-blue-700 bg-clip-text text-transparent">
              Clinical Dementia Rating
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed">
              A comprehensive clinical tool to assess cognitive and functional performance. 
              Designed for healthcare professionals to efficiently evaluate and monitor patient outcomes.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link to="/signin" className="group">
              <Button className="px-10 py-4 rounded-xl text-lg font-semibold shadow-2xl group-hover:shadow-3xl transition-all duration-300">
                Sign In
              </Button>
            </Link>
            <Link to="/signup" className="group">
              <Button className="px-10 py-4 rounded-xl text-lg font-semibold bg-white/80 text-cyan-600 border-2 border-cyan-200 hover:bg-white hover:border-cyan-300 hover:shadow-2xl transition-all duration-300">
                Sign Up
              </Button>
            </Link>
          </div>

          <div className="flex items-center gap-6 text-sm text-cyan-600 font-medium">
            <span className="flex items-center gap-2 hover:text-cyan-700 cursor-pointer transition-colors">
              <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
              Start New Assessment
            </span>
            <span className="flex items-center gap-2 hover:text-cyan-700 cursor-pointer transition-colors">
              <div className="w-2 h-2 bg-teal-400 rounded-full"></div>
              Resume Saved
            </span>
            <span className="flex items-center gap-2 hover:text-cyan-700 cursor-pointer transition-colors">
              <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
              View Results
            </span>
          </div>
        </div>

        {/* Right Card */}
        <div className="flex justify-center animate-float">
          <Card className="p-10 w-full max-w-md bg-gradient-to-br from-white to-blue-50/50 border border-blue-100/50">
            <div className="flex flex-col items-center text-center space-y-6">
              {/* Medical-themed SVG */}
              <div className="relative">
                <div className="w-24 h-24 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M14 16H10M12 14V18M8 20H16C17.1046 20 18 19.1046 18 18V6C18 4.89543 17.1046 4 16 4H8C6.89543 4 6 4.89543 6 6V18C6 19.1046 6.89543 20 8 20Z" 
                          stroke="white" strokeWidth="2" strokeLinecap="round"/>
                    <path d="M10 4V3C10 2.44772 10.4477 2 11 2H13C13.5523 2 14 2.44772 14 3V4" 
                          stroke="white" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-teal-400 rounded-full flex items-center justify-center shadow-lg">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 12L11 14L15 10M12 3C13.1819 3 14.3522 3.23279 15.4442 3.68508C16.5361 4.13738 17.5282 4.80031 18.364 5.63604C19.1997 6.47177 19.8626 7.46392 20.3149 8.55585C20.7672 9.64778 21 10.8181 21 12C21 13.1819 20.7672 14.3522 20.3149 15.4442C19.8626 16.5361 19.1997 17.5282 18.364 18.364C17.5282 19.1997 16.5361 19.8626 15.4442 20.3149C14.3522 20.7672 13.1819 21 12 21C10.8181 21 9.64778 20.7672 8.55585 20.3149C7.46392 19.8626 6.47177 19.1997 5.63604 18.364C4.80031 17.5282 4.13738 16.5361 3.68508 15.4442C3.23279 14.3522 3 13.1819 3 12C3 9.61305 3.94821 7.32387 5.63604 5.63604C7.32387 3.94821 9.61305 3 12 3Z" 
                          stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
              
              <div className="space-y-3">
                <h3 className="text-2xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
                  Healthcare Professional
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Streamlined assessment flow designed for clinical efficiency. 
                  Mobile-optimized interface for quick patient evaluations.
                </p>
              </div>
              
              <div className="flex gap-4 text-sm font-medium">
                <span className="px-3 py-1 bg-cyan-100 text-cyan-700 rounded-full">Clinician</span>
                <span className="px-3 py-1 bg-teal-100 text-teal-700 rounded-full">Patient</span>
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full">Caregiver</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}