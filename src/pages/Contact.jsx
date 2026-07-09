import { useState } from 'react'
import Navbar from '../components/Navbar.jsx'

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [sent, setSent] = useState(false)

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSend = (e) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.message) return

    // Opens the user's default email client — no third-party service, no API keys
    const subject = encodeURIComponent(`Quadshot Feedback from ${form.name}`)
    const body = encodeURIComponent(
      `Name: ${form.name}\nEmail: ${form.email}\n\n${form.message}`
    )
    window.location.href = `mailto:ishikasogra@gmail.com?subject=${subject}&body=${body}`

    setSent(true)
    setForm({ name: '', email: '', message: '' })
  }

  return (
    <div id="contact">
      <Navbar />

      <form className="contact-card" onSubmit={handleSend}>

        {/* ── Left panel ── */}
        <div className="left-panel">
          <h2>Contact Us</h2>
          <p>We love to hear your feedback about Quadshot and the memories you made with it.</p>

          <div id="left-panel-contact">
            <div className="info-row">
              <svg width="16" height="16" fill="none" stroke="var(--coral)" strokeWidth="1.8" viewBox="0 0 24 24">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
              <span id="email">
                <a href="mailto:ishikasogra@gmail.com">ishikasogra@gmail.com</a>
              </span>
            </div>

            <div className="info-row">
              <svg width="16" height="16" fill="none" stroke="var(--coral)" strokeWidth="1.8" viewBox="0 0 24 24">
                <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <span id="address">Gurugram, Haryana, India</span>
            </div>
          </div>
        </div>

        {/* ── Right panel ── */}
        <div className="right-panel">
          <div className="form-group">
            <label htmlFor="contact-name">Your Name</label>
            <input
              id="contact-name"
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Your Name"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="contact-email">Email Address</label>
            <input
              id="contact-email"
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="contact-msg">Feedback</label>
            <textarea
              id="contact-msg"
              name="message"
              value={form.message}
              onChange={handleChange}
              placeholder="Tell us about your experience with Quadshot..."
              rows="5"
              required
            />
          </div>

          <button type="submit" className="btn-submit">
            Send Message
          </button>

          {sent && (
            <p className="success-msg">
              ✅ Your email client has opened — just hit Send!
            </p>
          )}
        </div>

      </form>
    </div>
  )
}