import { useState, useRef, useEffect, useCallback } from 'react'
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom'
import Navbar from '../components/Navbar.jsx'
import { roundRect, drawImageCover, loadImage, toDataURL } from "./canvasHelpers.js";

// Reference size of the photo strip (used for the PNG/SVG exports).
const REF_W = 142
const REF_H = 398

// ── Image-based frames (from public/Frames/) ──
const FRAME_IMAGES = [
  { id: 'none',   label: 'No Frame',       src: null },
  { id: 'frame1', label: 'Classic Cream',   src: '/Frames/transparent-image.png' },
  { id: 'frame2', label: 'Photo Studio',    src: '/Frames/transparent-image (1).png' },
  { id: 'frame3', label: 'Polka Dots',      src: '/Frames/transparent-image (2).png' },
  { id: 'frame4', label: 'Snap Express',    src: '/Frames/transparent-image (3).png' },
  { id: 'frame5', label: 'Cute Dotted',     src: '/Frames/transparent-image (4).png' },
  { id: 'frame6', label: 'Elegant',         src: '/Frames/transparent-image (5).png' },
  { id: 'frame7', label: 'Vintage',         src: '/Frames/transparent-image (6).png' },
  { id: 'frame8', label: 'Decorative',      src: '/Frames/transparent-image (7).png' },
]

// Fractional (0–1) heart outline
const HEART_FRACTION_PATH = 'M0.5,1 C-0.1,0.55 0.05,-0.05 0.5,0.28 C0.95,-0.05 1.1,0.55 0.5,1 Z'

const STICKERS = ['/Stickers/png.svg', ...Array.from({ length: 167 }, (_, i) => `/Stickers/png-${i + 1}.svg`)]
const STICKER_SIZE_PX = 56

// ── Draggable text fonts ──
const TEXT_FONTS = [
  { id: 'calligraphy', label: 'Calligraphy', family: "'Dancing Script', cursive" },
  { id: 'bubbly',      label: 'Bubbly',      family: "'Bubblegum Sans', cursive" },
  { id: 'curvy',       label: 'Curvy',        family: "'Pacifico', cursive" },
  { id: 'arial',       label: 'Arial',        family: "Arial, sans-serif" },
  { id: 'cursive',     label: 'Cursive',      family: "'Great Vibes', cursive" },
]

// ── shape-aware clipping ──
function clipShapePath(ctx, shape, x, y, w, h) {
  ctx.beginPath()
  if (shape === 'oval') {
    ctx.ellipse(x + w / 2, y + h / 2, w / 2, h / 2, 0, 0, Math.PI * 2)
  } else if (shape === 'triangle') {
    ctx.moveTo(x + w / 2, y)
    ctx.lineTo(x + w, y + h)
    ctx.lineTo(x, y + h)
    ctx.closePath()
  } else if (shape === 'heart') {
    const cx = x + w / 2, topY = y + h * 0.28
    ctx.moveTo(cx, y + h)
    ctx.bezierCurveTo(x - w * 0.1, y + h * 0.55, x + w * 0.05, y - h * 0.05, cx, topY)
    ctx.bezierCurveTo(x + w * 0.95, y - h * 0.05, x + w * 1.1, y + h * 0.55, cx, y + h)
    ctx.closePath()
  } else {
    const r = Math.min(w, h) * 0.14
    ctx.moveTo(x + r, y)
    ctx.arcTo(x + w, y, x + w, y + h, r)
    ctx.arcTo(x + w, y + h, x, y + h, r)
    ctx.arcTo(x, y + h, x, y, r)
    ctx.arcTo(x, y, x + w, y, r)
    ctx.closePath()
  }
}

function drawShapedImageCover(ctx, img, x, y, w, h, shape) {
  ctx.save()
  clipShapePath(ctx, shape, x, y, w, h)
  ctx.clip()
  const imgRatio = img.width / img.height
  const boxRatio = w / h
  let drawW, drawH, dx, dy
  if (imgRatio > boxRatio) {
    drawH = h
    drawW = h * imgRatio
    dx = x - (drawW - w) / 2
    dy = y
  } else {
    drawW = w
    drawH = w / imgRatio
    dx = x
    dy = y - (drawH - h) / 2
  }
  ctx.drawImage(img, dx, dy, drawW, drawH)
  ctx.restore()
}

