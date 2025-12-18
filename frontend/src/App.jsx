import { Routes,Route,Link } from "react-router-dom"
import { Home } from "./pages/Home"
import LightRays from "./assets/preComponents.jsx/LightRays"
import { NavBar } from "./components/NavBar"
import { Login } from "./components/Auth/Login"
import { Signup } from "./components/Auth/Signup"
import { About } from "./pages/About"
import { Contact } from "./pages/Contact"
import { Dashboard } from "./pages/Dashboard"
import { Otp } from "./components/Auth/Otp"
import { Error } from "./pages/Error"
import Browse from "./pages/Browse"
import { Toaster } from 'react-hot-toast';
import ForgotPassword from "./components/Auth/ForgotPassword"
import { UpdatePassword } from "./components/Auth/UpdatePassword"
import { Profile } from "./components/Dasboard/Profile"
import EnrolledCourses from "./components/Dasboard/EnrolledCourses"
import ProtectedRoute from "./components/Auth/ProtectedRoute"
import PurschasedHistory from "./components/Dasboard/PurchasedHistory"
import Setting from "./components/Dasboard/Setting"
import AddCourse from "./components/Dasboard/AddCourse/AddCourse"
import { MyCourses } from "./components/Dasboard/MyCourses"

export default function App() {
  console.log("VITE_BASE_URL =", import.meta.env.VITE_BASE_URL);
  return (

    <div className='w-full min-h-screen overflow-x-hidden relative select-none bg-rich-black-900'>
      <div style={{ width: '100%', height: '100%', position: 'absolute'}}>
        <LightRays
          raysOrigin="top-center"
          raysColor="#ffffff"
          raysSpeed={1.5}
          lightSpread={0.8}
          rayLength={1.2}
          followMouse={true}
          mouseInfluence={0.1}
          noiseAmount={0.1}
          distortion={0.05}
          className="custom-rays"
        />
      </div>

      <NavBar />
      
      <Routes>
        <Route path="/" element={<Home/>}/>
        <Route path="/about" element={<About/>}/>
        <Route path="/contact" element={<Contact/>}/>
        <Route path="/login" element={<Login/>}/>
        <Route path="/signup" element={<Signup/>}/>
        <Route path="/otp" element={<Otp/>}/>
        <Route path="/error" element={<Error/>}/>
        <Route path="/browse" element={<Browse/>}/>
        <Route path="/login/forgot-password" element={<ForgotPassword/>}/>
        <Route path="/update-password/:token" element={<UpdatePassword/>} />

        <Route path="/dashboard" element={
          <ProtectedRoute> 
            <Dashboard/>
          </ProtectedRoute>
        }>
          <Route path="/dashboard/my-profile" element={<Profile/>}/>
          <Route path="/dashboard/instructor" element={<Profile/>}/>
          <Route path="/dashboard/my-courses" element={<MyCourses/>}/>
          <Route path="/dashboard/add-course" element={<AddCourse/>}/>
          <Route path="/dashboard/enrolled-courses" element={<EnrolledCourses/>}/>
          <Route path="/dashboard/purchase-history" element={<PurschasedHistory/>}/>
          <Route path="/dashboard/setting" element={<Setting/>}/>
        </Route>

        <Route path="*" element={<Error/>}/>
      </Routes>

      <Toaster/>
    </div>
  )
}