import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home.jsx'
import Snaps from './pages/Snaps.jsx'
import About from './pages/About.jsx'
import Contact from './pages/Contact.jsx'
import Decor from './pages/Decor.jsx'

export default function App() {
  return (
    <Routes>
      <Route path="/"        element={<Home />} />
      <Route path="/snaps"   element={<Snaps />} />
      <Route path="/Decor"   element={<Decor />} />
      <Route path="/about"   element={<About />} />
      <Route path="/contact" element={<Contact />} />
    </Routes>
  )
}

