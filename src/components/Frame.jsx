import React from 'react'

// Auto-generated from the user-provided Frame_18.svg sheet.
// Body color, rotation, and decoration-sticker placement extracted directly from source XML.
// Decoration images are served from public/Stickers.
export const REF_W = 142
export const REF_H = 398

const RAW_FRAMES = [
  {
    id: 1,
    label: "Maroon Strip",
    color: "#823A3A",
    rotation: 4.36151,
    style: "strip4",
    decorations: [
      { x: -33.25, y: 220.88, w: 81, h: 73, rot: 0, src: "./dist/Stickers/png.svg" },
      { x: 104.75, y: 135.88, w: 81, h: 73, rot: 0, src: "./dist/Stickers/png1.svg" },
      { x: -6.25, y: -0.12, w: 80, h: 73, rot: 0, src: "./dist/Stickers/png2.svg" },
      { x: 69.75, y: 429.88, w: 81, h: 73, rot: 0, src: "./dist/Stickers/png3.svg" },
    ]
  },
  {
    id: 2,
    label: "Citrus",
    color: "#ECFF81",
    rotation: -4.46148,
    style: "cards3",
    decorations: [
      { x: 102.27, y: -20.92, w: 81, h: 73, rot: 0, src: "./dist/Stickers/png5.svg" },
      { x: 114.53, y: 494.22, w: 81, h: 73, rot: 170.907, src: "./dist/Stickers/png6.svg" },
      { x: 124.27, y: 123.08, w: 80, h: 73, rot: 0, src: "./dist/Stickers/png7.svg" }
    ]
  },
  {
    id: 3,
    label: "Blossom",
    color: "#FFDEF3",
    rotation: 4.73494,
    style: "cards3",
    decorations: [
      { x: -4.84, y: -9.86, w: 81, h: 73, rot: 0, src: "./dist/Stickers/png8.svg" },
      { x: 97.16, y: 141.14, w: 81, h: 73, rot: 0, src: "./dist/Stickers/png9.svg" },
      { x: -45.84, y: 293.14, w: 81, h: 73, rot: 0, src: "./dist/Stickers/png10.svg" }]
  },
  {
    id: 4,
    label: "Noir",
    color: "#000000",
    rotation: -8.03321,
    style: "cards3",
    decorations: [
      { x: 107.77, y: -16.36, w: 80, h: 73, rot: 0, src: "./dist/Stickers/png11.svg" },
      { x: 35.77, y: 266.63, w: 81, h: 73, rot: 0, src: "./dist/Stickers/png12.svg" },
      { x: 166.77, y: 398.63, w: 81, h: 73, rot: 0, src: "./dist/Stickers/png13.svg" }]
  },
  {
    id: 5,
    label: "Slate",
    color: "#6C6A6B",
    rotation: 4.73494,
    style: "cards3",
    decorations: [
      { x: 77.71, y: 126.14, w: 80, h: 73, rot: 0, src: "./dist/Stickers/png14.svg" },
      { x: -27.82, y: 271.14, w: 81, h: 73, rot: 22.9532, src: "./dist/Stickers/png15.svg" },
      { x: 61.01, y: 433.69, w: 81, h: 73, rot: -9.9488, src: "./dist/Stickers/png16.svg" },
      { x: -21.29, y: -19.86, w: 80, h: 73, rot: 0, src: "./dist/Stickers/png17.svg" }]
  },
  {
    id: 6,
    label: "Petal",
    color: "#FFDDDD",
    rotation: -13.7039,
    style: "cards3",
    decorations: [
      { x: 136.32, y: 83.25, w: 81, h: 73, rot: 0, src: "./dist/Stickers/png18.svg" },
      { x: 136.32, y: 83.25, w: 81, h: 73, rot: 0, src: "./dist/Stickers/png19.svg" },
      { x: 5.32, y: -22.75, w: 80, h: 73, rot: 0, src: "./dist/Stickers/png20.svg" },
      { x: 63.32, y: 259.25, w: 80, h: 73, rot: 0, src: "./dist/Stickers/png21.svg" }]
  },
  {
    id: 7,
    label: "Sage",
    color: "#DFF4A6",
    rotation: 9.27777,
    style: "cards3",
    decorations: [
      { x: 81.16, y: 200.75, w: 80, h: 73, rot: 0, src: "./dist/Stickers/png22.svg" },
      { x: -38.84, y: 102.75, w: 81, h: 73, rot: 0, src: "./dist/Stickers/png23.svg" },
      { x: 43.82, y: 403.75, w: 81, h: 73, rot: 18.0818, src: "./dist/Stickers/png24.svg" },
      { x: -68.84, y: 280.75, w: 81, h: 73, rot: 0, src: "./dist/Stickers/png25.svg" }]
  },
  {
    id: 8,
    label: "Rosewood",
    color: "#D67777",
    rotation: -16.3451,
    style: "cards3",
    decorations: [
      { x: 73.5, y: 246.26, w: 81, h: 73, rot: 0, src: "./dist/Stickers/png26.svg" },
      { x: 85.31, y: 265.42, w: 81, h: 73, rot: -23.484, src: "./dist/Stickers/png27.svg" },
      { x: 37.5, y: 101.41, w: 81, h: 73, rot: -18.0909, src: "./dist/Stickers/png28.svg" },
      { x: -15.5, y: -36.74, w: 80, h: 73, rot: 0, src: "./dist/Stickers/png29.svg" },
      { x: 226.5, y: 350.26, w: 80, h: 73, rot: 0, src: "./dist/Stickers/png30.svg" }]
  },
];

function normalizeStickerSrc(src) {
  return src.replace(/^\.\/dist/, '')
}

export const FRAMES = RAW_FRAMES.map(frame => ({
  ...frame,
  decorations: frame.decorations.map(decoration => ({
    ...decoration,
    src: normalizeStickerSrc(decoration.src),
  })),
}))

export default function Frame({ frame }) {
  if (!frame) return null

  const slotCount = frame.style === 'strip4' ? 4 : 3
  const frameDecorations = frame.decorations || []

  return (
    <div className="real-frame-body" style={{ background: frame.color, transform: `rotate(${frame.rotation}deg)` }}>
      <div className={`real-frame-inner ${frame.style === 'strip4' ? 'style-strip4' : 'style-cards3'}`}>
        {Array.from({ length: slotCount }).map((_, index) => (
          <div key={index} className="real-slot" />
        ))}
      </div>

      {frameDecorations.map((decoration, index) => (
        <div
          key={`${decoration.src}-${index}`}
          className="real-frame-deco"
          style={{
            left: `${(decoration.x / REF_W) * 100}%`,
            top: `${(decoration.y / REF_H) * 100}%`,
            width: `${(decoration.w / REF_W) * 100}%`,
            height: `${(decoration.h / REF_H) * 100}%`,
            transform: `rotate(${decoration.rot}deg)`,
          }}
        >
          <img src={decoration.src} alt="" />
        </div>
      ))}

      <div className="real-frame-label">{frame.label}</div>
    </div>
  )
}
