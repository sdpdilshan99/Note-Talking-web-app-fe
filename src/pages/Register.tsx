import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";


const Register = () => {
    const [formData,setFormData] = useState({
        name: "",
        email: "",
        password: "",
        conpassword: ""
    });
    const {token} = useAuth();
    const navigate = useNavigate();
    const [errors, setErrors] = useState({
        name: "",
        email: "",
        password: "",
        conpassword: ""
    });

    const validateForm = (name: string, value:string) => {
        let errorMessage = "";
        
        if(name=== "name" && value.length<3){
            errorMessage = "Name must be at least 3 characters long!";
        }

        if(name === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)){
            errorMessage = "Invalid email format!";
        }

        if(name === "password" && value.length<6){
            errorMessage = "Password must be at least 6 characters long!";
        }

        if(name === "conpassword" && value !== formData.password){
            errorMessage = "Passwords do not match!";
        }
        
        setErrors(prev => ({...prev, [name]: errorMessage}));
    }

     useEffect(() => {
        if (token) {
          navigate('/'); 
        }
      }, [token, navigate]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {name, value} = e.target;
        setFormData({...formData, [name]: value});
        validateForm(name, value);

    }
    console.log(formData);
    const handleSumbit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (formData.password !== formData.conpassword) {
            return toast.error("Passwords do not match!");
        }

        try {
            const dataToSubmit = {
                name: formData.name,
                email: formData.email.toLowerCase().trim(),
                password: formData.password
            };

            const res = await API.post('/auth/register', dataToSubmit);

            localStorage.setItem('token', res.data.token);
            toast.success('Registration successful!');

            navigate('/login');
        } catch (error: any) {
            toast.error('Registration failed!');
        }
    }

    
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-10">
  {/* Main Container */}
  <div className="flex flex-col items-center bg-white shadow-2xl rounded-2xl p-10 w-full md:w-200 max-w-[500px] gap-6 border border-gray-100">
    
    <div className="text-center">
      <h2 className="text-3xl font-extrabold text-gray-800">Register</h2>
      <p className="text-gray-500 mt-2">Create your account to get started</p>
    </div>

    <form onSubmit={handleSumbit} className="w-full">
      <div className="flex flex-col w-full gap-5">
        
        {/* Name Field */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="name" className="font-semibold text-gray-700 ml-1">Name</label>
          <input 
            name="name"
            className="w-full border border-gray-300 rounded-lg py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
            type="text" 
            placeholder="Enter your name" 
            onChange={handleChange} 
          />
           {errors.name && <span className="text-red-500 text-xs ml-1 font-medium italic">{errors.name}</span>}
        </div>

        {/* Email Field */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="email" className="font-semibold text-gray-700 ml-1">Email</label>
          <input 
            name="email"
            className="w-full border border-gray-300 rounded-lg py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
            type="email" 
            placeholder="example@mail.com" 
            onChange={handleChange} 
          />
        </div>

        {/* Password Field */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="password" className="font-semibold text-gray-700 ml-1">Password</label>
          <input 
            name='password'
            className="w-full border border-gray-300 rounded-lg py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
            type="password" 
            placeholder="••••••••" 
            onChange={handleChange} 
          />
        </div>

        {/* Confirm Password Field */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="conpassword" className="font-semibold text-gray-700 ml-1">Confirm Password</label>
          <input 
            name="conpassword"
            className="w-full border border-gray-300 rounded-lg py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
            type="password" 
            placeholder="••••••••" 
            onChange={handleChange} 
          />
          {errors.conpassword && <span className="text-red-500 text-xs ml-1 font-medium italic">{errors.conpassword}</span>}
        </div>

        {/* Register Button */}
        <div className="mt-2">
          <button 
            type="submit" 
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg w-full py-3 shadow-md transition-all active:scale-95"
          >
            Create Account
          </button>
        </div>

        <p className="text-center text-sm text-gray-600 mt-2">
          Already have an account? <a href="/login" className="text-blue-600 font-bold hover:underline">Login</a>
        </p>

      </div>
    </form>
  </div>
</div>
    )
}

export default Register;