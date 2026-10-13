import { useEffect, useRef, useState } from 'react'
import '../css/about.css'   // adjust the path if your CSS lives somewhere else
import Navbar from '../components/Navbar'

const ABOUT_SLIDES = [
  {
    tag: '01 / ABOUT US',
    title: 'The Magic of Four Snaps',
    text: 'QuadShot was crafted to bring the warm, candid nostalgia of Korean photobooths right to your screen.\n\nSnap four spontaneous moments, customize with dreamy frames and stickers, and keep your sweetest memories alive forever.',
    image: '/about-polaroid.jpg',
    alt: 'Vintage photobooth snapshot',
  },
  {
    tag: '02 / HOW IT WORKS',
    title: 'Snap, Style & Cherish',
    text: '1. Hit "Take a photo" and strike your favourite poses as the timer counts.\n2. Choose from rich frame colors and live creative filters.\n3. Add stickers and save your high-resolution photostrip in seconds.',
    image: '/Stickers/qs-photostrips.png',
    alt: 'Quadshot photostrips',
  },
  {
    tag: '03 / PRIVATE & LOCAL',
    title: 'Your Photos Stay Strictly Yours',
    text: 'Everything happens 100% locally in your browser.\n\nNo accounts, no tracking, and zero cloud uploads. Your photos are never stored on any server and remain strictly yours.',
    image: '/Stickers/qs-lock.png',
    alt: 'Private and secure',
  },
]

export default function About() {
  const [slideIndex, setSlideIndex] = useState(0)
  const wrapRef = useRef(null)

  // play the entrance animation once, when the section scrolls into view
  useEffect(() => {
    const el = wrapRef.current
    if (!el) return
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        el.classList.add('in')
        io.disconnect()
      }
    }, { threshold: 0.25 })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  const nextSlide = () => setSlideIndex((prev) => (prev + 1) % ABOUT_SLIDES.length)
  const prevSlide = () => setSlideIndex((prev) => (prev - 1 + ABOUT_SLIDES.length) % ABOUT_SLIDES.length)

  const activeSlide = ABOUT_SLIDES[slideIndex]
  const isSticker = activeSlide.image.includes('/Stickers/')

  return (
    <div className="page-container about-page-container">
      <Navbar />
      <div className="section-wrap" id="about" ref={wrapRef}>
        <h2 className="section-title">ABOUT</h2>

        <div className="about-lavender-card">
          <img src="/Stickers/qs-bow.png" alt="Ribbon Bow" className="card-sticker-bow" />
          <img src="/Stickers/qs-lock.png" alt="Heart Lock" className="card-sticker-lock" />

          <div className="about-slide-viewport">
            <div key={slideIndex} className="about-slide-content">
              <div className="polaroid-wrapper">
                <div className="polaroid-card">
                  <div className="polaroid-tape" />
                  <img
                    src={activeSlide.image}
                    alt={activeSlide.alt}
                    className={`polaroid-photo${isSticker ? ' is-sticker' : ''}`}
                  />
                </div>
              </div>

              <div className="about-notes-wrapper">
                <span className="about-slide-badge">{activeSlide.tag}</span>
                <h3 className="about-notes-title">{activeSlide.title}</h3>
                <div className="about-ruled-sheet">
                  <p className="about-text">{activeSlide.text}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="about-slide-controls">
            <button type="button" className="about-nav-btn" onClick={prevSlide} aria-label="Previous slide">‹</button>

            <div className="about-slide-dots">
              {ABOUT_SLIDES.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  className={`slide-dot ${idx === slideIndex ? 'active' : ''}`}
                  onClick={() => setSlideIndex(idx)}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>

            <button type="button" className="about-nav-btn" onClick={nextSlide} aria-label="Next slide">›</button>
          </div>
        </div>
      </div>
    </div>
  )
}