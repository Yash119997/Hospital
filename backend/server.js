// import express from 'express';
import dotenv from 'dotenv';
import connectDb from './config/db.js';
import { errorHandler, notFound } from './middleware/errorMiddleware.js';
import userRoutes from './routes/userRoutes.js';
import razorpayRoutes from './routes/razorpayRoutes.js';
import cors from 'cors';

// import http from 'http';
import express from 'express';

import { addUser, removeUser, getUser, getUsersInRoom } from './users.js';

const app = express();
// const server = http.createServer(app);

//
import { Server } from 'socket.io';

import { createServer } from 'http';

const server = createServer(app);
const io = new Server(server);

//
dotenv.config();
connectDb();
// const app = express();
app.use(express.json());
app.use(cors({ origin: true }));

app.get('/', (req, res) => {
  console.log('api is running');
});

app.use('/api/users', userRoutes);
app.use('/razorpay', razorpayRoutes);

app.use(errorHandler);
app.use(notFound);

const PORT = process.env.PORT;

io.on('connect', (socket) => {
  socket.on('join', ({ name, room }, callback) => {
    const { error, user } = addUser({ id: socket.id, name, room });

    if (error) return callback(error);

    socket.join(user.room);

    socket.emit('message', {
      user: 'admin',
      text: `${user.name}, welcome to room ${user.room}.`,
    });
    socket.broadcast
      .to(user.room)
      .emit('message', { user: 'admin', text: `${user.name} has joined!` });

    io.to(user.room).emit('roomData', {
      room: user.room,
      users: getUsersInRoom(user.room),
    });

    callback();
  });

  socket.on('sendMessage', (message, callback) => {
    const user = getUser(socket.id);

    io.to(user.room).emit('message', { user: user.name, text: message });

    callback();
  });

  socket.on('disconnect', () => {
    const user = removeUser(socket.id);

    if (user) {
      io.to(user.room).emit('message', {
        user: 'Admin',
        text: `${user.name} has left.`,
      });
      io.to(user.room).emit('roomData', {
        room: user.room,
        users: getUsersInRoom(user.room),
      });
    }
  });
});
server.listen(process.env.PORT || 5000, () =>
  console.log(`Server has started.`)
);
// app.listen(
//   PORT,
//   console.log(`server running on port ${PORT} in ${process.env.NODE_ENV} mode`)
// );
