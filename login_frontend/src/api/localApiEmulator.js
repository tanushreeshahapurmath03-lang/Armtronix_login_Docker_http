// Local API emulator.
// Goal: keep existing UI + API paths/response shapes, but serve them from IndexedDB.

import * as db from './localStorageDb';
import { mockEmailSuccess } from './emulatorEmailMock';

const STORE = {
  users: 'users',
  claims: 'claims',
  payments: 'payments',
  tasks: 'tasks',
  leaveRequests: 'leaveRequests',
  events: 'events',
  attendance: 'attendance',
  leaveSettings: 'leaveSettings'
};

function getTokenPayload() {
  const token = localStorage.getItem('token');
  if (!token) return null;

  // ProtectedRoute decodes JWT payload by atob(token.split('.')[1])
  // Keep compatibility by ensuring payload is base64 JSON.
  try {
    const parts = token.split('.');
    if (parts.length < 2) return null;
    const payloadJson = atob(parts[1]);
    return JSON.parse(payloadJson);
  } catch {
    return null;
  }
}

function isAuthed() {
  return !!getTokenPayload();
}

function authUser() {
  const payload = getTokenPayload();
  if (!payload) return null;
  return payload;
}

function formatUser(user) {
  if (!user) return null;
  return {
    id: user.id,
    _id: user.id,
    name: user.name || '',
    empId: user.empId || '',
    email: user.email,
    role: user.role || 'employee',
    phone: user.phone || '',
    address: user.address || '',
    BloodGroup: user.BloodGroup || '',
    Designation: user.Designation || '',
    Gender: user.Gender || '',
    profileImage: user.profileImage || '',
    teams: user.teams || []
  };
}

async function currentUser() {
  const payload = authUser();
  if (!payload) return null;
  const users = await db.getAll(STORE.users);
  return users.find((user) => user.id === (payload.userId || payload.id)) || null;
}

function taskPercentFromStatus(status, fallback = 0) {
  if (status === 'completed' || status === 'approved') return 100;
  if (status === 'completed-pending-approval') return 90;
  if (status === 'started' || status === 'in-progress') return 50;
  if (status === 'not-started') return 0;
  return fallback;
}

async function populatedTask(task) {
  const users = await db.getAll(STORE.users);
  const byId = new Map(users.map((user) => [user.id, formatUser(user)]));
  return {
    id: task.id,
    _id: task.id,
    projectTitle: task.projectTitle,
    description: task.description,
    deadline: task.deadline,
    status: task.status,
    rationale: task.rationale,
    assignedTo: (task.assignedTo || []).map((id) => byId.get(id)).filter(Boolean),
    createdBy: byId.get(task.createdBy) || task.createdBy,
    createdAt: task.createdAt,
    updatedAt: task.updatedAt,
    completedPercentage: task.completedPercentage,
    remainingPercentage: 100 - (task.completedPercentage || 0)
  };
}

async function populatedAttendance(items) {
  const users = await db.getAll(STORE.users);
  const byId = new Map(users.map((user) => [user.id, formatUser(user)]));
  return items.map((item) => ({
    ...item,
    date: item.date || item.timestamp,
    checkIn: item.checkIn || (item.status === 'checkedIn' ? item.timestamp : ''),
    checkOut: item.checkOut || (item.status === 'checkedOut' ? item.timestamp : ''),
    userId: byId.get(item.userId) || item.userId
  }));
}

async function leaveSummaryForEmail(email) {
  const all = await db.getAll(STORE.leaveRequests);
  const setting = await db.getById(STORE.leaveSettings, email) || await db.getById(STORE.leaveSettings, 'global') || { totalLeaves: 30 };
  const history = all
    .filter((leave) => leave.email === email)
    .sort((a, b) => (b.startDate || b.timestamp || '').localeCompare(a.startDate || a.timestamp || ''));
  const leavesTaken = history
    .filter((leave) => leave.status === 'Approved')
    .reduce((sum, leave) => sum + Number(leave.totalLeaveDays || 0), 0);

  return {
    email,
    totalLeaves: Number(setting.totalLeaves || 30),
    leavesTaken,
    leavesRemaining: Number(setting.totalLeaves || 30) - leavesTaken,
    leaveHistory: history.map((leave) => ({
      id: leave.id,
      date: (leave.startDate || leave.timestamp || '').slice(0, 10),
      type: leave.leaveType || leave.subject || '',
      days: Number(leave.totalLeaveDays || 0),
      status: leave.status
    }))
  };
}

