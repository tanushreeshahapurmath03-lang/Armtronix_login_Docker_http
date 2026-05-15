// import React, { useEffect } from 'react';
// import { createRoot } from 'react-dom/client';
// import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
// import './index.css';

// import Login from './Login.jsx';
// import Register from './Register.jsx';
// import Admin from './Admin.jsx';
// import Employee from './Employee.jsx';
// import Git from './Git.jsx';
// import Cloudflare from './Cloudflare.jsx';
// import Aigpt from './Aigpt.jsx';
// import ClaimForm from './ClaimForm.jsx';
// import LeaveForm from './LeaveForm.jsx';
// import Help from './Help.jsx';
// import Attendance from './Attendance.jsx';
// import Annotation from './Annotation.jsx';
// import Notifications from './Notifications.jsx';
// import EmployeeNotifications from './EmployeeNotifications.jsx';
// import Git1 from './Git1.jsx';
// import Cloudflare1 from './Cloudflare1.jsx';
// import Aigpt1 from './Aigpt1.jsx';
// import ClaimForm1 from './ClaimForm1.jsx';
// import LeaveForm1 from './LeaveForm1.jsx';
// import Help1 from './Help1.jsx';
// import Annotation1 from './Annotation1.jsx';
// import ForgotPassword from './ForgotPassword.jsx';
// import ResetPassword from './ResetPassword.jsx';
// import ChangePassword from './PasswordChange.jsx';
// // import AdminRegisterEmployee from './AdminRegisterEmp.jsx';
// import AdminDashboard from './AdminDashboard.jsx';
// import Profile from './Profile.jsx';
// import ProfileEmp from './Profile_emp.jsx';
// import LeaveSettings from './LeaveSettings.jsx';
// import AdminNotifications from './AdminNotifications.jsx';
// /**
//  * Component to hide URL paths and still render the correct page.
//  */
// function HideURLWrapper({ Component }) {
//   const location = useLocation();

//   useEffect(() => {
//     // Replace the URL in the address bar to only show the domain/IP
//     window.history.replaceState({}, "", "/");
//   }, [location]);

//   return <Component />;
// }

// createRoot(document.getElementById('root')).render(
//   <Router>
//     <Routes>
//       <Route path="/" element={<HideURLWrapper Component={Login} />} />
//       <Route path="/register" element={<HideURLWrapper Component={Register} />} />
//       <Route path="/admin" element={<Admin />} />
//       <Route path="/employee" element={<Employee />} />
//       <Route path="/git" element={<Git />} />
//       <Route path="/cloudflare" element={<Cloudflare />} />
//       <Route path="/aigpt" element={<Aigpt />} />
//       <Route path="/claimform" element={<ClaimForm />} />
//       <Route path="/leaveform" element={<LeaveForm />} />
//       <Route path="/help" element={<Help />} />
//       <Route path="/attendance" element={<Attendance />} />
//       <Route path="/annotation" element={<Annotation />} />
//       <Route path="/notifications" element={<Notifications />} />
//       <Route path="/employeenotifications" element={<EmployeeNotifications />} />
//       <Route path="/adminnotifications" element={<AdminNotifications />} />
//       <Route path="/git1" element={<Git1 />} />
//       <Route path="/cloudflare1" element={<Cloudflare1 />} />
//       <Route path="/aigpt1" element={<Aigpt1 />} />
//       <Route path="/claimform1" element={<ClaimForm1 />} />
//       <Route path="/leaveform1" element={<LeaveForm1 />} />
//       <Route path="/help1" element={<Help1 />} />
//       <Route path="/annotation1" element={<Annotation1 />} />
//       <Route path="/forgot-password" element={<ForgotPassword />} />
//       <Route path="/reset-password/:token" element={<ResetPassword />} />

//       {/* New routes for password change feature */}
//       <Route path="/change-password" element={<HideURLWrapper Component={ChangePassword} />} />
//       {/* <Route path="/admin/register-employee" element={<AdminRegisterEmployee />} /> */}
//       <Route path="/admindashboard" element={<AdminDashboard />} />
//       <Route path="/profile" element={<Profile />} />
//       <Route path="/profileEmp" element={<ProfileEmp />} />
//       <Route path="/leavesettings" element={<LeaveSettings />} />


//     </Routes>
//   </Router>
// );



