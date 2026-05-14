import React, { useState, useEffect } from 'react';
import './Admin.css';
import HeaderSidebar_admin from './HeaderSidebar_admin';

const backendURL = import.meta.env.VITE_BACKEND_URL;

const AdminDashboard = () => {
  const [status, setStatus] = useState('');
  const [checkInTime, setCheckInTime] = useState(null);
  const [duration, setDuration] = useState(0);
  const [timer, setTimer] = useState("00:00:00");
  const [checkInDisabled, setCheckInDisabled] = useState(false);
  const [email, setEmail] = useState(localStorage.getItem("email"));  // Assume email is saved in localStorage after login
  const [time, setTime] = useState(new Date());


  // Update time every second
  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(interval); // Clear interval on component unmount
  }, []);

  // Calculate the degree for each hand
  const secondsDeg = (time.getSeconds() / 60) * 360;
  const minutesDeg = (time.getMinutes() / 60) * 360 + (secondsDeg / 60);
  const hoursDeg = (time.getHours() / 12) * 360 + (minutesDeg / 12);
  
  // Fetch the attendance status and update the frontend state
  useEffect(() => {
    const fetchAttendanceStatus = async () => {
      try {
        const token = localStorage.getItem("token");
        const payload = JSON.parse(atob(token.split('.')[1]));
        const userId = payload.userId;

        const res = await fetch(`${backendURL}/api/user/attendance/status`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ userId }),
        });

        const data = await res.json();
        console.log("Attendance status:", data);

        if (res.ok) {
          if (data.checkInTime && !data.checkOutTime) {
            setCheckInTime(new Date(data.checkInTime)); // Start timer only if not checked out
            setCheckInDisabled(true);
          } else {
            setCheckInTime(null); // Stop timer if already checked out
            setCheckInDisabled(false);
          }

          setStatus(data.status || '');
        } else {
          alert(data.message);
        }
      } catch (err) {
        console.error("Error fetching attendance status", err);
      }
    };

    fetchAttendanceStatus();
  }, []);

  // Timer calculation every second
  useEffect(() => {
    let interval;
    if (checkInTime) {
      interval = setInterval(() => {
        const now = new Date();
        const diff = new Date(now - new Date(checkInTime));
        const hours = String(diff.getUTCHours()).padStart(2, "0");
        const minutes = String(diff.getUTCMinutes()).padStart(2, "0");
        const seconds = String(diff.getUTCSeconds()).padStart(2, "0");
        setTimer(`${hours}:${minutes}:${seconds}`);
  
        const totalDuration = diff.getTime() / 1000 / 60 / 60;
        setDuration(totalDuration.toFixed(2));
      }, 1000);
    } else {
      setTimer("00:00:00"); // Reset when no check-in
    }
  
    return () => clearInterval(interval); // Cleanup on unmount or when timer stops
  }, [checkInTime]);
  

  // Handle check-in action
  const handleCheckIn = async () => {
    try {
      const token = localStorage.getItem("token");
      const payload = JSON.parse(atob(token.split('.')[1]));
      const userId = payload.userId;

      const res = await fetch(`${backendURL}/api/user/attendance/checkin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId })
      });

      const data = await res.json();
      if (res.ok) {
        const now = new Date();
        setCheckInTime(now);
        setCheckInDisabled(true); // Disable check-in button after checking in
        setStatus('Checked In');
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error('Check-in failed', err);
    }
  };

  // Handle check-out action
  const handleCheckOut = async () => {
    try {
      const token = localStorage.getItem("token");
      const payload = JSON.parse(atob(token.split('.')[1]));
      const userId = payload.userId;

      const res = await fetch(`${backendURL}/api/user/attendance/checkout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId })
      });

      const data = await res.json();
      if (res.ok) {
        setCheckInTime(null); // Reset check-in time
        setCheckInDisabled(false); // Enable check-in button again
        setStatus(data.status); // "Full Day" or "Half Day"
        alert(`Checked out successfully. Worked ${data.hoursWorked} hours (${data.status}).`);

        // Stop the timer here explicitly
        setTimer("00:00:00");
      } else {
        alert(data.message || "Checkout failed");
      }
    } catch (err) {
      console.error("Check-out failed", err);
    }
  };

  return (
    <div className="dashboard-container">
      <HeaderSidebar_admin />

      <main className="main-content">
   
        <div className='time'>
          {checkInTime ? (
            <>
             <div className="analog-clock">
                <div
                  className="clock-hand hour-hand"
                  style={{ transform: `rotate(${hoursDeg}deg)` }}
                />
                <div
                  className="clock-hand minute-hand"
                  style={{ transform: `rotate(${minutesDeg}deg)` }}
                />
                <div
                  className="clock-hand second-hand"
                  style={{ transform: `rotate(${secondsDeg}deg)` }}
                />
              </div>
              <button onClick={handleCheckOut}>Check Out</button>
              <p className="timer-clock">🕒 {timer}</p>
              <p className='time-worked'>Time Worked: {duration} hours</p>
            </>
          ) : (
            <>
              <div className="analog-clock">
                <div
                  className="clock-hand hour-hand"
                  style={{ transform: `rotate(${hoursDeg}deg)` }}
                />
                <div
                  className="clock-hand minute-hand"
                  style={{ transform: `rotate(${minutesDeg}deg)` }}
                />
                <div
                  className="clock-hand second-hand"
                  style={{ transform: `rotate(${secondsDeg}deg)` }}
                />
              </div>
              <button onClick={handleCheckIn} disabled={checkInDisabled}>Check In</button>
            </>
          )}

          {status && <p>{status}</p>}
        </div>

        <h2>Rules and Regulations</h2>
        <p>1. Employees must adhere to company policies at all times.</p>
        <p>2. Punctuality and attendance are mandatory.</p>
        <p>3. Confidential company information should not be shared externally.</p>
        <p>4. Workplace ethics and professionalism must be maintained.</p>
        <p>5. Any issues should be reported to HR immediately.</p>
        <p>6. A minimum of <strong>8 working hours</strong> is required for a <strong>Full Day</strong> attendance.</p>

      </main>
    </div>
  );
};

export default AdminDashboard;
