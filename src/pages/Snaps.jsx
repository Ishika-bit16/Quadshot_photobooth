import { useState, useEffect, useRef, useCallback } from 'react'
import Navbar from '../components/Navbar.jsx'

const FILTERS = {
  none:      'none',
  grayscale: 'grayscale(100%)',
  sepia:     'sepia(100%)',
  saturate:  'saturate(200%) hue-rotate(10deg)',
  cool:      'hue-rotate(180deg) saturate(130%)',
  invert:    'invert(100%)',
}

const FILTER_KEYS = Object.keys(FILTERS)
const TOTAL_SHOTS = 4

export default function Snaps() {
  const videoRef    = useRef(null)
  const canvasRef   = useRef(null)
  const flashRef    = useRef(null)

  const [currentFilter, setCurrentFilter] = useState('none')
  const [cameraReady,   setCameraReady]   = useState(false)
  const [isCounting,    setIsCounting]    = useState(false)
  const [camPrompt,     setCamPrompt]     = useState(true)
  const [snaps,         setSnaps]         = useState([])          // array of dataURLs
  const [countdown,     setCountdown]     = useState(null)        // { label, number }
  const [lightbox,      setLightbox]      = useState(null)        // { src, index }

  // Apply live filter to video element
  useEffect(() => {
    if (!videoRef.current) return
    videoRef.current.style.filter = currentFilter === 'none' ? '' : FILTERS[currentFilter]
  }, [currentFilter])

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false })
      videoRef.current.srcObject = stream
      await videoRef.current.play()
      setCamPrompt(false)
      videoRef.current.addEventListener('loadedmetadata', () => setCameraReady(true), { once: true })
    } catch (err) {
      alert('Could not access camera. Please allow camera permission in your browser settings.')
    }
  }

  const triggerFlash = () => {
    if (!flashRef.current) return
    flashRef.current.classList.add('active')
    setTimeout(() => flashRef.current?.classList.remove('active'), 300)
  }

  const takeSnap = useCallback(() => {
    const video  = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas) return
    const w = video.videoWidth
    const h = video.videoHeight
    if (!w || !h) return
    canvas.width  = w
    canvas.height = h
    const ctx = canvas.getContext('2d')
    ctx.filter = FILTERS[currentFilter] || 'none'
    ctx.drawImage(video, 0, 0, w, h)
    ctx.filter = 'none'
    const dataURL = canvas.toDataURL('image/png')
    triggerFlash()
    setSnaps(prev => [...prev, dataURL])
  }, [currentFilter])

  const capturePhoto = useCallback(() => {
    if (!cameraReady) { alert('Please enable the camera first!'); return }
    if (isCounting) return
    setSnaps([])
    setIsCounting(true)

    let shotsTaken = 0

    const runNextShot = () => {
      if (shotsTaken >= TOTAL_SHOTS) {
        setIsCounting(false)
        setCountdown({ label: 'Done! 🎞️', number: '' })
        setTimeout(() => setCountdown(null), 1200)
        return
      }

      let count = 3
      setCountdown({ label: `${shotsTaken + 1} / ${TOTAL_SHOTS}`, number: count })

      const timer = setInterval(() => {
        count--
        if (count > 0) {
          setCountdown({ label: `${shotsTaken + 1} / ${TOTAL_SHOTS}`, number: count })
        } else {
          clearInterval(timer)
          setCountdown(null)
          takeSnap()
          shotsTaken++
          setTimeout(runNextShot, 800)
        }
      }, 1000)
    }

    runNextShot()
  }, [cameraReady, isCounting, takeSnap])

  return (
    <div id="snap">
      <div>
        <Navbar />
      </div>

      <div className="card">
        <div className="wordmark"></div>

        {/* Viewfinder */}
        <div className="viewfinder">
          <video ref={videoRef} id="video" autoPlay playsInline muted  />
          <canvas ref={canvasRef} id="canvas" style={{ display: 'none' }} />

          {/* Flash overlay */}
          <div className="flash" ref={flashRef} id="flash"></div>

          {/* Countdown */}
          {countdown && (
            <div className="countdown visible" id="countdown">
              <span className="shot-label">{countdown.label}</span>
              {countdown.number !== '' && <span className="shot-number">{countdown.number}</span>}
            </div>
          )}

          {/* Camera prompt */}
          {camPrompt && (
            <div className="cam-prompt" id="camPrompt">
              <img id="camera" src="/assets/images/camera.png" alt="camera icon" className="cam-icon" />
              <p>Camera access needed</p>
              <button onClick={startCamera}>Enable Camera</button>
            </div>
          )}
        </div>

        {/* Filter row */}
        <div className="filter-row">
          <div className="filter-pill">
            {FILTER_KEYS.map(key => (
              <button
                key={key}
                className={`filter-btn${currentFilter === key ? ' active' : ''}`}
                data-filter={key}
                title={key}
                onClick={() => setCurrentFilter(key)}
              >
                <div className="swatch"></div>
              </button>
            ))}
          </div>
        </div>

        {/* Snap button */}
        <div className="snap-wrap">
          <button
            className="snap-btn"
            id="snapBtn"
            onClick={capturePhoto}
            disabled={isCounting}
          >
            Snap
          </button>
        </div>

        {/* Photo strip */}
        <div className={`strip${snaps.length ? ' has-photos' : ''}`} id="strip">
          {snaps.map((src, i) => (
            <div key={i} className="strip-item">
              <img
                src={src}
                alt={`Snap ${i + 1}`}
                className="snap-thumb"
                onClick={() => setLightbox({ src, index: i + 1 })}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div className="lightbox open" id="lightbox" onClick={e => { if (e.target.id === 'lightbox') setLightbox(null) }}>
          <button className="lb-close" onClick={() => setLightbox(null)}>✕</button>
          <img src={lightbox.src} alt="snap" />
          <a className="lb-dl" href={lightbox.src} download={`quadshot-${lightbox.index}.png`}>Download</a>
        </div>
      )}
    </div>
  )
}