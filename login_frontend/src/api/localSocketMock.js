const listeners = new Map();

function addListener(event, handler) {
  const handlers = listeners.get(event) || new Set();
  handlers.add(handler);
  listeners.set(event, handlers);
}

function removeListener(event, handler) {
  if (!event) {
    listeners.clear();
    return;
  }

  if (!handler) {
    listeners.delete(event);
    return;
  }

  const handlers = listeners.get(event);
  if (handlers) handlers.delete(handler);
}

export function io() {
  return {
    connected: true,
    connect() {
      return this;
    },
    disconnect() {
      return this;
    },
    emit(event, payload) {
      const handlers = listeners.get(event);
      if (handlers) handlers.forEach((handler) => handler(payload));
      return this;
    },
    on(event, handler) {
      addListener(event, handler);
      return this;
    },
    off(event, handler) {
      removeListener(event, handler);
      return this;
    }
  };
}

export default io;
