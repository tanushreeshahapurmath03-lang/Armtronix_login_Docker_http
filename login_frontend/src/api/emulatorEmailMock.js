// Email functionality disabled for local/offline mode.
// This file provides minimal success/failure shapes so UI flows don't break.

export function mockEmailSuccess(message = 'Email notification disabled (local mode).') {
  return { message };
}

