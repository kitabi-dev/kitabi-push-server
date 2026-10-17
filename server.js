const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

const devices = {};

io.on('connection', (socket) => {
  console.log('Device connected:', socket.id);
  socket.on('register', (data) => {
    devices[data.deviceId] = socket.id;
    console.log('Registered:', data.deviceId);
  });
  socket.on('disconnect', () => {
    console.log('Disconnected:', socket.id);
  });
});

app.get('/send', (req, res) => {
  const { deviceId, title, body } = req.query;
  const socketId = devices[deviceId];
  if (socketId) {
    io.to(socketId).emit('push-notification', {
      notification: { title, body }
    });
    res.json({ success: true, message: 'Sent' });
  } else {
    res.json({ success: false, message: 'Device not found' });
  }
});

server.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
