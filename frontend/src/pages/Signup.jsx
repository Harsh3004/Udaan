import { useState } from "react";
import education from '../assets/Illustration/education.png'
import notes from '../assets/Illustration/notes.png'
import { IoEyeOff} from "react-icons/io5";
import { PiEyeDuotone } from "react-icons/pi";

export const Signup = () => {
  const [userType, setUserType] = useState('Student');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleInputChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      console.error("Passwords do not match");
      return;
    }

    console.log("Form submitted:", formData);
  };


  return (
    <div className="bg-[#000814] min-h-screen text-gray-200 font-sans">

      <main className="w-10/12 max-w-7xl mx-auto py-4">
        <div className="grid md:grid-cols-2 gap-16 items-start">
            
          <div className="hidden md:flex flex-col relative justify-center mt-10">
            <img
              src={notes}
              alt="Person coding on a laptop"
              className="rounded-xl"
              width={250}
            />
            <img
              src={education}
              alt="Person coding on a laptop"
              className="rounded-xl  ml-52"
              width={250}
              />
          </div>
          
          <div className="max-w-md z-50">
            <h1 className="text-3xl font-semibold mb-2">Welcome Back</h1>
            <p className="text-md text-rich-black-100 mb-2">
                Discover your passions,<br /> 
                <span className="font-edu italic font-bold text-blue-300">
                    Be Unstoppable
                </span>
            </p>

            <div className="bg-rich-black-800 p-1 rounded-full flex gap-1 mb-4 max-w-max z-50 cursor-pointer">
              <button
                onClick={() => setUserType('Student')}
                className={`px-6 py-1 rounded-full transition-colors text-base ${
                  userType === 'Student' ? 'bg-rich-black-900 text-white' : 'text-gray-400'
                }`}
              >
                Student
              </button>
              <button
                onClick={() => setUserType('Instructor')}
                className={`px-6 py-1 rounded-full transition-colors text-base ${
                  userType === 'Instructor' ? 'bg-rich-black-900 text-white' : 'text-gray-400'
                }`}
              >
                Instructor
              </button>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="flex gap-4">
                <div className="w-1/2">
                  <label htmlFor="firstName" className="block text-sm mb-1">
                    First Name 
                    <span className="text-red-500">*</span></label>
                  <input
                    type="text" id="firstName" name="firstName" required
                    value={formData.firstName} onChange={handleInputChange}
                    placeholder="Enter first name"
                    className="w-full bg-rich-black-800 border border-gray-700 rounded-lg px-3 py-1 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  />
                </div>
                <div className="w-1/2">
                  <label htmlFor="lastName" className="block text-sm mb-1">Last Name <span className="text-red-500">*</span></label>
                  <input
                    type="text" id="lastName" name="lastName" required
                    value={formData.lastName} onChange={handleInputChange}
                    placeholder="Enter last name"
                    className="w-full bg-rich-black-800 border border-gray-700 rounded-lg px-3 py-1 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm mb-1">Email Address <span className="text-red-500">*</span></label>
                <input
                  type="email" id="email" name="email" required
                  value={formData.email} onChange={handleInputChange}
                  placeholder="Enter email address"
                  className="w-full bg-rich-black-800 border border-gray-700 rounded-lg px-3 py-1 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm mb-1">Phone Number <span className="text-red-500">*</span></label>
                <div className="flex gap-2">
                    <select className="w-1/6 bg-rich-black-800 border border-gray-700 rounded-lg px-3 py-1 focus:outline-none focus:ring-2 focus:ring-yellow-400">
                        <option>+91</option>
                        <option>+1</option>
                    </select>
                    <input
                      type="tel" id="phone" name="phone" required
                      value={formData.phone} onChange={handleInputChange}
                      placeholder="12345 67890"
                      className="w-5/6 bg-rich-black-800 border border-gray-700 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    />
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-1/2 relative">
                  <label htmlFor="password" className="flex items-center gap-1 text-sm mb-1">
                    Create Password <span className="text-red-500">*</span>
                  </label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password" name="password" required
                    value={formData.password} onChange={handleInputChange}
                    placeholder="Enter Password"
                    className="w-full bg-rich-black-800 border border-gray-700 rounded-lg px-3 py-1 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="invisible lg:visible absolute right-4 top-8 text-gray-400">
                    {showPassword ? <IoEyeOff/> : <PiEyeDuotone/>}
                  </button>
                </div>
                 <div className="w-1/2 relative">
                  <label htmlFor="confirmPassword" className="block text-sm mb-1">Confirm Password <span className="text-red-500">*</span></label>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="confirmPassword" name="confirmPassword" required
                    value={formData.confirmPassword} onChange={handleInputChange}
                    placeholder="Enter Password"
                    className="w-full bg-rich-black-800 border border-gray-700 rounded-lg px-3 py-1 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="invisible lg:visible absolute right-4 top-8 text-gray-400">
                    {showConfirmPassword ? <IoEyeOff/> : <PiEyeDuotone/>}
                  </button>
                </div>
              </div>
              
              <button
                type="submit"
                className="w-full bg-yellow-50 text-rich-black-900 font-bold py-1 rounded-lg hover:bg-yellow-500 transition-all duration-300 text-lg mt-6"
              >
                Create Account
              </button>
            </form>
          </div>

        </div>
      </main>
    </div>
  );
}

