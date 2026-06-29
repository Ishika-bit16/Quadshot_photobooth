import { useState } from "react";
import Navbar from "../components/Navbar.jsx";

export default function ContactForm() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    message: "",
  });

  const [status, setStatus] = useState("");

  // Handle input changes
  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // Handle form submission
  const handleSend = async (e) => {
    e.preventDefault();

    if (!form.name || !form.email || !form.message) return;

    setStatus("sending");

    try {
      const formData = new FormData();

      // Replace this with your Web3Forms access key
      formData.append("access_key", "c08b474f-272f-452f-83bf-b2be3a035501");

      formData.append("name", form.name);
      formData.append("email", form.email);
      formData.append("message", form.message);

      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setStatus("sent");

        setForm({
          name: "",
          email: "",
          message: "",
        });
      } else {
        console.error(data);
        setStatus("error");
      }
    } catch (error) {
      console.error(error);
      setStatus("error");
    }
  };

  return (
    <div id="contact">
      <Navbar />

      <form className="contact-card" onSubmit={handleSend}>
        {/* Left Panel */}
        <div className="left-panel">
          <div id="left-panel-heading">
            <h2>Contact Us</h2>
          </div>

          <div id="left-panel-para">
            <p>
              We love to hear your feedback about Quadshot and the memories you
              made with it.
            </p>
          </div>

          <div id="left-panel-contact">
            <div className="info-row">
              <svg
                id="email-icon"
                width="16"
                height="16"
                fill="none"
                stroke="#FF8C8C"
                strokeWidth="1.8"
                viewBox="0 0 24 24"
              >
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>

              <span id="email">
                <a href="mailto:ishikasogra@gmail.com">
                  ishikasogra@gmail.com
                </a>
              </span>
            </div>

            <div className="info-row">
              <svg
                width="16"
                height="16"
                fill="none"
                stroke="#FF8C8C"
                strokeWidth="1.8"
                viewBox="0 0 24 24"
              >
                <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>

              <span id="address">
                Gurugram, Haryana, India
              </span>
            </div>
          </div>
        </div>

        {/* Right Panel */}
        <div className="right-panel">
          <div className="form-group">
            <label>Your Name</label>

            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Your Name"
              required
            />
          </div>

          <div className="form-group">
            <label>Email Address</label>

            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
              required
            />
          </div>

          <div className="form-group">
            <label>Feedback</label>

            <textarea
              name="message"
              value={form.message}
              onChange={handleChange}
              placeholder="Tell us about your experience with Quadshot..."
              rows="5"
              required
            />
          </div>

          <button
            type="submit"
            className="btn-submit"
            disabled={status === "sending"}
          >
            {status === "sending" ? "Sending..." : "Send Message"}
          </button>

          {status === "sent" ? (
                <div className="contact-success">
                  <span className="contact-success__icon">🌻</span>
                  <p className="contact-success__msg">Message sent! I'll get back to you soon.</p>
                </div>
              ) : null}

          {status === "error" && (
            <p className="success-msg">
              ❌ Something went wrong. Please try again.
            </p>
          )}
        </div>
      </form>
    </div>
  );
}
