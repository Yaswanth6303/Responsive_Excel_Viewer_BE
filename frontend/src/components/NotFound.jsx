import React from 'react';
import { useNavigate } from 'react-router-dom';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-blue-900">404</h1>
        <div className="absolute rotate-12 transform">
          <span className="absolute top-0 -mt-32 text-gray-300 font-extrabold text-9xl opacity-20 select-none">
            404
          </span>
        </div>
        <h2 className="text-3xl font-bold text-blue-950 md:text-4xl mt-8">
          Oops! Page not found
        </h2>
        <p className="text-gray-600 mt-4 text-lg">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <button
          onClick={() => navigate('/')}
          className="mt-8 px-6 py-3 bg-yellow-600 text-white rounded-lg font-semibold
                     shadow-lg hover:bg-blue-950 transition duration-200 ease-in-out
                     transform hover:scale-105"
        >
          Back to Home
        </button>
      </div>
    </div>
  );
};

export default NotFound;