function shapeClipDefSVG(clipId, shape, x, y, w, h) {
  if (shape === 'oval') {
    return `<clipPath id="${clipId}"><ellipse cx="${x + w / 2}" cy="${y + h / 2}" rx="${w / 2}" ry="${h / 2}"/></clipPath>`
  }
  if (shape === 'triangle') {
    return `<clipPath id="${clipId}"><polygon points="${x + w / 2},${y} ${x + w},${y + h} ${x},${y + h}"/></clipPath>`
  }
  if (shape === 'heart') {
    const cx = x + w / 2, topY = y + h * 0.28
    const d = `M ${cx} ${y + h} C ${x - w * 0.1} ${y + h * 0.55}, ${x + w * 0.05} ${y - h * 0.05}, ${cx} ${topY} `
             + `C ${x + w * 0.95} ${y - h * 0.05}, ${x + w * 1.1} ${y + h * 0.55}, ${cx} ${y + h} Z`
    return `<clipPath id="${clipId}"><path d="${d}"/></clipPath>`
  }
  return `<clipPath id="${clipId}"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="8"/></clipPath>`
}

// ── Click sound utility ──
const clickAudioCtx = typeof AudioContext !== 'undefined' ? new AudioContext() : null
function playClickSound() {
  if (!clickAudioCtx) return
  const oscillator = clickAudioCtx.createOscillator()
  const gainNode = clickAudioCtx.createGain()
  oscillator.connect(gainNode)
  gainNode.connect(clickAudioCtx.destination)
  oscillator.frequency.setValueAtTime(800, clickAudioCtx.currentTime)
  oscillator.type = 'sine'
  gainNode.gain.setValueAtTime(0.3, clickAudioCtx.currentTime)
  gainNode.gain.exponentialRampToValueAtTime(0.001, clickAudioCtx.currentTime + 0.08)
  oscillator.start(clickAudioCtx.currentTime)
  oscillator.stop(clickAudioCtx.currentTime + 0.08)
}

