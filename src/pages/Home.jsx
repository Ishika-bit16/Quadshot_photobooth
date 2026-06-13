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
          <button onClick={() => navigate('/layout')}>Take a photo</button>
        </div>
      </div>
    </>
  )
}

