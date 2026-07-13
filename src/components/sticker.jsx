import '../css/sticker.css'

const STICKERS = [
  { src: '/Stickers/png-40.svg',  top: 12.0, left: 50.0, size: 58, rotate: -12, delay: 0,   duration: 5.0 },
  { src: '/Stickers/png-55.svg',  top: 19.8, left: 61.9, size: 72, rotate: 8,   delay: 0.4, duration: 5.6 },
  { src: '/Stickers/png-66.svg',  top: 21.4, left: 76.9, size: 64, rotate: -6,  delay: 0.8, duration: 4.6 },
  { src: '/Stickers/png-90.svg',  top: 33.2, left: 80.9, size: 80, rotate: 14,  delay: 1.2, duration: 6.0 },
  { src: '/Stickers/png-68.svg',  top: 44.0, left: 88.0, size: 60, rotate: -10, delay: 1.6, duration: 5.2 },
  { src: '/Stickers/png-44.svg',  top: 54.0, left: 78.8, size: 74, rotate: 5,   delay: 2.0, duration: 4.8 },
  { src: '/Stickers/png-71.svg',  top: 66.6, left: 76.9, size: 66, rotate: -14, delay: 2.4, duration: 6.4 },
  { src: '/Stickers/png-14.svg',  top: 70.0, left: 62.8, size: 84, rotate: 10,  delay: 2.8, duration: 5.0 },
  { src: '/Stickers/png-163.svg', top: 76.0, left: 50.0, size: 58, rotate: -8,  delay: 0.2, duration: 5.8 },
  { src: '/Stickers/png-147.svg', top: 68.2, left: 38.1, size: 70, rotate: 12,  delay: 0.6, duration: 4.4 },
  { src: '/Stickers/png-126.svg', top: 66.6, left: 23.1, size: 62, rotate: -5,  delay: 1.0, duration: 6.2 },
  { src: '/Stickers/png-109.svg', top: 54.8, left: 19.1, size: 78, rotate: 15,  delay: 1.4, duration: 5.4 },
  { src: '/Stickers/png-102.svg', top: 44.0, left: 12.0, size: 56, rotate: -11, delay: 1.8, duration: 4.7 },
  { src: '/Stickers/png-100.svg', top: 34.0, left: 21.2, size: 72, rotate: 7,   delay: 2.2, duration: 5.9 },
  { src: '/Stickers/png-88.svg',  top: 21.4, left: 23.1, size: 64, rotate: -13, delay: 2.6, duration: 5.1 },
  { src: '/Stickers/png-73.svg',  top: 18.0, left: 37.2, size: 76, rotate: 9,   delay: 3.0, duration: 6.1 },
]

export default function Stickers() {
  return (
    <div id="stickers-layer" aria-hidden="true">
      {STICKERS.map((s, i) => (
        <img
          key={i}
          src={s.src}
          className="sticker"
          style={{
            top: `${s.top}%`,
            left: `${s.left}%`,
            width: `${s.size}px`,
            height: `${s.size}px`,
            '--rotate': `${s.rotate}deg`,
            animationDelay: `${s.delay}s`,
            animationDuration: `${s.duration}s`,
          }}
          alt=""
        />
      ))}
    </div>
  )
}