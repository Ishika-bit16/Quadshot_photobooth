// ── shared canvas + image helpers ──
// Used by Decor.jsx (and could be reused by Snaps.jsx) for compositing the
// final strip (photos + frame decorations + stickers) onto a <canvas>.

export function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

export function drawImageCover(ctx, img, x, y, w, h, r) {
  const ir = img.width / img.height
  const tr = w / h
  let sx, sy, sw, sh
  if (ir > tr) {
    sh = img.height; sw = sh * tr; sx = (img.width - sw) / 2; sy = 0
  } else {
    sw = img.width; sh = sw / tr; sx = 0; sy = (img.height - sh) / 2
  }
  ctx.save()
  roundRect(ctx, x, y, w, h, r)
  ctx.clip()
  ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h)
  ctx.restore()
}

export function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

// Converts any same-origin (or CORS-enabled) image URL into a base64 data
// URL. Needed so decorations/stickers (which live at /Stickers/*.svg,
// /Frames/*.png etc.) can be embedded directly into a downloaded SVG file
// instead of referencing a URL that won't resolve once the file leaves the app.
export function toDataURL(url) {
  return fetch(url)
    .then(res => res.blob())
    .then(blob => new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onloadend = () => resolve(reader.result)
      reader.onerror = reject
      reader.readAsDataURL(blob)
    }))
}
