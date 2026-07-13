import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar.jsx'

export default function About() {
  return (
    <div className="about-page">
      <Navbar />

      {/* Hero */}
      <div className="about-hero">
       
        <h1>Built for <em>moments</em><br />that deserve a frame.</h1>
        <p className="tagline">QuadShot is a browser-based photobooth that lets you capture, style, and keep four photos — all in one joyful session.</p>
        <div className="rule"><span className="rule-dot"></span></div>
      </div>

      {/* Card */}
      <div className="about-card">

        {/* What we are */}
        <div className="about-section">
          <p className="section-label">What we are</p>
          <div className="about-intro-grid">
            <div>
              <h2>Your personal photobooth, right in the browser.</h2>
              <p>QuadShot lets you snap a four-photo layout, pick a frame that fits your mood, and download the whole thing in seconds — no app, no account, no friction.</p>
              <p>Whether it's a solo selfie session or a table full of friends at a party, QuadShot turns a regular moment into something you'll actually want to save.</p>
            </div>
            <div className="about-intro-right">
              <div className="stat-pill">
                <span className="stat-num">4</span>
                <span className="stat-label">Photos captured per session</span>
              </div>
              <div className="stat-pill">
                <span className="stat-num">8</span>
                <span className="stat-label">Unique frames to choose from</span>
              </div>
              <div className="stat-pill">
                <span className="stat-num">6</span>
                <span className="stat-label">Live filters — B&amp;W, sepia, vivid &amp; more</span>
              </div>
            </div>
          </div>
        </div>

        {/* Transparency */}
        <div className="about-section">
          <p className="section-label">Transparency</p>
          <h2>Your photos stay yours — always.</h2>
          <p>Everything happens locally in your browser. We only access your camera to make QuadShot work, and we only do the following:</p>
          <ul className="data-list">
            <li><span className="bullet-dot"></span>Stream your camera so you can preview and capture photos.</li>
            <li><span className="bullet-dot"></span>Apply the frame, filters, and stickers you choose, client-side.</li>
            <li><span className="bullet-dot"></span>Generate a download so you can save your strip to your device.</li>
          </ul>
          <p>That's it. No uploads, no cloud storage, no sharing with third parties — ever.</p>
        </div>

        {/* Privacy */}
        <div className="about-section">
          <p className="section-label">Privacy Policy</p>
          <h2>Simple by design. Private by default.</h2>
          <p>QuadShot does not collect personal information — no names, no email addresses, no phone numbers — unless you choose to reach out through the Contact page.</p>
          <p>If you do contact us, we only use what you share (your name, email, and message) to respond to your query. Nothing else.</p>
          <p>Photos you take are processed temporarily, in your browser, to enable features like frames and filters. They are never stored on any server and are discarded the moment your session ends.</p>
          <div className="privacy-chips">
            <span className="chip">No account required</span>
            <span className="chip">No server uploads</span>
            <span className="chip">No data sold</span>
            <span className="chip">Camera access — local only</span>
          </div>
        </div>

        {/* Footer note */}
        <div className="about-footer-note">
          <span className="heart">🌸</span>
          <p>QuadShot was made with love to bring a little photobooth magic to everyone. Got a question or a kind word?{' '}
            <Link to="/contact" style={{ color: 'var(--coral)', textDecoration: 'none', fontWeight: 500 }}>
              Drop us a note →
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
