import { useState, useRef, useEffect } from 'react'
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom'
import Navbar from '../components/Navbar.jsx'
import { roundRect, drawImageCover, loadImage, toDataURL } from "./canvasHelpers.js";

// Reference size of the photo strip (used for the PNG/SVG exports).
// Kept local so this page has no dependency on Frame.jsx at all.
const REF_W = 142
const REF_H = 398

// Just a color + label. No rotation, no decorations, no external data shape.
const FRAME_COLORS = [
  { id: 1, label: 'Maroon',   color: '#823A3A' },
  { id: 2, label: 'Citrus',   color: '#ECFF81' },
  { id: 3, label: 'Blossom',  color: '#FFDEF3' },
  { id: 4, label: 'Noir',     color: '#000000' },
  { id: 5, label: 'Slate',    color: '#6C6A6B' },
  { id: 6, label: 'Petal',    color: '#FFDDDD' },
  { id: 7, label: 'Sage',     color: '#DFF4A6' },
  { id: 8, label: 'Rosewood', color: '#D67777' },
]

// Photo shapes. Each button shows a live preview of the shape itself
// (via the same clip-path used on the real photos), so there's nothing
// to keep in sync by hand.
const PHOTO_SHAPES = [
  { id: 'rect',     label: 'Rounded rectangle' },
  { id: 'oval',     label: 'Oval' },
  { id: 'heart',    label: 'Heart' },
  { id: 'triangle', label: 'Triangle' },
]

// Fractional (0–1) heart outline, reused identically by the CSS clipPath
// (objectBoundingBox units), the canvas export, and the SVG export — one
// set of numbers, three renderers, so they always match.
const HEART_FRACTION_PATH = 'M0.5,1 C-0.1,0.55 0.05,-0.05 0.5,0.28 C0.95,-0.05 1.1,0.55 0.5,1 Z'

const STICKERS = ['/Stickers/png.svg', ...Array.from({ length: 167 }, (_, i) => `/Stickers/png-${i + 1}.svg`)]
const STICKER_SIZE_PX = 56 // matches .placed-sticker default width used below

// ── shape-aware clipping, self-contained so canvasHelpers.js is untouched ──
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

