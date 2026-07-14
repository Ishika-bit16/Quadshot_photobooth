import { useState } from 'react'
import Navbar from '../components/Navbar.jsx'

export default function ContactForm() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [result, setResult] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setResult("Sending....");

    const formData = new FormData();
    formData.append("name", form.name);
    formData.append("email", form.email);
    formData.append("message", form.message);
    formData.append("access_key", "acd8ae28-7623-4505-ab93-08996119c400");

    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setResult("Thank you for your feedback!");
        setForm({ name: "", email: "", message: "" });
      } else {
        console.error("Web3Forms error:", data);
        setResult(`Error: ${data.message || "Something went wrong. Please try again."}`);
      }
    } catch (error) {
      console.error("Network error:", error);
      setResult("Network error. Please check your connection and try again.");
    }
  };

  return (
    <div id="contact">
      <Navbar />

      <form className="contact-card" onSubmit={onSubmit}>
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

          {result && (
            <p className="success-msg">
              {result === "Sending...." ? result : `✅ ${result}`}
            </p>
          )}
        </div>
      </form>
    </div>
  );
}