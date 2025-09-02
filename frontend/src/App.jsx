import { Routes,Route,Link } from "react-router-dom"
import { Home } from "./pages/Home"
import LightRays from "./assets/preComponents.jsx/LightRays"
import { NavBar } from "./components/NavBar"
import { Login } from "./pages/Login"
import { Signup } from "./pages/Signup"
import { About } from "./pages/About"
import { Contact } from "./pages/Contact"
import { Dashboard } from "./pages/Dashboard"
import { Otp } from "./pages/Otp"
import { Error } from "./pages/Error"
import { Toaster } from 'react-hot-toast';
import ForgotPassword from "./pages/ForgotPassword"
import { UpdatePassword } from "./pages/UpdatePassword"
import { Profile } from "./components/Dasboard/Profile"

export default function App() {
  return (
    <div className='w-full min-h-screen overflow-hidden relative select-none bg-rich-black-900'>
      <div style={{ width: '100%', height: '600px', position: 'absolute'}}>
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
        <Route path="/login/forgot-password" element={<ForgotPassword/>}/>
        <Route path="/update-password/:token" element={<UpdatePassword/>} />

        <Route path="/dashboard" element={<Dashboard/>}>
          <Route path="/dashboard/my-profile" element={<Profile/>}/>
          <Route path="/dashboard/instructor" element={<Profile/>}/>
          <Route path="/dashboard/my-courses" element={<Profile/>}/>
          <Route path="/dashboard/add-course" element={<Profile/>}/>
          <Route path="/dashboard/enrolled-courses" element={<Profile/>}/>
          <Route path="/dashboard/purchase-history" element={<Profile/>}/>
        </Route>

        <Route path="*" element={<Error/>}/>
      </Routes>

      <Toaster/>
    </div>
  )
}