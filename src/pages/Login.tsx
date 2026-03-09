import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    console.log("Logging in with:", formData);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="flex flex-col items-center bg-white shadow-2xl rounded-2xl p-10 md:w-200 w-full max-w-[450px] gap-6 border border-gray-100">
        
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-800">Welcome Back</h2>
          <p className="text-gray-500 mt-2 text-sm">Please enter your details to sign in</p>
        </div>

        <form onSubmit={handleSubmit} className="w-full">
          <div className="flex flex-col w-full gap-5">
            
            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="font-semibold text-gray-700 ml-1 text-sm">Email Address</label>
              <input 
                className="w-full border border-gray-300 rounded-lg py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white" 
                type="email" 
                placeholder="example@mail.com" 
                onChange={(e) => setFormData({...formData, email: e.target.value})} 
                required
              />
            </div>


            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center ml-1">
                <label htmlFor="password" className="font-semibold text-gray-700 text-sm">Password</label>

                <a href="#" className="text-xs text-blue-600 hover:underline">Forgot password?</a>
              </div>
              <input 
                className="w-full border border-gray-300 rounded-lg py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white" 
                type="password" 
                placeholder="••••••••" 
                onChange={(e) => setFormData({...formData, password: e.target.value})} 
                required
              />
            </div>

            <div className="mt-2">
              <button 
                type="submit" 
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg w-full py-3 shadow-lg shadow-blue-100 transition-all active:scale-[0.98]"
              >
                Sign In
              </button>
            </div>

            <p className="text-center text-sm text-gray-600 mt-2">
              New to our platform?{' '}
              <Link to="/register" className="text-blue-600 font-bold hover:underline transition-all">
                Create Account
              </Link>
            </p>

          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;