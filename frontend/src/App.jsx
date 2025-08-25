import { Routes,Route,Link } from "react-router-dom"
import { Home } from "./pages/Home"
import LightRays from "./assets/preComponents.jsx/LightRays"
import { NavBar } from "./components/NavBar"
import { Login } from "./pages/Login"
import { Signup } from "./pages/Signup"
import { About } from "./pages/About"
import { Contact } from "./pages/Contact"

export default function App() {
  return (
    <div className='w-full h-full overflow-hidden relative select-none bg-rich-black-900'>
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
        {/* <Route path="/" element={<Home/>}/> */}
        <Route path="/" element={<Home/>}/>
        <Route path="/about" element={<About/>}/>
        <Route path="/contact" element={<Contact/>}/>
        <Route path="/login" element={<Login/>}/>
        <Route path="/signup" element={<Signup/>}/>
      </Routes>
    </div>
  )
}