export default function Decor() {
  const navigate  = useNavigate()
  const location  = useLocation()
  const composedRef = useRef(null)
  const draggingId  = useRef(null)
  const draggingTextId = useRef(null)

  const [searchParams, setSearchParams] = useSearchParams()

  const [snaps] = useState(() => location.state?.snaps || [])

  useEffect(() => {
    if (snaps.length === 0) navigate('/snap', { replace: true })
  }, [snaps, navigate])

  // ── Frame image selection ──
  const [selectedFrameId, setSelectedFrameId] = useState('none')
  const selectedFrame = FRAME_IMAGES.find(f => f.id === selectedFrameId) || FRAME_IMAGES[0]

  // ── Frame color (color wheel for the strip background) ──
  const [frameColor, setFrameColor] = useState('#FFFFFF')

  // ── Photo shape is now just 'rect' (shapes removed, replaced by frame color picker) ──
  const [photoShape, setPhotoShape] = useState('rect')

  const [placedStickers,   setPlacedStickers]   = useState([])
  const [selectedStickerId, setSelectedStickerId] = useState(null)
  const [isExporting, setIsExporting] = useState(false)

  // ── Draggable text items ──
  const [placedTexts, setPlacedTexts] = useState([])
  const [selectedTextId, setSelectedTextId] = useState(null)

  // ── Button click with sound ──
  const withClick = (fn) => (...args) => {
    playClickSound()
    return fn(...args)
  }

  // ── frame image selection ──
  const pickFrame = withClick((id) => {
    setSelectedFrameId(id)
    setSearchParams(prev => {
      const next = new URLSearchParams(prev)
      next.set('frame', id)
      return next
    }, { replace: true, state: location.state })
  })

  // ── sticker placement ──
  const addSticker = withClick((src) => {
    const id = `sticker-${Date.now()}-${Math.random()}`
    setPlacedStickers(prev => [...prev, { id, src, xPct: 50, yPct: 50, rot: 0, scale: 1 }])
    setSelectedStickerId(id)
  })

  const rotateSticker = withClick((delta) => {
    setPlacedStickers(prev => prev.map(s => s.id === selectedStickerId ? { ...s, rot: s.rot + delta } : s))
  })

  const resizeSticker = withClick((delta) => {
    setPlacedStickers(prev => prev.map(s => {
      if (s.id !== selectedStickerId) return s
      const newScale = Math.max(0.3, Math.min(3, s.scale + delta))
      return { ...s, scale: newScale }
    }))
  })

  const deleteSelectedSticker = withClick(() => {
    setPlacedStickers(prev => prev.filter(s => s.id !== selectedStickerId))
    setSelectedStickerId(null)
  })

  const handlePointerDown = (e, id) => {
    e.stopPropagation()
    draggingId.current = id
    setSelectedStickerId(id)
    setSelectedTextId(null)
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  const handlePointerMove = (e, id) => {
    if (draggingId.current !== id || !composedRef.current) return
    const rect = composedRef.current.getBoundingClientRect()
    const xPct = Math.min(100, Math.max(0, ((e.clientX - rect.left) / rect.width) * 100))
    const yPct = Math.min(100, Math.max(0, ((e.clientY - rect.top) / rect.height) * 100))
    setPlacedStickers(prev => prev.map(s => s.id === id ? { ...s, xPct, yPct } : s))
  }

  const handlePointerUp = () => { draggingId.current = null }

  // ── Draggable text handlers ──
  const addText = withClick((fontId) => {
    const font = TEXT_FONTS.find(f => f.id === fontId)
    const id = `text-${Date.now()}-${Math.random()}`
    setPlacedTexts(prev => [...prev, {
      id, text: 'Your Text', fontFamily: font.family, fontId: font.id,
      xPct: 50, yPct: 85, color: '#ffffff', fontSize: 14, rot: 0
    }])
    setSelectedTextId(id)
  })

  const handleTextPointerDown = (e, id) => {
    e.stopPropagation()
    draggingTextId.current = id
    setSelectedTextId(id)
    setSelectedStickerId(null)
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  const handleTextPointerMove = (e, id) => {
    if (draggingTextId.current !== id || !composedRef.current) return
    const rect = composedRef.current.getBoundingClientRect()
    const xPct = Math.min(100, Math.max(0, ((e.clientX - rect.left) / rect.width) * 100))
    const yPct = Math.min(100, Math.max(0, ((e.clientY - rect.top) / rect.height) * 100))
    setPlacedTexts(prev => prev.map(t => t.id === id ? { ...t, xPct, yPct } : t))
  }

  const handleTextPointerUp = () => { draggingTextId.current = null }

  const updateSelectedText = (key, value) => {
    setPlacedTexts(prev => prev.map(t => t.id === selectedTextId ? { ...t, [key]: value } : t))
  }

  const deleteSelectedText = withClick(() => {
    setPlacedTexts(prev => prev.filter(t => t.id !== selectedTextId))
    setSelectedTextId(null)
  })

  const selectedText = placedTexts.find(t => t.id === selectedTextId)

  // ── build the composited canvas ──
  const renderCanvas = async () => {
    const SCALE = 3
    const W = REF_W * SCALE
    const H = REF_H * SCALE
    const canvas = document.createElement('canvas')
    canvas.width = W
    canvas.height = H
    const ctx = canvas.getContext('2d')

    // Draw frame color background
    ctx.fillStyle = frameColor
    roundRect(ctx, 0, 0, W, H, 18 * SCALE)
    ctx.fill()

    const padTop = 10 * SCALE, padSide = 10 * SCALE, padBottom = 14 * SCALE, gap = 8 * SCALE
    const slotW = W - padSide * 2
    const n = snaps.length || 1
    const availH = H - padTop - padBottom - gap * (n - 1)
    const slotH = availH / n

    for (let i = 0; i < snaps.length; i++) {
      const img = await loadImage(snaps[i])
      const sy = padTop + i * (slotH + gap)
      drawShapedImageCover(ctx, img, padSide, sy, slotW, slotH, photoShape)
    }

    // Draw frame overlay image if selected
    if (selectedFrame.src) {
      const frameImg = await loadImage(selectedFrame.src)
      ctx.drawImage(frameImg, 0, 0, W, H)
    }

    // Draw stickers
    for (const s of placedStickers) {
      const img = await loadImage(s.src)
      const size = STICKER_SIZE_PX * SCALE * s.scale
      const cx = (s.xPct / 100) * W
      const cy = (s.yPct / 100) * H
      ctx.save()
      ctx.translate(cx, cy)
      ctx.rotate((s.rot * Math.PI) / 180)
      ctx.drawImage(img, -size / 2, -size / 2, size, size)
      ctx.restore()
    }

    // Draw text items
    for (const t of placedTexts) {
      const cx = (t.xPct / 100) * W
      const cy = (t.yPct / 100) * H
      ctx.save()
      ctx.translate(cx, cy)
      ctx.rotate((t.rot * Math.PI) / 180)
      ctx.fillStyle = t.color
      ctx.font = `${t.fontSize * SCALE}px ${t.fontFamily}`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(t.text, 0, 0)
      ctx.restore()
    }

    return canvas
  }

  // ── Single download button ──
  const downloadImage = withClick(async () => {
    setIsExporting(true)
    try {
      const canvas = await renderCanvas()
      const link = document.createElement('a')
      link.href = canvas.toDataURL('image/png')
      link.download = 'quadshot-strip.png'
      link.click()
    } finally {
      setIsExporting(false)
    }
  })

  if (snaps.length === 0) return null

  return (
    <div id="decor">
      {/* Hidden shape defs for CSS clip-path */}
      <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
        <defs>
          <clipPath id="shape-oval" clipPathUnits="objectBoundingBox">
            <ellipse cx="0.5" cy="0.5" rx="0.5" ry="0.5" />
          </clipPath>
          <clipPath id="shape-triangle" clipPathUnits="objectBoundingBox">
            <polygon points="0.5,0 1,1 0,1" />
          </clipPath>
          <clipPath id="shape-heart" clipPathUnits="objectBoundingBox">
            <path d={HEART_FRACTION_PATH} />
          </clipPath>
        </defs>
      </svg>

      <div>
        <Navbar />
      </div>

      <div className="card">
     
        <h1 className="decor-heading">Make it yours ✨</h1>

        <div className="strip-composer">
          <div
            className="composed-strip"
            ref={composedRef}
            style={{ '--frame-color': frameColor, background: frameColor, position: 'relative' }}
            onClick={() => { setSelectedStickerId(null); setSelectedTextId(null) }}
          >
            {snaps.map((src, i) => (
              <div key={i} className="composed-slot" data-shape={photoShape}>
                <img src={src} alt={`Snap ${i + 1}`} className="composed-photo" />
              </div>
            ))}

            {/* Frame overlay image */}
            {selectedFrame.src && (
              <img
                src={selectedFrame.src}
                alt="frame overlay"
                className="frame-overlay-image"
                style={{
                  position: 'absolute',
                  inset: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'fill',
                  pointerEvents: 'none',
                  zIndex: 5,
                  borderRadius: '18px',
                }}
              />
            )}

            {/* Placed stickers */}
            {placedStickers.map(s => (
              <img
                key={s.id}
                src={s.src}
                alt="sticker"
                className={`placed-sticker${s.id === selectedStickerId ? ' selected-sticker' : ''}`}
                style={{
                  left: `${s.xPct}%`,
                  top: `${s.yPct}%`,
                  width: `${STICKER_SIZE_PX * s.scale}px`,
                  transform: `translate(-50%, -50%) rotate(${s.rot}deg)`,
                  zIndex: 15,
                }}
                onPointerDown={(e) => handlePointerDown(e, s.id)}
                onPointerMove={(e) => handlePointerMove(e, s.id)}
                onPointerUp={handlePointerUp}
                onClick={(e) => e.stopPropagation()}
              />
            ))}

            {/* Placed text items */}
            {placedTexts.map(t => (
              <div
                key={t.id}
                className={`placed-text${t.id === selectedTextId ? ' selected-text' : ''}`}
                style={{
                  position: 'absolute',
                  left: `${t.xPct}%`,
                  top: `${t.yPct}%`,
                  transform: `translate(-50%, -50%) rotate(${t.rot}deg)`,
                  fontFamily: t.fontFamily,
                  fontSize: `${t.fontSize}px`,
                  color: t.color,
                  cursor: 'grab',
                  userSelect: 'none',
                  touchAction: 'none',
                  zIndex: 20,
                  whiteSpace: 'nowrap',
                  textShadow: '0 1px 3px rgba(0,0,0,0.3)',
                }}
                onPointerDown={(e) => handleTextPointerDown(e, t.id)}
                onPointerMove={(e) => handleTextPointerMove(e, t.id)}
                onPointerUp={handleTextPointerUp}
                onClick={(e) => e.stopPropagation()}
              >
                {t.text}
              </div>
            ))}
          </div>

          {/* Controls on the right */}
          <div className="decor-controls">

            {/* Frame image picker */}
            <section className="control-block">
              <h3 className="control-label">Frames</h3>
              <div className="frame-picker-row frame-image-picker">
                {FRAME_IMAGES.map(f => (
                  <button
                    type="button"
                    key={f.id}
                    className={`frame-img-thumb${selectedFrame.id === f.id ? ' active' : ''}`}
                    title={f.label}
                    onClick={() => pickFrame(f.id)}
                  >
                    {f.src ? (
                      <img src={f.src} alt={f.label} />
                    ) : (
                      <span className="no-frame-icon">✕</span>
                    )}
                    {selectedFrame.id === f.id && <span className="frame-check">✓</span>}
                  </button>
                ))}
              </div>
            </section>

            {/* Frame color (color wheel) */}
            <section className="control-block">
              <h3 className="control-label">Frame Color</h3>
              <div className="color-wheel-row">
                <input
                  type="color"
                  value={frameColor}
                  onChange={(e) => { playClickSound(); setFrameColor(e.target.value) }}
                  className="color-wheel-input"
                  title="Pick frame color"
                />
                <span className="color-hex-label">{frameColor.toUpperCase()}</span>
              </div>
            </section>

            {/* Add Text */}
            <section className="control-block">
              <h3 className="control-label">Add Text</h3>
              <div className="text-font-row">
                {TEXT_FONTS.map(font => (
                  <button
                    type="button"
                    key={font.id}
                    className="text-font-btn"
                    style={{ fontFamily: font.family }}
                    title={font.label}
                    onClick={() => addText(font.id)}
                  >
                    {font.label}
                  </button>
                ))}
              </div>
              {selectedText && (
                <div className="text-edit-controls">
                  <input
                    type="text"
                    value={selectedText.text}
                    onChange={(e) => updateSelectedText('text', e.target.value)}
                    className="text-edit-input"
                    placeholder="Enter text..."
                  />
                  <div className="text-edit-row">
                    <input
                      type="color"
                      value={selectedText.color}
                      onChange={(e) => updateSelectedText('color', e.target.value)}
                      className="text-color-input"
                      title="Text color"
                    />
                    <button type="button" className="sticker-ctrl-btn" onClick={withClick(() => updateSelectedText('fontSize', Math.max(8, selectedText.fontSize - 2)))} title="Smaller text">A−</button>
                    <button type="button" className="sticker-ctrl-btn" onClick={withClick(() => updateSelectedText('fontSize', Math.min(40, selectedText.fontSize + 2)))} title="Larger text">A+</button>
                    <button type="button" className="sticker-ctrl-btn" onClick={withClick(() => updateSelectedText('rot', selectedText.rot - 15))} title="Rotate left">⟲</button>
                    <button type="button" className="sticker-ctrl-btn" onClick={withClick(() => updateSelectedText('rot', selectedText.rot + 15))} title="Rotate right">⟳</button>
                    <button type="button" className="sticker-ctrl-btn sticker-del-btn" onClick={deleteSelectedText} title="Remove text">✕</button>
                  </div>
                </div>
              )}
            </section>

            {/* Stickers */}
            <section className="control-block">
              <div className="sticker-header-row">
                <h3 className="control-label">Stickers</h3>
                {selectedStickerId && (
                  <div className="sticker-inline-actions">
                    <button type="button" className="sticker-ctrl-btn" onClick={() => resizeSticker(-0.15)} title="Decrease size">➖</button>
                    <button type="button" className="sticker-ctrl-btn" onClick={() => resizeSticker(0.15)} title="Increase size">➕</button>
                    <button type="button" className="sticker-ctrl-btn" onClick={() => rotateSticker(-15)} title="Rotate left">⟲</button>
                    <button type="button" className="sticker-ctrl-btn" onClick={() => rotateSticker(15)} title="Rotate right">⟳</button>
                    <button type="button" className="sticker-ctrl-btn sticker-del-btn" onClick={deleteSelectedSticker} title="Remove sticker">✕</button>
                  </div>
                )}
              </div>
              <p className="control-hint">Tap a sticker to add it, then drag it into place.</p>
              <div className="sticker-panel">
                <div className="sticker-grid">
                  {STICKERS.map(src => (
                    <div key={src} className="sticker-thumb" onClick={() => addSticker(src)}>
                      <img src={src} alt="sticker" loading="lazy" />
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Download + Back to Camera */}
            <section className="control-block">
              <div className="download-back-row">
                <button type="button" className="cursor-box dl-btn" onClick={downloadImage} disabled={isExporting}>
                  Download
                </button>
                <button type="button" className="retake-btn" onClick={withClick(() => navigate('/Snaps'))}>
                  Back to Camera →
                </button>
              </div>
            </section>

          </div>
        </div>
      </div>
    </div>
  )
}