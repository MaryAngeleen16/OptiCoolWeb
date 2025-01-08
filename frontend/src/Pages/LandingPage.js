import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "../Components/Layouts/LandingPage.css";
// import Login from "./Pages/Login";
// import Register from "./Pages/Register";

function LandingPage() {
  return (
    <div className="landing-page">
      {/* <header className="header">
        <div className="logo">OptiCool</div>
        <nav className="nav">
          <a href="#features">Features</a>
          <a href="#about">About</a>
          <a href="#contact">Contact</a>
        </nav>
      </header> */}
      {/* Left Section */}
      <div className="left-section">
        <div className="section-content">
          <title1>OPTI COOL</title1>
          <subtitle>
            Revolutionizing smart cooling systems for a sustainable future.
          </subtitle>
          {/* <p>
            At OptiCool, we provide innovative IoT solutions to enhance comfort,
            save energy, and promote sustainability.
          </p> */}
          <div className="button-container">
            <button
              className="action-button login-button"
              onClick={() => (window.location.href = "/login")}
            >
              Login
            </button>
            <button
              className="action-button signup-button"
              onClick={() => (window.location.href = "/register")}
            >
              Sign Up
            </button>
            <button className="action-button qr-button">Scan QR</button>
          </div>
        </div>
      </div>
      <img className="LandingPage" src="/LandingPage.png" alt="Landing Page" />
      {/* Right Section */}
      <div className="right-section">
        {/* <div className="section-content">
          <h1>About OptiCool</h1>
        </div> */}
      </div>

      {/* Hero Section */}
      {/* <section className="hero">
        <div className="hero-content">
          <h1>Welcome to OptiCool</h1>
          <p>Revolutionizing smart cooling systems for a sustainable future.</p>
          <button className="cta-button">Get Started</button>
        </div>
      </section> */}

      {/* Features Section */}
      {/* <section id="features" className="features">
        <h2>Features</h2>
        <div className="features-list">
          <div className="feature">
            <h3>Real-Time Monitoring</h3>
            <p>Track temperature and humidity in real time with precise data.</p>
          </div>
          <div className="feature">
            <h3>Energy Efficiency</h3>
            <p>Optimize energy usage to save costs and reduce carbon footprint.</p>
          </div>
          <div className="feature">
            <h3>Smart Controls</h3>
            <p>Remotely control cooling systems from your mobile or web app.</p>
          </div>
        </div>
      </section> */}

      {/* About Section */}
      {/* <section id="about" className="about">
        <h2>About Us</h2>
        <p>
          At OptiCool, we aim to transform cooling systems by integrating IoT
          solutions and advanced monitoring tools to enhance comfort and
          sustainability.
        </p>
      </section> */}

      {/* Contact Section */}
      {/* <section id="contact" className="contact">
        <h2>Contact Us</h2>
        <p>Have questions? Reach out to us at:</p>
        <p>Email: support@opticool.com</p>
        <p>Phone: +123 456 7890</p>
      </section> */}
    </div>
  );
}

export default LandingPage;