function jsonResponse(data, init = {}) {
  const { status = 200, headers } = init;
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...(headers || {})
    }
  });
}

async function readBody(request) {
  const ct = request.headers.get('content-type') || '';
  if (ct.includes('application/json')) return request.json();
  // handle multipart/form-data: parse as text only (UI uses FormData for claims)
  if (ct.includes('multipart/form-data')) {
    const form = await request.formData();
    const obj = {};
    for (const [k, v] of form.entries()) {
      // keep files as empty placeholders; business UI doesn't render bills from backend in this conversion
      obj[k] = typeof v === 'string' ? v : { name: v.name, type: v.type, size: v.size };
    }
    return obj;
  }
  // fallback
  try {
    return await request.json();
  } catch {
    return {};
  }
}

function parseQuery(url) {
  const u = typeof url === 'string' ? new URL(url, window.location.origin) : url;
  const out = {};
  u.searchParams.forEach((v, k) => (out[k] = v));
  return out;
}

async function handleApi(path, request) {
  // Auth endpoints
  if (path === '/api/auth/login' && request.method === 'POST') {
    const body = await readBody(request);
    const { email, password } = body || {};

    const users = await db.queryIndex(STORE.users, 'email', email);
    const user = users?.[0];
    if (!user) return jsonResponse({ message: 'Invalid credentials' }, { status: 400 });
    if (user.password !== password) {
      return jsonResponse({ message: 'Invalid credentials' }, { status: 400 });
    }

    const tokenPayload = { userId: user.id, id: user.id, role: user.role };
    const payloadB64 = btoa(unescape(encodeURIComponent(JSON.stringify(tokenPayload))));
    const token = `local.${payloadB64}.sig`;

    return jsonResponse({
      token,
      requirePasswordChange: !!user.requirePasswordChange,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  }

  if (path === '/api/auth/register' && request.method === 'POST') {
    const body = await readBody(request);
    const { name, email, password, role, employeeId } = body || {};

    const existing = (await db.queryIndex(STORE.users, 'email', email))?.[0];
    if (existing) return jsonResponse({ message: 'Email already registered' }, { status: 400 });
    if (employeeId) {
      const users = await db.getAll(STORE.users);
      if (users.some((user) => user.empId === employeeId)) {
        return jsonResponse({ message: 'Employee ID already registered' }, { status: 400 });
      }
    }

    const id = crypto.randomUUID();
    await db.put(STORE.users, {
      id,
      name: name || '',
      empId: employeeId || id,
      email,
      password,
      role: role || 'employee',
      phone: '',
      address: '',
      BloodGroup: '',
      profileImage: '',
      teams: [],
      requirePasswordChange: true,
      createdAt: new Date().toISOString()
    });

    return jsonResponse({
      message: 'User registered successfully',
      user: { id, name: name || '', empId: employeeId || id, email, role: role || 'employee' }
    }, { status: 201 });
  }

  if (path === '/api/auth/change-password' && request.method === 'POST') {
    if (!isAuthed()) return jsonResponse({ message: 'Authentication required' }, { status: 401 });
    const body = await readBody(request);
    const { newPassword } = body || {};
    if (!newPassword || newPassword.length < 6) {
      return jsonResponse({ message: 'New password must be at least 6 characters long' }, { status: 400 });
    }

    const payload = authUser();
    const all = await db.getAll(STORE.users);
    const user = all.find(u => u.id === (payload.userId || payload.id));
    if (!user) return jsonResponse({ message: 'User not found' }, { status: 404 });

    user.password = newPassword;
    user.requirePasswordChange = false;
    await db.put(STORE.users, user);
    return jsonResponse({ message: 'Password changed successfully' });
  }

  if (path === '/api/auth/forgot-password' && request.method === 'POST') {
    return jsonResponse(mockEmailSuccess('Reset link sent to email'));
  }

  if (path.startsWith('/api/auth/reset-password/') && request.method === 'POST') {
    const body = await readBody(request);
    const token = decodeURIComponent(path.split('/').pop());
    const all = await db.getAll(STORE.users);
    const user = all.find((item) => item.email === token || item.id === token);
    if (user && body?.newPassword) {
      user.password = body.newPassword;
      user.requirePasswordChange = false;
      await db.put(STORE.users, user);
    }
    return jsonResponse({ message: 'Password reset successfully' });
  }

  // Users/profile
  if (path === '/api/user/profile' && request.method === 'GET') {
    const user = await currentUser();
    if (!user) return jsonResponse({ message: 'Authentication required' }, { status: 401 });
    return jsonResponse(formatUser(user));
  }

  if (path === '/api/user/profile' && request.method === 'PUT') {
    const user = await currentUser();
    if (!user) return jsonResponse({ message: 'Authentication required' }, { status: 401 });
    const body = await readBody(request);
    ['name', 'phone', 'address', 'BloodGroup', 'Designation', 'Gender'].forEach((key) => {
      if (body[key] !== undefined && body[key] !== '') user[key] = body[key];
    });
    await db.put(STORE.users, user);
    return jsonResponse(formatUser(user));
  }

  if (path === '/api/user/profile/image' && request.method === 'POST') {
    const user = await currentUser();
    if (!user) return jsonResponse({ message: 'Authentication required' }, { status: 401 });
    const body = await readBody(request);
    const file = body.profileImage || body.image || {};
    user.profileImage = file.name ? `local-profile://${file.name}` : user.profileImage;
    await db.put(STORE.users, user);
    return jsonResponse({ message: 'Profile image updated successfully', profileImage: user.profileImage });
  }

  if (path === '/api/user' && request.method === 'GET') {
    const user = await currentUser();
    if (!user) return jsonResponse({ message: 'Authentication required' }, { status: 401 });
    if (user.role !== 'admin') return jsonResponse({ message: 'Access denied. Admins only.' }, { status: 403 });
    const users = await db.getAll(STORE.users);
    return jsonResponse(users.map(formatUser));
  }

  if (path.startsWith('/api/user/') && path.endsWith('/role') && request.method === 'PUT') {
    const id = path.split('/')[3];
    const users = await db.getAll(STORE.users);
    const user = users.find((item) => item.id === id);
    if (!user) return jsonResponse({ message: 'User not found' }, { status: 404 });
    user.role = user.role === 'employee' ? 'admin' : 'employee';
    await db.put(STORE.users, user);
    return jsonResponse({ message: `User role updated to ${user.role}`, role: user.role });
  }

  if (path.startsWith('/api/user/') && request.method === 'GET' && !path.includes('/attendance')) {
    const id = path.split('/')[3];
    const users = await db.getAll(STORE.users);
    const user = users.find((item) => item.id === id);
    if (!user) return jsonResponse({ message: 'User not found' }, { status: 404 });
    return jsonResponse(formatUser(user));
  }

  if (path.startsWith('/api/user/') && request.method === 'DELETE') {
    const actor = await currentUser();
    if (!actor || actor.role !== 'admin') return jsonResponse({ message: 'Access denied. Admins only.' }, { status: 403 });
    const id = path.split('/')[3];
    await db.del(STORE.users, id);
    return jsonResponse({ message: 'User deleted successfully' });
  }

  // Claim number
  if (path === '/api/new-claim-number' && request.method === 'GET') {
    const next = await db.nextClaimNumber();
    return jsonResponse({ claimNumber: next.claimNumber });
  }

  if (path === '/api/claims' && request.method === 'GET') {
    const claims = await db.getAll(STORE.claims);
    return jsonResponse(claims);
  }

  if (path === '/api/claims' && request.method === 'POST') {
    const body = await readBody(request);

    // UI sends multipart FormData with fields + expenses as JSON string.
    const claimNumber = body.claimNumber || `CF/${new Date().getFullYear().toString().slice(-2)}-25/`;

    const id = crypto.randomUUID();
    const expenses = typeof body.expenses === 'string' ? JSON.parse(body.expenses) : (body.expenses || []);

    const claim = {
      id,
      claimNumber,
      date: body.date || new Date().toISOString().split('T')[0],
      employeeName: body.employeeName || '',
      employeeID: body.employeeID || '',
      location: body.location || '',
      expenses,
      advanceReceived: Number(body.advanceReceived || 0),
      adjustments: Number(body.adjustments || 0),
      cashReturned: Number(body.cashReturned || 0),
      paymentStatus: 'Pending'
    };

    await db.put(STORE.claims, claim);
    return jsonResponse({ message: 'Claim saved successfully!', claimNumber }, { status: 201 });
  }

  if (path.startsWith('/api/claims/') && request.method === 'GET') {
    const claimNumber = decodeURIComponent(path.split('/').slice(3).join('/'));
    const all = await db.getAll(STORE.claims);
    const claim = all.find(c => c.claimNumber === claimNumber);
    if (!claim) return jsonResponse({ message: 'Claim not found' }, { status: 404 });
    return jsonResponse(claim);
  }

  if (path.startsWith('/api/claims/') && request.method === 'DELETE') {
    const parts = path.split('/');
    const claimNumber = decodeURIComponent(parts[3]);
    const all = await db.getAll(STORE.claims);
    const claim = all.find(c => c.claimNumber === claimNumber);
    if (!claim) return jsonResponse({ message: 'Claim not found' }, { status: 404 });
    await db.del(STORE.claims, claim.id);
    // also remove related payments
    const pays = await db.getAll(STORE.payments);
    const related = pays.filter(p => p.claimNumber === claimNumber);
    for (const p of related) await db.del(STORE.payments, p.id);
    return jsonResponse({ message: 'Claim deleted successfully' });
  }

  // Bill fetch route used in ClaimForm1
  if (path.startsWith('/claims/') && path.includes('/bill/')) {
    return jsonResponse({});
  }

  if (path === '/api/payments' && request.method === 'GET') {
    const payments = await db.getAll(STORE.payments);
    return jsonResponse(payments);
  }

  if (path === '/api/payments' && request.method === 'POST') {
    const body = await readBody(request);
    const { claimNumber, employeeName, paymentType, utrNumber, amount } = body || {};

    if (!claimNumber || !amount || (paymentType === 'upi' && !utrNumber)) {
      return jsonResponse({ message: 'All fields are required!' }, { status: 400 });
    }

    const paymentId = crypto.randomUUID();
    const payment = {
      id: paymentId,
      claimNumber,
      employeeName: employeeName || '',
      paymentType: paymentType || '',
      utrNumber: utrNumber || '',
      amount: Number(amount),
      status: 'Completed',
      paymentDate: new Date().toISOString()
    };

    await db.put(STORE.payments, payment);

    // Update claim paymentStatus to Paid
    const allClaims = await db.getAll(STORE.claims);
    const claim = allClaims.find(c => c.claimNumber === claimNumber);
    if (claim) {
      claim.paymentStatus = 'Paid';
      await db.put(STORE.claims, claim);
    }

    return jsonResponse({
      message: 'Payment saved successfully and claim status updated!',
      payment,
      claim
    }, { status: 201 });
  }

  if (path === '/api/payments/with-claims' && request.method === 'GET') {
    const payments = await db.getAll(STORE.payments);
    const claims = await db.getAll(STORE.claims);
    return jsonResponse(payments.map((payment) => ({
      ...payment,
      claim: claims.find((claim) => claim.claimNumber === payment.claimNumber) || null
    })));
  }

  if (path === '/api/combined-report' && request.method === 'GET') {
    // Basic combined report expected by ClaimForm1.
    const claims = await db.getAll(STORE.claims);
    return jsonResponse(claims);
  }

  if (path === '/api/claims-with-status' && request.method === 'GET') {
    const claims = await db.getAll(STORE.claims);
    return jsonResponse(claims.map((claim) => ({
      ...claim,
      totalExpense: (claim.expenses || []).reduce((sum, expense) => sum + Number(expense.amount || 0), 0),
      paymentStatus: claim.paymentStatus || 'Pending'
    })));
  }

  // Events
  if (path === '/api/events') {
    if (request.method === 'GET') {
      const events = await db.getAll(STORE.events);
      return jsonResponse(events);
    }
    if (request.method === 'POST') {
      if (!isAuthed()) return jsonResponse({ message: 'Authentication required' }, { status: 401 });
      const body = await readBody(request);
      const id = crypto.randomUUID();
      const ev = { id, ...body, createdAt: new Date().toISOString() };
      await db.put(STORE.events, ev);
      return jsonResponse(ev, { status: 201 });
    }
    if (request.method === 'DELETE') {
      const events = await db.getAll(STORE.events);
      for (const ev of events) await db.del(STORE.events, ev.id);
      return jsonResponse({ message: 'Event deleted successfully' });
    }
  }

  // Leave endpoints used in UI (best-effort)
  if ((path === '/api/leave' || path === '/leave') && request.method === 'POST') {
    const body = await readBody(request);
    const id = crypto.randomUUID();
    const leave = {
      id,
      _id: id,
      ...body,
      name: body.name || '',
      email: body.email || '',
      subject: body.subject || '',
      message: body.message || '',
      status: 'Pending',
      timestamp: new Date().toISOString()
    };

    await db.put(STORE.leaveRequests, leave);
    return jsonResponse({ message: 'Leave request submitted successfully!', leave }, { status: 201 });
  }

  if ((path === '/api/leave/employee' || path === '/api/leave/admin') && request.method === 'GET') {
    const user = await currentUser();
    if (!user) return jsonResponse({ message: 'Authentication required' }, { status: 401 });
    const summary = await leaveSummaryForEmail(user.email);
    const all = await db.getAll(STORE.leaveRequests);
    return jsonResponse({
      leaveSettings: {
        totalLeaves: summary.totalLeaves,
        leavesRemaining: summary.leavesRemaining,
        leavesTaken: summary.leavesTaken
      },
      leaveHistory: all.filter((leave) => leave.email === user.email).sort((a, b) => (b.timestamp || '').localeCompare(a.timestamp || ''))
    });
  }

  if ((path === '/api/leave/all' || path === '/leave' || path === '/leave-requests') && request.method === 'GET') {
    const all = await db.getAll(STORE.leaveRequests);
    return jsonResponse(all.sort((a,b)=> (b.timestamp||'').localeCompare(a.timestamp||'')));
  }

  if (path === '/employee-leave-requests' && request.method === 'GET') {
    const { email } = parseQuery(request.url);
    if (!email) return jsonResponse({ message: 'Email is required' }, { status: 400 });
    const all = await db.getAll(STORE.leaveRequests);
    return jsonResponse(all.filter((leave) => leave.email === email).sort((a,b)=> (b.timestamp||'').localeCompare(a.timestamp||'')));
  }

  if (path === '/leave-summary' && request.method === 'GET') {
    const { email } = parseQuery(request.url);
    if (!email) return jsonResponse({ message: 'Email is required' }, { status: 400 });
    return jsonResponse(await leaveSummaryForEmail(email));
  }

  if (path.startsWith('/leave-history/download/') && request.method === 'GET') {
    return jsonResponse({ message: 'No leave history found in the selected date range.' });
  }

  if ((path === '/api/leave/update-status' || path === '/approve-leave') && request.method === 'POST') {
    const body = await readBody(request);
    const { id, status } = body || {};
    const all = await db.getAll(STORE.leaveRequests);
    const leave = all.find(l => l.id === id);
    if (!leave) return jsonResponse({ message: 'Leave request not found' }, { status: 404 });
    if (!['Approved', 'Rejected'].includes(status)) {
      return jsonResponse({ message: "Status must be either 'Approved' or 'Rejected'" }, { status: 400 });
    }
    leave.status = status;
    leave.timestamp = new Date().toISOString();
    await db.put(STORE.leaveRequests, leave);
    const summary = await leaveSummaryForEmail(leave.email);
    return jsonResponse({
      message: `Leave request ${String(status).toLowerCase()} successfully!`,
      leave,
      leavesTaken: summary.leavesTaken,
      leavesRemaining: summary.leavesRemaining
    });
  }

  if (path === '/leave/settings' && request.method === 'GET') {
    const settings = await db.getById(STORE.leaveSettings, 'global');
    return jsonResponse({ totalLeaves: settings?.totalLeaves || 30 });
  }

  if (path === '/leave/settings' && request.method === 'POST') {
    const body = await readBody(request);
    const settings = {
      key: 'global',
      totalLeaves: Number(body.totalLeaves || 30),
      leavesTaken: 0,
      lastResetDate: new Date().toISOString(),
      isGlobal: true
    };
    await db.put(STORE.leaveSettings, settings);
    return jsonResponse({ message: 'Leave settings updated', totalLeaves: settings.totalLeaves });
  }

  if (path === '/leave/reset' && request.method === 'POST') {
    const body = await readBody(request);
    if (body.resetType === 'single') {
      if (!body.email) return jsonResponse({ message: 'Email is required for individual reset.' }, { status: 400 });
      const userSettings = {
        key: body.email,
        email: body.email,
        totalLeaves: Number(body.totalLeaves || 30),
        leavesTaken: 0,
        lastResetDate: new Date().toISOString()
      };
      await db.put(STORE.leaveSettings, userSettings);
      return jsonResponse({ message: `Successfully reset leaves for ${body.email}`, userSettings: { ...userSettings, leavesRemaining: userSettings.totalLeaves } });
    }

    if (body.resetType === 'all') {
      const settings = {
        key: 'global',
        totalLeaves: Number(body.totalLeaves || 30),
        leavesTaken: 0,
        lastResetDate: new Date().toISOString(),
        isGlobal: true
      };
      await db.put(STORE.leaveSettings, settings);
      return jsonResponse({ message: 'Successfully reset leaves for all employees', globalSetting: settings, updateCount: 0 });
    }

    return jsonResponse({ message: "Invalid reset type. Use 'single' or 'all'." }, { status: 400 });
  }

  // Tasks
  if (path === '/api/tasks' && request.method === 'GET') {
    if (!isAuthed()) return jsonResponse({ message: 'Authentication required' }, { status: 401 });
    const payload = authUser();
    const all = await db.getAll(STORE.tasks);
    const userId = payload.userId || payload.id;
    const tasks = all.filter(t => t.userId === userId).sort((a,b)=> (a.deadline||'').localeCompare(b.deadline||''));
    const formatted = tasks.map(t => ({
      id: t.id,
      projectTitle: t.projectTitle,
      description: t.description,
      deadline: t.deadline,
      completedPercentage: t.completedPercentage,
      remainingPercentage: 100 - t.completedPercentage,
      createdAt: t.createdAt,
      updatedAt: t.updatedAt
    }));
    return jsonResponse(formatted);
  }

  if (path === '/api/tasks' && request.method === 'POST') {
    if (!isAuthed()) return jsonResponse({ message: 'Authentication required' }, { status: 401 });
    const body = await readBody(request);
    const payload = authUser();
    const userId = payload.userId || payload.id;

    const task = {
      id: crypto.randomUUID(),
      userId,
      projectTitle: body.projectTitle,
      description: body.description,
      deadline: body.deadline,
      completedPercentage: body.completedPercentage || 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await db.put(STORE.tasks, task);
    return jsonResponse({
      message: 'Task created successfully',
      task: {
        id: task.id,
        projectTitle: task.projectTitle,
        description: task.description,
        deadline: task.deadline,
        completedPercentage: task.completedPercentage,
        remainingPercentage: 100 - task.completedPercentage,
        createdAt: task.createdAt
      }
    }, { status: 201 });
  }

  if (path === '/api/admin/employees' && request.method === 'GET') {
    const users = await db.getAll(STORE.users);
    const me = await currentUser();
    return jsonResponse(users.filter((user) => user.id !== me?.id).map(formatUser));
  }

  if (path === '/api/admin/tasks' && request.method === 'GET') {
    const tasks = await db.getAll(STORE.tasks);
    return jsonResponse(await Promise.all(tasks.map(populatedTask)));
  }

  if (path === '/api/admin/tasks' && request.method === 'POST') {
    const user = await currentUser();
    if (!user) return jsonResponse({ message: 'Authentication required' }, { status: 401 });
    const body = await readBody(request);
    if (!Array.isArray(body.assignedTo) || body.assignedTo.length === 0) {
      return jsonResponse({ message: 'At least one user must be assigned to the task' }, { status: 400 });
    }
    const task = {
      id: crypto.randomUUID(),
      userId: user.id,
      projectTitle: body.projectTitle,
      description: body.description,
      deadline: body.deadline,
      status: body.status || 'not-started',
      rationale: body.rationale,
      assignedTo: body.assignedTo,
      createdBy: user.id,
      completedPercentage: taskPercentFromStatus(body.status || 'not-started', 0),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    await db.put(STORE.tasks, task);
    return jsonResponse(await populatedTask(task), { status: 201 });
  }

  if (path.startsWith('/api/admin/tasks/') && request.method === 'PUT') {
    const id = path.split('/')[4];
    const body = await readBody(request);
    const tasks = await db.getAll(STORE.tasks);
    const task = tasks.find((item) => item.id === id);
    if (!task) return jsonResponse({ message: 'Task not found' }, { status: 404 });

    if (path.endsWith('/approve')) {
      task.status = body.approved === true ? 'approved' : 'in-progress';
      task.completedPercentage = body.approved === true ? 100 : 50;
    } else {
      ['projectTitle', 'description', 'deadline', 'status', 'rationale'].forEach((key) => {
        if (body[key] !== undefined) task[key] = body[key];
      });
      if (body.assignedTo !== undefined) task.assignedTo = body.assignedTo;
      task.completedPercentage = taskPercentFromStatus(task.status, task.completedPercentage);
    }
    task.updatedAt = new Date().toISOString();
    await db.put(STORE.tasks, task);
    return jsonResponse(await populatedTask(task));
  }

  if (path.startsWith('/api/admin/tasks/') && request.method === 'DELETE') {
    const id = path.split('/')[4];
    await db.del(STORE.tasks, id);
    return jsonResponse({ message: 'Task deleted successfully' });
  }

  if (path.startsWith('/api/tasks/assigned-to/') && request.method === 'GET') {
    const id = decodeURIComponent(path.split('/').pop());
    const tasks = await db.getAll(STORE.tasks);
    const assignedTasks = tasks.filter((task) => {
      const assignedTo = task.assignedTo || [];
      return assignedTo.some((assignee) => (typeof assignee === 'object' ? assignee.id || assignee._id : assignee) === id);
    });
    return jsonResponse(await Promise.all(assignedTasks.map(populatedTask)));
  }

  if (path.startsWith('/api/tasks/') && path.endsWith('/update-status') && request.method === 'PUT') {
    const id = path.split('/')[3];
    const body = await readBody(request);
    const tasks = await db.getAll(STORE.tasks);
    const task = tasks.find((item) => item.id === id);
    if (!task) return jsonResponse({ message: 'Task not found' }, { status: 404 });
    task.status = body.status;
    if (body.rationale !== undefined) task.rationale = body.rationale;
    task.completedPercentage = taskPercentFromStatus(body.status, task.completedPercentage);
    task.updatedAt = new Date().toISOString();
    await db.put(STORE.tasks, task);
    return jsonResponse(await populatedTask(task));
  }

  if (path.startsWith('/api/tasks/') && request.method === 'PUT') {
    const id = path.split('/')[3];
    const body = await readBody(request);
    const tasks = await db.getAll(STORE.tasks);
    const task = tasks.find((item) => item.id === id);
    if (!task) return jsonResponse({ message: 'Task not found' }, { status: 404 });
    ['projectTitle', 'description', 'deadline', 'completedPercentage'].forEach((key) => {
      if (body[key] !== undefined) task[key] = body[key];
    });
    task.updatedAt = new Date().toISOString();
    await db.put(STORE.tasks, task);
    return jsonResponse(await populatedTask(task));
  }

  if (path.startsWith('/api/tasks/') && request.method === 'DELETE') {
    const id = path.split('/')[3];
    await db.del(STORE.tasks, id);
    return jsonResponse({ message: 'Task deleted successfully' });
  }

  // Attendance endpoints (best-effort)
  if (path === '/api/user/attendance/checkin' && request.method === 'POST') {
    const body = await readBody(request);
    const payload = authUser();
    const userId = payload?.userId || payload?.id;
    const att = {
      id: crypto.randomUUID(),
      userId,
      status: 'checkedIn',
      timestamp: new Date().toISOString(),
      ...body
    };
    await db.put(STORE.attendance, att);
    return jsonResponse({ message: 'Checked in successfully' });
  }

  if (path === '/api/user/attendance/checkout' && request.method === 'POST') {
    const payload = authUser();
    const userId = payload?.userId || payload?.id;
    const att = {
      id: crypto.randomUUID(),
      userId,
      status: 'checkedOut',
      timestamp: new Date().toISOString()
    };
    await db.put(STORE.attendance, att);
    return jsonResponse({ message: 'Checked out successfully' });
  }

  if (path === '/api/user/attendance/status' && request.method === 'POST') {
    const payload = authUser();
    const userId = payload?.userId || payload?.id;
    const all = await db.getAll(STORE.attendance);
    const latest = all.filter(a => a.userId === userId).sort((a,b)=> (b.timestamp||'').localeCompare(a.timestamp||''))[0];
    return jsonResponse({ status: latest?.status || 'none' });
  }

  if (path === '/api/user/attendance/userhistory' && request.method === 'POST') {
    const payload = authUser();
    const userId = payload?.userId || payload?.id;
    const all = await db.getAll(STORE.attendance);
    const items = all
      .filter(a => (userId ? a.userId === userId : true))
      .sort((a,b)=> (b.timestamp||'').localeCompare(a.timestamp||''));
    return jsonResponse(await populatedAttendance(items));
  }

  if (path === '/api/user/attendance/history' && request.method === 'POST') {
    const all = await db.getAll(STORE.attendance);
    const items = all.sort((a,b)=> (b.timestamp||'').localeCompare(a.timestamp||''));
    return jsonResponse(await populatedAttendance(items));
  }

  // Default fallback
  return jsonResponse({ message: `No local handler for ${path} ${request.method}`, path }, { status: 501 });
}

// Public function used by fetch wrapper.
export async function handleRequest(request) {
  await db.ensureSeedData();
  const url = new URL(request.url, window.location.origin);
  const path = url.pathname;

  // Only emulate API calls. Everything else (assets) goes to real network.
  if (!path.startsWith('/api')) {
    // Some code calls /leave, /claims without /api; emulate best-effort for those.
    if (path.startsWith('/leave') || path.startsWith('/employee-leave-requests') || path.startsWith('/approve-leave') || path.startsWith('/claims')) {
      return handleApi(path, request);
    }
    return null;
  }

  return handleApi(path, request);
}