export default function Decor() {
  const navigate  = useNavigate()
  const location  = useLocation()
  const composedRef = useRef(null)
  const draggingId  = useRef(null)

  const [searchParams, setSearchParams] = useSearchParams()

  // Captured ONCE on mount into local state, so it can never be wiped out
  // later by setSearchParams() (which navigates internally and, unless told
  // otherwise, drops location.state).
  const [snaps] = useState(() => location.state?.snaps || [])

  useEffect(() => {
    if (snaps.length === 0) navigate('/snap', { replace: true })
  }, [snaps, navigate])

  const initialFrameId = Number(searchParams.get('frame')) || FRAME_COLORS[0].id
  const [selectedFrameId, setSelectedFrameId] = useState(initialFrameId)
  const selectedFrame = FRAME_COLORS.find(f => f.id === selectedFrameId) || FRAME_COLORS[0]

  const [photoShape, setPhotoShape] = useState('rect') // 'rect' | 'oval' | 'heart' | 'triangle'

  const [placedStickers,   setPlacedStickers]   = useState([]) // {id, src, xPct, yPct, rot, scale}
  const [selectedStickerId, setSelectedStickerId] = useState(null)
  const [isExporting, setIsExporting] = useState(false)

  // ── frame color selection ──
  const pickFrame = (id) => {
    setSelectedFrameId(id)
    setSearchParams(prev => {
      const next = new URLSearchParams(prev)
      next.set('frame', id)
      return next
    }, { replace: true, state: location.state })
  }

  // ── sticker placement ──
  const addSticker = (src) => {
    const id = `${Date.now()}-${Math.random()}`
    setPlacedStickers(prev => [...prev, { id, src, xPct: 50, yPct: 50, rot: 0, scale: 1 }])
    setSelectedStickerId(id)
  }

  const rotateSticker = (delta) => {
    setPlacedStickers(prev => prev.map(s => s.id === selectedStickerId ? { ...s, rot: s.rot + delta } : s))
  }

  const deleteSelectedSticker = () => {
    setPlacedStickers(prev => prev.filter(s => s.id !== selectedStickerId))
    setSelectedStickerId(null)
  }

  const handlePointerDown = (e, id) => {
    e.stopPropagation()
    draggingId.current = id
    setSelectedStickerId(id)
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

  // ── build the composited canvas (shared by the PNG download) ──
  const renderCanvas = async () => {
    const SCALE = 3
    const W = REF_W * SCALE
    const H = REF_H * SCALE
    const canvas = document.createElement('canvas')
    canvas.width = W
    canvas.height = H
    const ctx = canvas.getContext('2d')

    ctx.fillStyle = selectedFrame.color
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

    return canvas
  }

  // ── download #1: composited PNG ──
  const downloadPNG = async () => {
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
  }

  // ── download #2: composited SVG (photos + stickers, fully embedded) ──
  const downloadSVG = async () => {
    setIsExporting(true)
    try {
      const W = REF_W, H = REF_H
      const bg = selectedFrame.color
      const padTop = 10, padSide = 10, padBottom = 14, gap = 8
      const slotW = W - padSide * 2
      const n = snaps.length || 1
      const availH = H - padTop - padBottom - gap * (n - 1)
      const slotH = availH / n

      let defs = ''
      let body = ''

      snaps.forEach((src, i) => {
        const sy = padTop + i * (slotH + gap)
        const clipId = `photoClip${i}`
        defs += shapeClipDefSVG(clipId, photoShape, padSide, sy, slotW, slotH)
        body += `<image href="${src}" x="${padSide}" y="${sy}" width="${slotW}" height="${slotH}" preserveAspectRatio="xMidYMid slice" clip-path="url(#${clipId})"/>`
      })

      for (const s of placedStickers) {
        const dataUrl = await toDataURL(s.src)
        const size = STICKER_SIZE_PX * s.scale
        const cx = (s.xPct / 100) * W
        const cy = (s.yPct / 100) * H
        const x = cx - size / 2
        const y = cy - size / 2
        body += `<image href="${dataUrl}" x="${x}" y="${y}" width="${size}" height="${size}" transform="rotate(${s.rot} ${cx} ${cy})"/>`
      }

      const svg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
        <defs>${defs}</defs>
        <rect width="${W}" height="${H}" rx="18" fill="${bg}"/>
        ${body}
      </svg>`

      const blob = new Blob([svg], { type: 'image/svg+xml' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = 'quadshot-strip.svg'
      link.click()
      URL.revokeObjectURL(url)
    } finally {
      setIsExporting(false)
    }
  }

  // ── download #3: just the placed stickers, transparent background ──
  const downloadStickers = async () => {
    if (placedStickers.length === 0) {
      alert('Add some stickers first!')
      return
    }
    setIsExporting(true)
    try {
      const SCALE = 3
      const W = REF_W * SCALE
      const H = REF_H * SCALE
      const canvas = document.createElement('canvas')
      canvas.width = W
      canvas.height = H
      const ctx = canvas.getContext('2d') // left transparent, no background fill

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

      const link = document.createElement('a')
      link.href = canvas.toDataURL('image/png')
      link.download = 'quadshot-stickers.png'
      link.click()
    } finally {
      setIsExporting(false)
    }
  }

  if (snaps.length === 0) return null // redirecting to /snap

  return (
    <div id="decor">
      {/* Hidden shape defs, reused by both the shape-picker swatches and
          the actual photos via CSS `clip-path: url(#shape-x)`.
          objectBoundingBox units mean these auto-scale to any element size. */}
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
        <div className="wordmark">
          <span>QuadShot</span>
          <span>Decorate</span>
        </div>

        <h1 className="decor-heading">Make it yours ✨</h1>

        <div className="strip-composer">
          <div
            className="composed-strip"
            ref={composedRef}
            style={{ '--frame-color': selectedFrame.color, background: selectedFrame.color }}
            onClick={() => setSelectedStickerId(null)}
          >
            {snaps.map((src, i) => (
              <div key={i} className="composed-slot" data-shape={photoShape}>
                <img src={src} alt={`Snap ${i + 1}`} className="composed-photo" />
              </div>
            ))}

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
                }}
                onPointerDown={(e) => handlePointerDown(e, s.id)}
                onPointerMove={(e) => handlePointerMove(e, s.id)}
                onPointerUp={handlePointerUp}
                onClick={(e) => e.stopPropagation()}
              />
            ))}
          </div>

          {/* everything to the right of the photo strip */}
          <div className="decor-controls">

            {/* frame color picker */}
            <section className="control-block">
              <h3 className="control-label">Frame color</h3>
              <div className="frame-picker-row">
                {FRAME_COLORS.map(f => (
                  <button
                    type="button"
                    key={f.id}
                    className={`frame-thumb-mini${selectedFrame.id === f.id ? ' active' : ''}`}
                    style={{ background: f.color }}
                    title={f.label}
                    onClick={() => pickFrame(f.id)}
                  >
                    {selectedFrame.id === f.id && <span className="frame-check">✓</span>}
                  </button>
                ))}
              </div>
            </section>

            {/* photo shape picker */}
            <section className="control-block">
              <h3 className="control-label">Photo shape</h3>
              <div className="shape-picker-row">
                {PHOTO_SHAPES.map(s => (
                  <button
                    type="button"
                    key={s.id}
                    className={`shape-thumb-mini${photoShape === s.id ? ' active' : ''}`}
                    title={s.label}
                    onClick={() => setPhotoShape(s.id)}
                  >
                    <span className="shape-swatch" data-shape={s.id} />
                  </button>
                ))}
              </div>
            </section>

            {/* stickers — always visible, scrollable grid */}
            <section className="control-block">
              <div className="sticker-header-row">
                <h3 className="control-label">Stickers</h3>
                {selectedStickerId && (
                  <div className="sticker-inline-actions">
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

            {/* downloads */}
            <section className="control-block">
              <h3 className="control-label">Download</h3>
              <div className="sticker-controls download-row">
                <button type="button" className="dl-btn" onClick={downloadPNG} disabled={isExporting}>Download PNG</button>
                <button type="button" className="dl-btn" onClick={downloadSVG} disabled={isExporting}>Download SVG</button>
                <button type="button" className="dl-btn" onClick={downloadStickers} disabled={isExporting}>Download Stickers</button>
              </div>
            </section>

            <div className="sticker-controls">
              <button type="button" className="retake-btn" onClick={() => navigate('/Snaps')}>← Back to Camera</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}