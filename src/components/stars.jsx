import '../css/stars.css'

// Generates N random stars once (not on every render)
function generateStars(count) {
  return Array.from({ length: count }, () => ({
    top: Math.random() * 100,
    left: Math.random() * 100,
    size: Math.random() * 2 + 1,       // 1px - 3px
    delay: Math.random() * 4,          // 0s - 4s twinkle delay
    duration: Math.random() * 3 + 2,   // 2s - 5s twinkle duration
  }))
}

const STARS = generateStars(120)

export default function Stars() {
  return (
    <div id="stars-layer" aria-hidden="true">
      {STARS.map((s, i) => (
        <span
          key={i}
          className="star"
          style={{
            top: `${s.top}%`,
            left: `${s.left}%`,
            width: `${s.size}px`,
            height: `${s.size}px`,
            animationDelay: `${s.delay}s`,
            animationDuration: `${s.duration}s`,
          }}
        />
      ))}
    </div>
  )
}