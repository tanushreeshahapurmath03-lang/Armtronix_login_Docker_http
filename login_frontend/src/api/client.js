// api/client.js
// Replaced network persistence with local/offline emulator.
// Keeps axios usage + Authorization header behavior unchanged for UI code.

import axios from 'axios';
import { handleRequest } from './localApiEmulator';

// Axios baseURL is irrelevant in offline mode, but keep env logging for backward compat.
console.log('BACKEND_URL:', import.meta.env.VITE_BACKEND_URL);
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || `http://192.168.1.220:5002`;

const apiClient = axios.create({
  baseURL: BACKEND_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

function shouldEmulate(config) {
  const url = new URL(config.url || '', config.baseURL || BACKEND_URL || window.location.origin);
  const backendBase = import.meta.env.VITE_BACKEND_URL;
  const isApiPath = url.pathname.includes('/api/') || url.pathname.startsWith('/api');
  const isBackendHost = !!backendBase && url.href.startsWith(backendBase);
  return isApiPath && !isBackendHost;
}

async function parseResponseData(response, responseType) {
  if (responseType === 'blob') return response.blob();
  if (responseType === 'arraybuffer') return response.arrayBuffer();
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function rejectAxiosResponse(response) {
  const error = new Error(`Request failed with status code ${response.status}`);
  error.name = 'AxiosError';
  error.code = response.status >= 500 ? 'ERR_BAD_RESPONSE' : 'ERR_BAD_REQUEST';
  error.config = response.config;
  error.request = response.request;
  error.response = response;
  error.isAxiosError = true;
  error.toJSON = () => ({
    message: error.message,
    name: error.name,
    code: error.code,
    status: response.status
  });
  return Promise.reject(error);
}

async function localAxiosAdapter(config) {
  if (!shouldEmulate(config)) {
    return Promise.reject(new Error('External network calls are disabled in local mode.'));
  }

  const token = localStorage.getItem('token');
  const url = new URL(config.url || '', config.baseURL || BACKEND_URL || window.location.origin).toString();
  const headers = new Headers(config.headers || {});
  if (token && !headers.has('Authorization')) headers.set('Authorization', `Bearer ${token}`);

  const method = (config.method || 'get').toUpperCase();
  let body = config.data;
  if (body instanceof FormData) {
    headers.delete('Content-Type');
    headers.delete('content-type');
  } else if (body && typeof body !== 'string') {
    headers.set('Content-Type', headers.get('Content-Type') || 'application/json');
    body = JSON.stringify(body);
  }

  const request = new Request(url, {
    method,
    headers,
    body: ['GET', 'HEAD'].includes(method) ? undefined : body
  });
  const emulated = await handleRequest(request);
  const response = {
    data: await parseResponseData(emulated, config.responseType),
    status: emulated.status,
    statusText: emulated.statusText || '',
    headers: Object.fromEntries(emulated.headers.entries()),
    config,
    request
  };

  const validateStatus = config.validateStatus || ((status) => status >= 200 && status < 300);
  return validateStatus(response.status) ? response : rejectAxiosResponse(response);
}

function installLocalAxiosEmulator() {
  if (axios.__ARMTRONIX_LOCAL_EMULATOR__) return;
  axios.__ARMTRONIX_LOCAL_EMULATOR__ = true;
  axios.defaults.adapter = localAxiosAdapter;

  const originalCreate = axios.create.bind(axios);
  axios.create = (config = {}) => {
    const instance = originalCreate({ ...config, adapter: localAxiosAdapter });
    instance.defaults.adapter = localAxiosAdapter;
    return instance;
  };
}

installLocalAxiosEmulator();
apiClient.defaults.adapter = localAxiosAdapter;

export default apiClient;
