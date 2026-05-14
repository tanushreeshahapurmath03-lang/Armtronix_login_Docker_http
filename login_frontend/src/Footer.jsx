import React from 'react';
import './Footer.css';
// import { Link } from 'react-router-dom';

function Footer() {


  return (
    <div className="Home">

      <footer className="footer">
        <div className="footer-content">
          {/* <div className="footer-left">
            <h3>Location & Address:</h3>
            <p> Armtronix IoT Private Limited. First Floor, KLE Tech Park Building, KLE Technological University, Vidyanagar, Hubballi, Karnataka-580031</p>
          </div> */}
          <div className="footer-center">
            <ul className='foot'>
              <li><a href="/">Home</a></li>
              <li><a href="/products">Products</a></li>
              <li><a href="/solution1">Solutions</a></li>
              <li><a href="/about">About Us</a></li>
              <li><a href="/contact">Contact</a></li>
            </ul>
            <div className="social-links">
              <a href="https://www.youtube.com/channel/UC9SyFmjGGerJKE769z6c7uw" target="_blank" rel="noopener noreferrer">
                <img src="/Images/Youtube Logo.png" alt="YouTube" className="social-icon" />
              </a>
              <a href="https://x.com/armtronix_india" target="_blank" rel="noopener noreferrer">
                <img src="/Images/x-twitter-logo.png" alt="X" className="social-icon" />
              </a>
              <a href="https://www.facebook.com/share/19pA9kHC9M/" target="_blank" rel="noopener noreferrer">
                <img src="/Images/Facebook-Logo.svg" alt="Facebook" className="social-icon" />
              </a>
              <a href="https://www.linkedin.com/company/armtronix-iot-pvt-ltd/" target="_blank" rel="noopener noreferrer">
                <img src="/Images/linkedinlogo.jpg" alt="LinkedIn" className="social-icon" />
              </a>
            </div>
            <p>&copy; 2025 Armtronix. All rights reserved.</p>
          </div>
          {/* <div className="footer-right">
            <h3>Contact:</h3>
            <p>Contact No: +91 98803 10042</p>
            <p>Email: info@armtronix.in</p>
          </div> */}
        </div>
      </footer>


    </div>
  );
}

export default Footer;