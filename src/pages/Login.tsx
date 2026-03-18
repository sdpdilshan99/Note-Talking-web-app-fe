import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const { login, token, showAlert, message } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (token) {
      navigate('/'); 
    }
  }, [token, navigate]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
        const normalizedData = {...formData,email: formData.email.toLowerCase().trim() };

        const res = await API.post('auth/login', normalizedData);
        
        login(res.data, res.data.token);
        console.log("Logged in user data:",res.data);

        showAlert('success', 'Login successful!');
        //toast.success('Login successful!');
        navigate('/');
    } catch (error: any) {
        const errorMessage = error.response?.data?.message || 'Login failed!';
        showAlert('error', errorMessage);
        //toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">


      <div className="flex flex-col items-center bg-white shadow-2xl rounded-2xl p-10 md:w-200 w-full max-w-[450px] gap-6 border border-gray-100">

        {message && (
          <div className={`fixed top-5 right-5 z-50 animate-fade-in flex items-center gap-2 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded shadow-lg transition-opacity duration-300 ${
            message.type === 'success' 
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-700' 
              : 'bg-rose-50 border border-rose-200 text-rose-700'
          }`}>
            {/* Icon එකක් (optional) */}
            <span className="text-sm font-medium">{message.text}</span>
          </div>
        )}

        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-800">Welcome Back</h2>
          <p className="text-gray-500 mt-2 text-sm">Please enter your details to sign in</p>
        </div>

        <form onSubmit={handleSubmit} className="w-full">
          <div className="flex flex-col w-full gap-5">
            
            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="font-semibold text-gray-700 ml-1 text-sm">Email Address</label>
              <input 
                className="w-full border border-gray-300 rounded-lg py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all bg-white" 
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
                className="w-full border border-gray-300 rounded-lg py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all bg-white" 
                type="password" 
                placeholder="••••••••" 
                onChange={(e) => setFormData({...formData, password: e.target.value})} 
                required
              />
            </div>

            <div className="mt-2">
              <button 
                type="submit" 
                disabled={isSubmitting}
                className={`bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg w-full py-3 shadow-lg transition-all active:scale-[0.98] flex justify-center items-center ${
                  isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin h-5 w-5 mr-3 text-white" viewBox="0 0 24 24">
                       <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                       <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </>
                ) : 'Sign In'}
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