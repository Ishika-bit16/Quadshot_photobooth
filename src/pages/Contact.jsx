import { useState } from 'react'
import Navbar from '../components/Navbar.jsx'

export default function Contact() {
  const [showSuccess, setShowSuccess] = useState(false)

  const handleSubmit = () => {
    setShowSuccess(true)
    setTimeout(() => setShowSuccess(false), 4000)
  }

  return (
    <div id="contact">
      <Navbar />

      <div className="contact-card">
        {/* Left panel */}
        <div className="left-panel">
          <div id="left-panel-heading"><h2>Contact us</h2></div>
          <div id="left-panel-para">
            <p>We love to hear your feedback about the Quadshot and memories you made with it.</p>
          </div>
          <div id="left-panel-contact">
            <div className="info-row">
              <svg id="email-icon" width="16" height="16" fill="none" stroke="#FF8C8C" strokeWidth="1.8" viewBox="0 0 24 24">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
              <span id="email">
                <a href="mailto:ishikasogra@gmail.com">ishikasogra@gmail.com</a>
              </span>
            </div>
            <div className="info-row">
              <svg width="16" height="16" fill="none" stroke="#FF8C8C" strokeWidth="1.8" viewBox="0 0 24 24">
                <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <span id="address">Gurugram, Haryana, India</span>
            </div>
          </div>
        </div>

        {/* Right panel — form */}
        <div className="right-panel">
          <div className="form-group">
            <label>Your Name</label>
            <input type="text" placeholder="Your Name" />
          </div>
          <div className="form-group">
            <label>Email Address</label>
            <input type="email" placeholder="you@example.com" />
          </div>
          <div className="form-group">
            <label>Feedback</label>
            <textarea placeholder="Tell us about your experience with Quadshot…"></textarea>
          </div>
          <button className="btn-submit" onClick={handleSubmit}>Send Message</button>
          {showSuccess && (
            <div className="success-msg">✓ Thank you! Your message has been sent.</div>
          )}
        </div>
      </div>
    </div>
  )
}
