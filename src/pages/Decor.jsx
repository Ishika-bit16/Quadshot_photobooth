import { useState, useRef, useEffect } from 'react'
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom'
import Navbar from '../components/Navbar.jsx'
import { FRAMES, REF_W, REF_H } from '../components/Frame.jsx'
import { roundRect, drawImageCover, loadImage, toDataURL } from "./canvasHelpers.js";



const STICKERS = ['/Stickers/png.svg', ...Array.from({ length: 167 }, (_, i) => `/Stickers/png-${i + 1}.svg`)]
const STICKER_SIZE_PX = 56 // matches .placed-sticker default width used below

export default function Decor() {
  const navigate  = useNavigate()
  const location  = useLocation()
  const composedRef = useRef(null)
  const draggingId  = useRef(null)

  const [searchParams, setSearchParams] = useSearchParams()

  // Shots arrive from Snaps.jsx via router state. If someone lands here
  // directly (refresh, bookmark, back button) there's nothing to decorate,
  // so send them back to the camera.
  const snaps = location.state?.snaps || []

  useEffect(() => {
    if (snaps.length === 0) navigate('/snap', { replace: true })
  }, [snaps, navigate])

  const initialFrameId = Number(searchParams.get('frame')) || FRAMES[0]?.id || null
  const [selectedFrameId, setSelectedFrameId] = useState(initialFrameId)
  const selectedFrame = FRAMES.find(f => f.id === selectedFrameId) || null

  const [showStickerPanel, setShowStickerPanel] = useState(false)
  const [placedStickers,   setPlacedStickers]   = useState([]) // {id, src, xPct, yPct, rot, scale}
  const [selectedStickerId, setSelectedStickerId] = useState(null)
  const [isExporting, setIsExporting] = useState(false)

  // ── frame selection ──
  const pickFrame = (id) => {
    setSelectedFrameId(id)
    setSearchParams(prev => {
      const next = new URLSearchParams(prev)
      next.set('frame', id)
      return next
    })
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

    ctx.fillStyle = selectedFrame ? selectedFrame.color : '#ffffff'
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
      drawImageCover(ctx, img, padSide, sy, slotW, slotH, 8 * SCALE)
    }

    if (selectedFrame) {
      for (const d of selectedFrame.decorations) {
        const img = await loadImage(d.src)
        const dw = (d.w / REF_W) * W
        const dh = (d.h / REF_H) * H
        const dx = (d.x / REF_W) * W
        const dy = (d.y / REF_H) * H
        ctx.save()
        ctx.translate(dx + dw / 2, dy + dh / 2)
        ctx.rotate((d.rot * Math.PI) / 180)
        ctx.drawImage(img, -dw / 2, -dh / 2, dw, dh)
        ctx.restore()
      }
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

  // ── download #2: composited SVG (photos + frame + stickers, fully embedded) ──
  const downloadSVG = async () => {
    setIsExporting(true)
    try {
      const W = REF_W, H = REF_H
      const bg = selectedFrame ? selectedFrame.color : '#ffffff'
      const padTop = 10, padSide = 10, padBottom = 14, gap = 8
      const slotW = W - padSide * 2
      const n = snaps.length || 1
      const availH = H - padTop - padBottom - gap * (n - 1)
      const slotH = availH / n

      let defs = ''
      let body = ''

      snaps.forEach((src, i) => {
        const sy = padTop + i * (slotH + gap)
        defs += `<clipPath id="photoClip${i}"><rect x="${padSide}" y="${sy}" width="${slotW}" height="${slotH}" rx="8"/></clipPath>`
        body += `<image href="${src}" x="${padSide}" y="${sy}" width="${slotW}" height="${slotH}" preserveAspectRatio="xMidYMid slice" clip-path="url(#photoClip${i})"/>`
      })

      if (selectedFrame) {
        for (const d of selectedFrame.decorations) {
          const dataUrl = await toDataURL(d.src)
          const cx = d.x + d.w / 2
          const cy = d.y + d.h / 2
          body += `<image href="${dataUrl}" x="${d.x}" y="${d.y}" width="${d.w}" height="${d.h}" transform="rotate(${d.rot} ${cx} ${cy})"/>`
        }
      }

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
  // Handy as a reusable sticker sheet, separate from the photo strip.
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
      <div>
        <Navbar />
      </div>

      <div className="card">
        <div className="wordmark"></div>

        <div className="strip-composer">
          <div
            className="composed-strip"
            ref={composedRef}
            style={selectedFrame ? { background: selectedFrame.color, transform: `rotate(${selectedFrame.rotation}deg)` } : undefined}
            onClick={() => setSelectedStickerId(null)}
          >
            {snaps.map((src, i) => (
              <div key={i} className="composed-slot">
                <img src={src} alt={`Snap ${i + 1}`} className="composed-photo" />
              </div>
            ))}

            {selectedFrame && selectedFrame.decorations.map((d, i) => (
              <img
                key={i}
                src={d.src}
                alt=""
                className="frame-deco-overlay"
                style={{
                  left: `${(d.x / REF_W) * 100}%`,
                  top: `${(d.y / REF_H) * 100}%`,
                  width: `${(d.w / REF_W) * 100}%`,
                  transform: `rotate(${d.rot}deg)`,
                }}
              />
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
            {/* frame mini-picker */}
            <div className="sticker-controls">
              {FRAMES.map(f => (
                <button
                  key={f.id}
                  className={`frame-thumb-mini${selectedFrame?.id === f.id ? ' active' : ''}`}
                  style={{ background: f.color }}
                  title={f.label}
                  onClick={() => pickFrame(f.id)}
                />
              ))}
            </div>

            <div className="sticker-controls">
              <button className="sticker-toggle-btn" onClick={() => setShowStickerPanel(v => !v)}>
                {showStickerPanel ? 'Close Stickers' : '✨ Add Stickers'}
              </button>
              {selectedStickerId && (
                <>
                  <button className="sticker-ctrl-btn" onClick={() => rotateSticker(-15)} title="Rotate left">⟲</button>
                  <button className="sticker-ctrl-btn" onClick={() => rotateSticker(15)} title="Rotate right">⟳</button>
                  <button className="sticker-ctrl-btn sticker-del-btn" onClick={deleteSelectedSticker} title="Remove sticker">✕</button>
                </>
              )}
            </div>

            {showStickerPanel && (
              <div className="sticker-panel">
                <div className="sticker-grid">
                  {STICKERS.map(src => (
                    <div key={src} className="sticker-thumb" onClick={() => addSticker(src)}>
                      <img src={src} alt="sticker" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* downloads */}
            <div className="sticker-controls download-row">
              <button className="dl-btn" onClick={downloadPNG} disabled={isExporting}>Download PNG</button>
              <button className="dl-btn" onClick={downloadSVG} disabled={isExporting}>Download SVG</button>
              <button className="dl-btn" onClick={downloadStickers} disabled={isExporting}>Download Stickers</button>
            </div>

            <div className="sticker-controls">
              <button className="retake-btn" onClick={() => navigate('/snap')}>← Back to Camera</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}