import React, { useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import { Workbox } from 'workbox-window';
import './index.css';
import PWAWrapper from './PWAWrapper';

import { handleRequest } from './api/localApiEmulator';
import './api/client';

import Login from './Login.jsx';
import Register from './Register.jsx';
import Admin from './Admin.jsx';
import Employee from './Employee.jsx';
import Git from './Git.jsx';
import Cloudflare from './Cloudflare.jsx';
import Aigpt from './Aigpt.jsx';
import ClaimForm from './ClaimForm.jsx';
import ClaimDetail from './ClaimDetail.jsx';
import LeaveForm from './LeaveForm.jsx';
import Help from './Help.jsx';
import Attendance from './Attendance.jsx';
import Annotation from './Annotation.jsx';
import Notifications from './Notifications.jsx';
import EmployeeNotifications from './EmployeeNotifications.jsx';
import Git1 from './Git1.jsx';
import Cloudflare1 from './Cloudflare1.jsx';
import Aigpt1 from './Aigpt1.jsx';
import ClaimForm1 from './ClaimForm1.jsx';
import LeaveForm1 from './LeaveForm1.jsx';
import Help1 from './Help1.jsx';
import Annotation1 from './Annotation1.jsx';
import ForgotPassword from './ForgotPassword.jsx';
import ResetPassword from './ResetPassword.jsx';
import ChangePassword from './PasswordChange.jsx';
import AdminDashboard from './AdminDashboard.jsx';
import Profile from './Profile.jsx';
import ProfileEmp from './Profile_emp.jsx';
import LeaveSettings from './LeaveSettings.jsx';
import AdminNotifications from './AdminNotifications.jsx';
import COE from './COE'; // Import COE Page component
import COE_emp from './COE_emp.jsx'; // Import COE Page component

/**
 * Component to hide URL paths and still render the correct page.
 */
function HideURLWrapper({ Component }) {
  const location = useLocation();

  useEffect(() => {
    // Replace the URL in the address bar to only show the domain/IP
    window.history.replaceState({}, "", "/");
  }, [location]);

  return <Component />;
}

// Register Service Worker
function registerServiceWorker() {
  if (!import.meta.env.PROD) {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations()
        .then((registrations) => registrations.forEach((registration) => registration.unregister()))
        .catch(() => {});
    }

    if ('caches' in window) {
      caches.keys()
        .then((keys) => keys.forEach((key) => caches.delete(key)))
        .catch(() => {});
    }
    return;
  }

  if ('serviceWorker' in navigator) {
    const wb = new Workbox('/service-worker.js');
    wb.register().then(() => {
      console.log("Service Worker Registered Successfully!");
    }).catch(error => {
      console.error("Service Worker Registration Failed:", error);
    });
  }
}

registerServiceWorker();

// Offline/API emulator wiring.
// Any fetch request targeting backend API paths is redirected into local IndexedDB.
(function wireFetchToLocalEmulator() {
  const originalFetch = window.fetch.bind(window);
  window.fetch = async (input, init) => {
    try {
      const url = typeof input === 'string' ? input : input?.url;
      if (!url) return originalFetch(input, init);

      const backendBase = import.meta.env.VITE_BACKEND_URL;
      const u = new URL(url, window.location.origin);

      // Only emulate same-origin /api routes; allow actual backend host calls to go over network.
      const isApiPath = u.pathname.includes('/api/') || u.pathname.startsWith('/api');
      const isBackendHost = !!backendBase && u.href.startsWith(backendBase);
      const shouldEmulate = isApiPath && !isBackendHost;

      if (shouldEmulate) {
        // Prevent stripping of multipart/form-data boundaries by avoiding direct new Headers() override if not necessary
        let finalHeaders = init?.headers || input?.headers;
        if (init?.headers?.Authorization) {
           finalHeaders = new Headers(finalHeaders || {});
           finalHeaders.set('Authorization', init.headers.Authorization);
        }
        
        const reqOpts = { method: init?.method || 'GET', body: init?.body };
        if (finalHeaders) reqOpts.headers = finalHeaders;

        const req = input instanceof Request
          ? new Request(input, init)
          : new Request(u.toString(), reqOpts);

        const resp = await handleRequest(req);
        if (resp) return resp;
      }
    } catch (err) {
      console.error("Emulator Exception:", err);
      // fallback to network
    }

    return originalFetch(input, init);
  };
})();

createRoot(document.getElementById('root')).render(
  <PWAWrapper>
<Router>
    <Routes>
      <Route path="/" element={<HideURLWrapper Component={Login} />} />
      <Route path="/register" element={ <Register/>} />
      <Route path="/admin" element={<Admin />} />
      <Route path="/employee" element={<Employee />} />
      <Route path="/git" element={<Git />} />
      <Route path="/cloudflare" element={<Cloudflare />} />
      <Route path="/aigpt" element={<Aigpt />} />
      <Route path="/claimform" element={<ClaimForm />} />
      <Route path="/claim-detail" element={<ClaimDetail />} />
      <Route path="/leaveform" element={<LeaveForm />} />
      <Route path="/help" element={<Help />} />
      <Route path="/attendance" element={<Attendance />} />
      <Route path="/annotation" element={<Annotation />} />
      <Route path="/notifications" element={<Notifications />} />
      <Route path="/employeenotifications" element={<EmployeeNotifications />} />
      <Route path="/adminnotifications" element={<AdminNotifications />} />
      <Route path="/git1" element={<Git1 />} />
      <Route path="/cloudflare1" element={<Cloudflare1 />} />
      <Route path="/aigpt1" element={<Aigpt1 />} />
      <Route path="/claimform1" element={<ClaimForm1 />} />
      <Route path="/leaveform1" element={<LeaveForm1 />} />
      <Route path="/help1" element={<Help1 />} />
      <Route path="/annotation1" element={<Annotation1 />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />
      <Route path="/change-password" element={<ChangePassword/>} />
      <Route path="/admindashboard" element={<AdminDashboard />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/profileEmp" element={<ProfileEmp />} />
      <Route path="/leavesettings" element={<LeaveSettings />} />
      <Route path="/coe" element={<COE />} />
      <Route path="/coe_emp" element={<COE_emp />} />

    </Routes>
  </Router>
  </PWAWrapper>

);
