import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Landing = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-800 mb-6">
            Ace Your Next Interview with AI
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Upload your resume and job description. Practice with AI-powered interview questions
            tailored to your experience and get instant feedback.
          </p>

          {user ? (
            <div className="flex justify-center gap-4">
              <Link
                to="/upload"
                className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition shadow-lg"
              >
                Upload Documents
              </Link>
              <Link
                to="/chat"
                className="bg-white text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-50 transition shadow-lg border-2 border-blue-600"
              >
                Start Practice
              </Link>
            </div>
          ) : (
            <div className="flex justify-center gap-4">
              <Link
                to="/signup"
                className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition shadow-lg"
              >
                Get Started Free
              </Link>
              <Link
                to="/login"
                className="bg-white text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-50 transition shadow-lg border-2 border-blue-600"
              >
                Login
              </Link>
            </div>
          )}
        </div>

        <div className="mt-20 grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="text-4xl mb-4">📄</div>
            <h3 className="text-xl font-bold mb-2">Upload Documents</h3>
            <p className="text-gray-600">
              Upload your resume and the job description you're applying for in PDF format.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="text-4xl mb-4">🤖</div>
            <h3 className="text-xl font-bold mb-2">AI Interview Questions</h3>
            <p className="text-gray-600">
              Get personalized interview questions generated from the job description.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-xl font-bold mb-2">Instant Feedback</h3>
            <p className="text-gray-600">
              Receive AI-powered evaluation and scores based on your resume and responses.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;
