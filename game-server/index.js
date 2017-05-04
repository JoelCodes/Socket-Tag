const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const socketIoJwt = require('socketio-jwt');
require('dotenv').config();

const app = express();
const server = http.Server(app);
const io = socketIo(server);

const { createStore } = require('redux');

const { gameReducer, ADD_PLAYER, REMOVE_PLAYER, TAG, gameView } = require('./reducers/game');

const store = createStore(gameReducer);

store.subscribe(() => {
  console.log('Store Changed', store.getState());
});

io.use(socketIoJwt.authorize({
  secret: process.env.TOKEN_SECRET,
  handshake: true,
}));


io.on('connection', (socket) => {
  const { id, name } = socket.decoded_token;
  const subscription = store.subscribe(() => {
    socket.emit('update', gameView(store.getState(), id));
  });
  store.dispatch({ type: ADD_PLAYER, playerId: id, playerName: name });
  socket.on('tag', ({ targetId }) => {
    store.dispatch({ type: TAG, targetId, taggerId: id });
  });
  socket.on('disconnect', () => {
    store.dispatch({ type: REMOVE_PLAYER, playerId: id });
    subscription();
  });
  console.log('Connected', id, name);
});

server.listen(2017);
