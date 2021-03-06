const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const { generateMessage, generateLocationMessage } = require('./utils/messages');
const { addUser, removeUser, getUser, getUsersInRoom } = require('./utils/users');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const port = process.env.PORT || 3000;
const publicPath = path.join(__dirname, '../public');

app.use(express.static(publicPath));

io.on('connection', (socket) => {
    socket.on('join', ({ username, room }, callback) => {
        const { error, user } = addUser({ id: socket.id, username, room });
        console.log()

        if (!user) {
            return callback(error);
        }

        socket.join(user.room);

        socket.emit('message', generateMessage('Server' ,`Welcome to room ${user.room}.`));
        socket.broadcast.to(user.room).emit('message', generateMessage('Server' ,`${user.username} has joined.`));

        io.to(user.room).emit('updateRoom', {
            room: user.room,
            users: getUsersInRoom(user.room)
        });

        callback();
    });

    socket.on('sendMessage', (message, callback) => {
        const user = getUser(socket.id);

        io.to(user.room).emit('message', generateMessage(user.username ,message));
        callback();
    });

    socket.on('sendLocation', (latitude, longitude, callback) => {
        const user = getUser(socket.id);

        io.to(user.room).emit('locationMessage', generateLocationMessage(user.username ,{ latitude, longitude }));
        callback();
    });

    socket.on('disconnect', () => {
        const user = removeUser(socket.id);

        if (user) {
            io.to(user.room).emit('message', generateMessage('Server' ,`${user.username} has left.`));

            io.to(user.room).emit('updateRoom', {
                room: user.room,
                users: getUsersInRoom(user.room)
            });
        }
    });
});

server.listen(port, () => {
    console.log(`Server is running at port ${port}`);
});