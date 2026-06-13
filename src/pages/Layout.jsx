import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar.jsx'

const FRAMES = [5, 2, 3, 1, 4, 6, 7, 8]

export default function Layout() {
  const navigate = useNavigate()

  const scrollTrack = (dir) => {
    const track = document.getElementById('frameTrack')
    if (track) track.scrollBy({ left: dir * 210, behavior: 'smooth' })
  }

  return (
    <div className="main">
      <Navbar />
      <div className="frame-wrapper">
        <button className="scroll-btn" aria-label="Scroll left" onClick={() => scrollTrack(-1)}>&#8592;</button>

        <div className="frame" id="frameTrack">
          {FRAMES.map(n => (
            <div
              key={n}
              id={`frame${n}`}
              onClick={() => navigate(`/snaps?frame=${n}`)}
            >
              <div className="slot"></div>
              <div className="slot"></div>
              <div className="slot"></div>
              <div className="slot"></div>
            </div>
          ))}
        </div>

        <button className="scroll-btn" aria-label="Scroll right" onClick={() => scrollTrack(1)}>&#8594;</button>
      </div>
    </div>
  )
}
