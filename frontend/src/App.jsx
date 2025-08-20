import { Routes,Route,Link } from "react-router-dom"
import { Home } from "./pages/Home"

export default function App() {
  return (
    <div className='w-full h-full overflow-x-hidden'>
      <Routes>
        <Route path="/" element={<Home/>}/>
      </Routes>
    </div>
  )
}