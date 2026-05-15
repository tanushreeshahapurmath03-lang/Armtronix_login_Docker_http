// const express = require('express');
// const mongoose = require('mongoose');
// const cors = require('cors');
// const dotenv = require('dotenv');
// const path = require('path');
// const fs = require('fs');
// const http = require('http');
// const { Server } = require('socket.io');
// const os = require('os');

// // Routes
// const authRoutes = require('./routes/authRoutes');
// const userRoutes = require('./routes/userRoutes');
// const leaveRoutes = require('./routes/leaveRoutes');
// const taskRoutes = require('./routes/taskRoutes');
// const claimRoutes = require('./routes/claimRoutes');
// const paymentRoutes = require('./routes/paymentRoutes');

// // Function to get local IP dynamically
// function getLocalIP() {
//   const interfaces = os.networkInterfaces();
//   for (let interfaceName in interfaces) {
//     for (let iface of interfaces[interfaceName]) {
//       if (iface.family === 'IPv4' && !iface.internal) {
//         return iface.address;
//       }
//     }
//   }
//   return '127.0.0.1'; // Default fallback
// }

// const LOCAL_IP = getLocalIP();
// console.log(`📡 Local IP detected: ${LOCAL_IP}`);

// // Path to .env file
// const envPath = path.join(__dirname, '.env');

// // Read and update .env
// let envContent = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf8') : '';
// envContent = envContent
//   .replace(/VITE_MONGO_URI=mongodb:\/\/.*:27017\/Notifications/, `VITE_MONGO_URI=mongodb://${LOCAL_IP}:27017/Notifications`)
//   .replace(/VITE_FRONTEND_URL=http:\/\/.*:5176/, `VITE_FRONTEND_URL=http://${LOCAL_IP}:5176`);

// // Write updated .env
// fs.writeFileSync(envPath, envContent, 'utf8');
// console.log("✅ Updated .env file with LOCAL_IP.");

// dotenv.config(); // Reload updated environment variables

// const FRONTEND_URL = process.env.VITE_FRONTEND_URL || `http://${LOCAL_IP}:5176`;
// const PORT = process.env.PORT || process.env.VITE_BACKEND_PORT || 5002;

// // Create an HTTPS server
// const app = express();
// const server = http.createServer(app);

// // WebSocket Server
// // const io = new Server(server, {
// //   cors: {
// //     origin: [`http://${LOCAL_IP}:5176`],
// //     methods: ["GET", "POST", "PUT", "DELETE"],
// //     credentials: true
// //   }
// // });

// const io = new Server(server, {
//   cors: {
//     origin: [
//       `http://${LOCAL_IP}:5176`,
//       // `https://team.armtronix.net`,
//     ],
//     methods: ["GET", "POST", "PUT", "DELETE"],
//     credentials: true
//   }
// });


// // Enable CORS
// app.use(cors({
//   origin: FRONTEND_URL,
//   methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
//   credentials: true
// }));
// app.use(express.json());
// // app.options('*', cors());

// // Redirect HTTP to HTTPS in production
// app.use((req, res, next) => {
//   if (req.headers['x-forwarded-proto'] !== 'https' && process.env.NODE_ENV === 'production') {
//     return res.redirect('https://' + req.headers.host + req.url);
//   }
//   next();
// });

// // MongoDB Connection
// const mongoURI = process.env.VITE_MONGO_URI || `mongodb://${LOCAL_IP}:27017/employee-auth`;

// mongoose.connect(mongoURI, {
//   useNewUrlParser: true,
//   useUnifiedTopology: true
// })
//   .then(() => console.log('✅ Connected to MongoDB successfully!'))
//   .catch(err => {
//     console.error('❌ MongoDB connection error:', err);
//     process.exit(1);
//   });

// // Serve static files
// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// // API Routes
// app.use('/api/auth', authRoutes);
// app.use('/api/user', userRoutes);
// app.use('/', leaveRoutes);
// app.use('/', taskRoutes);
// app.use('/', claimRoutes);
// app.use('/', paymentRoutes);

// // WebSocket Events
// io.on("connection", (socket) => {
//   console.log("⚡ A user connected");

//   socket.on("join_room", (email) => {
//     socket.join(email);
//     console.log(`🔗 User joined room: ${email}`);
//   });

//   socket.on("disconnect", () => {
//     console.log("❌ A user disconnected");
//   });

//   socket.on("error", (error) => {
//     console.error("⚠️ Socket error:", error);
//   });
// });

// server.listen(PORT, () => {
//   console.log(`🚀 Backend running over HTTP on port ${PORT}`);
//   console.log(`🌐 Public access: http://${LOCAL_IP}:5002`);
// });




const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
const http = require('http');
const { Server } = require('socket.io');
const os = require('os');
const bcrypt = require('bcryptjs');

// Routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const leaveRoutes = require('./routes/leaveRoutes');
const taskRoutes = require('./routes/taskRoutes');
const claimRoutes = require('./routes/claimRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const eventRoutes = require('./routes/eventRoutes');
const User = require('./models/User');

// Function to get local IP dynamically
function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (let interfaceName in interfaces) {
    for (let iface of interfaces[interfaceName]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return '127.0.0.1'; // Default fallback
}

const LOCAL_IP = getLocalIP();
console.log(`📡 Local IP detected: ${LOCAL_IP}`);

// Path to .env file
const envPath = path.join(__dirname, '.env');

// // Read and update .env
// let envContent = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf8') : '';
// envContent = envContent
//   .replace(/VITE_MONGO_URI=mongodb:\/\/.*:27017\/Notifications/, `VITE_MONGO_URI=mongodb://${LOCAL_IP}:27017/Notifications`)
//   .replace(/VITE_FRONTEND_URL=http:\/\/.*:5176/, `VITE_FRONTEND_URL=http://${LOCAL_IP}:5176`);

// // Write updated .env
// fs.writeFileSync(envPath, envContent, 'utf8');
// console.log("✅ Updated .env file with LOCAL_IP.");

dotenv.config(); // Reload updated environment variables

const FRONTEND_URL = process.env.VITE_FRONTEND_URL || `http://${LOCAL_IP}:5176`;
const PORT = process.env.PORT || process.env.VITE_BACKEND_PORT || 5002;

const app = express();
const server = http.createServer(app);

const ALLOWED_ORIGINS = [
  FRONTEND_URL,
  'http://localhost:5176',
  'http://127.0.0.1:5176',
  'http://localhost:5173',
  'http://127.0.0.1:5173'
];

// WebSocket Server with CORS
const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      if (!origin || ALLOWED_ORIGINS.includes(origin)) {
        return callback(null, true);
      }
      callback(new Error('Not allowed by CORS'));
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
  }
});

// Middleware
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || ALLOWED_ORIGINS.includes(origin)) {
      return callback(null, true);
    }
    callback(new Error('Not allowed by CORS'));
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true
}));
app.use(express.json());

// Redirect HTTP to HTTPS in production
app.use((req, res, next) => {
  if (req.headers['x-forwarded-proto'] !== 'https' && process.env.NODE_ENV === 'production') {
    return res.redirect('https://' + req.headers.host + req.url);
  }
  next();
});

// MongoDB Connection
const mongoURI = process.env.MONGODB_URI || process.env.VITE_MONGO_URI || `mongodb://${LOCAL_IP}:27017/employee-auth`;
console.log(`📚 MongoDB URI: ${mongoURI}`);

mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(async () => {
    console.log('✅ Connected to MongoDB successfully!');

    try {
      const existingAdmin = await User.findOne({ email: 'admin@gmail.com' });
      if (!existingAdmin) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('123456', salt);
        const adminUser = new User({
          name: 'Admin',
          empId: 'admin',
          email: 'admin@gmail.com',
          password: hashedPassword,
          role: 'admin',
          requirePasswordChange: false
        });
        await adminUser.save();
        console.log('✅ Default admin user created: admin@gmail.com');
      } else {
        const passwordMatches = await bcrypt.compare('123456', existingAdmin.password);
        if (!passwordMatches) {
          const salt = await bcrypt.genSalt(10);
          existingAdmin.password = await bcrypt.hash('123456', salt);
          existingAdmin.requirePasswordChange = false;
          await existingAdmin.save();
          console.log('✅ Admin password reset to admin@gmail.com / 123456');
        } else {
          console.log('ℹ️ Default admin user already exists and password is up to date.');
        }
      }
    } catch (seedError) {
      console.error('❌ Error seeding default admin user:', seedError);
    }
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/', leaveRoutes);
app.use('/', taskRoutes);
app.use('/', claimRoutes);
app.use('/', paymentRoutes);
app.use('/api/events', eventRoutes);

// WebSocket Events with Cleanup
io.on("connection", (socket) => {
  console.log("⚡ A user connected");

  // Track intervals for this socket
  socket.intervals = [];

  socket.on("join_room", (email) => {
    socket.join(email);
    console.log(`🔗 User joined room: ${email}`);

    // Example: Periodic heartbeat
    const intervalId = setInterval(() => {
      socket.emit("heartbeat", { time: new Date() });
    }, 10000); // 10 seconds

    socket.intervals.push(intervalId);
  });

  socket.on("disconnect", () => {
    console.log("❌ A user disconnected");

    // Clear any intervals tied to this socket
    if (socket.intervals) {
      socket.intervals.forEach(clearInterval);
    }

    // Clean up all listeners
    socket.removeAllListeners();
  });

  socket.on("error", (error) => {
    console.error("⚠️ Socket error:", error);
  });
});

// Start server
server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Backend running over HTTP on port ${PORT}`);
  console.log(`🌐 Public access: http://${LOCAL_IP}:5002`);
});

