// updateFrontendEnv.js
import fs from 'fs';
import os from 'os';
import path from 'path';
import { fileURLToPath } from 'url';

// ESM-compatible __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get Local IP Address
function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const name in interfaces) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return '127.0.0.1';
}

const LOCAL_IP = getLocalIP();
console.log(`🌐 Detected Local IP: ${LOCAL_IP}`);

const envPath = path.join(__dirname, '.env');
let envContent = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf8') : '';

// Replace or append VITE_BACKEND_URL
if (envContent.includes('VITE_BACKEND_URL')) {
  envContent = envContent.replace(/VITE_BACKEND_URL=.*/g, `VITE_BACKEND_URL=http://localhost:5002`);
} else {
  envContent += `\nVITE_BACKEND_URL=http://localhost:5002\n`;
}

fs.writeFileSync(envPath, envContent.trim() + '\n', 'utf8');
console.log(`✅ .env updated at ${envPath}`);
