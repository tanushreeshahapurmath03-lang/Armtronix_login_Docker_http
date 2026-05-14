import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Login.css";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const Register = () => {
  const [name, setName] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [dob, setDob] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("employee");

  const [showPassword, setShowPassword] = useState(false);
  const [showconfirmPassword, setShowconfirmPassword] = useState(false);

  const navigate = useNavigate();

  const backendURL = import.meta.env.VITE_BACKEND_URL;

  const handleRegister = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    try {
      const response = await fetch(`${backendURL}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          employeeId,
          dob,
          email,
          password,
          role,
        }),
      });

      const contentType = response.headers.get("content-type") || "";
      let data = null;

      // Always try to read body so we can show real backend error
      if (contentType.includes("application/json")) {
        data = await response.json();
      } else {
        const text = await response.text();
        data = { message: text || "Server returned an error" };
      }

      console.log("🔹 Register response:", { ok: response.ok, status: response.status, data });

      if (response.ok) {
        alert("Registration successful! You can now log in.");
        navigate("/admin");
      } else {
        alert(data?.message || `Registration failed with status ${response.status}`);
      }
    } catch (error) {
      console.error("❌ Error registering:", error);
      alert("Something went wrong!");
    }
  };

  return (
    <div
      className="login-page-container"
      style={{
        backgroundImage: "url(/Images/login_Background.avif)",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="logo-container">
        <div className="logo-content">
          <Link to="/admin">
            <img
              src="/Images/Logo.png"
              alt="Armtronix Iot Pvt. Ltd."
              className="ARMlogo-img"
            />
          </Link>
        </div>
      </div>

      <div className="login-container">
        <div className="login-form">
          <div className="form-icon3">
            <img src="/Images/people1.png" alt="Register Icon" />
          </div>

          <form onSubmit={handleRegister}>
            {/* Role Selection */}
            <div className="input-group">
              <label>Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="employee">Employee</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            {/* Name */}
            <div className="input-group">
              <label>Name</label>
              <input
                type="text"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            {/* Employee ID */}
            <div className="input-group">
              <label>Employee ID</label>
              <input
                type="text"
                placeholder="Enter Employee ID"
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                required
              />
            </div>

            {/* DOB */}
            <div className="input-group">
              <label>Date of Birth</label>
              <input
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                required
              />
            </div>

            {/* Email */}
            <div className="input-group">
              <label>Email</label>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {/* Password */}
            <div className="input-group">
              <label>Password</label>

              <div className="password-container">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />

                <span
                  className="eye-icon"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </span>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="input-group">
              <label>Confirm Password</label>

              <div className="password-container">
                <input
                  type={showconfirmPassword ? "text" : "password"}
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />

                <span
                  className="eye-icon"
                  onClick={() =>
                    setShowconfirmPassword(!showconfirmPassword)
                  }
                >
                  {showconfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </span>
              </div>
            </div>

            {/* Register Button */}
            <button type="submit" className="login-btn">
              Register
            </button>

            {/* Login Link */}
            <p className="register-link">
              Already have an account? <Link to="/">Login here</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;