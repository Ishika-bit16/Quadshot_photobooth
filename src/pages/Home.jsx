import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar.jsx'

const LETTERS = ['P','H','O','T','O','B','O','O','T','H']

export default function Home() {
  const navigate = useNavigate()
  const [hovered, setHovered] = useState(null)

  const getClass = (i) => {
    if (hovered === null) return ''
    if (i === hovered) return 'bubble'
    if (Math.abs(i - hovered) === 1) return 'neighbour'
    if (Math.abs(i - hovered) === 2) return 'far-neighbour'
    return ''
  }
  const handleClick = () => {
  setTimeout(() => navigate('/Snaps'), 300);
};

  return (
    <>
      <section id="announcement">
        <div id="holder">
          <header id="header_announcement"><p>Make sure to give the feedback</p></header>
        </div>
      </section>

      <Navbar />

      <div id="hero-section">
        <div id="photobooth" onMouseLeave={() => setHovered(null)}>
          <span>
            {LETTERS.map((letter, i) => (
              <span
                key={i}
                className={getClass(i)}
                onMouseEnter={() => setHovered(i)}
              >
                {letter}
              </span>
            ))}
          </span>
        </div>
       
<div id="button_one">
  <button className="flip-btn" onClick={() => navigate('/Snaps')}>
    <div className="flip-inner">
      <div className="flip-front">
        <span>Take a photo !</span>
      </div>
     <div className="flip-back">
  <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 3h6l1.5 2H20a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h3.5L9 3z"/>
    <circle cx="12" cy="13" r="4"/>
    <circle cx="18" cy="8.5" r="0.5" fill="currentColor" stroke="none"/>
  </svg>
</div>
    </div>
  </button>
</div>     </div>
    
    </>
  )
}

 