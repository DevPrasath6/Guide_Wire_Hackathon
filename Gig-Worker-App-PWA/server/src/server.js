const http = require('http');
const app = require('./app');
const connectDB = require('./config/db');
const { initSocket } = require('./sockets/socket');

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

// Connect to Database
connectDB();

// Initialize Socket.io
const io = initSocket(server);
app.set('io', io);

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Swagger docs available at http://localhost:${PORT}/api-docs`);
});
