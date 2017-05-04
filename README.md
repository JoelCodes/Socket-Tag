# Tag Server

This is a server app that demonstrates two things:

1. Cross-server app authentication with JSON Web Tokens
1. Use of Redux for state management

## JWT

There are three big issues around logging in:

1. Authentication

This means "How confident are we that you are who you say you are?".  Email and passwords are an example based on an assumption: anyone with those two pieces of information should have the full powers of that person.  In the analogy of the nightclub, imagine a bouncer looking at a driver's license wondering if it's real and if it really matches the person who handed it over.

1. Identity

This means "Who are you and how can we give you individual service?"  We should only give you notifications that are relevant to you; we should present you with your items.  If we know who you are, we can offer you personalized service.  This would be like walking into a club and being handed my favorite drink.

1. Authorization

This is basically means "We know who you are and what you want to do.  Should we let you?".  This is like saying that, just because you're allowed in the club, that doesn't mean you'll be allowed into the VIP room with that lesser Kardashian.

But now the number of servers keeps growing.  It's not unreasonable to think that we might have an HTTP server written in .NET and hosted on Azure and a socket server written in Node served from Heroku.  How can we pass authentication info in such a way that it achieves the three goals without requiring the user to perform the authentication square dance for every server?

Enter the JSON Web Token!  JWT is a simple string representation of a JSON object that can have any number of "claims".  These claims can be things like user id, user name, a list of permissions, or even groups that this user can be part of.  They are also signed with a secret, and can only be verified with that secret, which means that we can at least know that this token was issued by the authentication server.  We can even use RSA, which means that we can use double-key crypto.  Take a look at the following code

### HTTP-Server

```js
const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');

require('dotenv').config();

const { TOKEN_SECRET } = process.env;

const app = express();

app.use(bodyParser.json());

app.use(express.static('public'));

const users = [
  { id: 'P1', name: 'Joel Shinness', email: 'me@joelshinness.com' },
  { id: 'P2', name: 'Fayez Saadi', email: 'fayez@saadi.com' },
  { id: 'P3', name: 'Ahmed', email: 'ah@med.com' },
];

app.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.sendStatus(400);
  } else {
    const foundUser = users.find(user => user.email === email);
    if (foundUser === undefined) {
      res.sendStatus(401);
    } else {
      const token = jwt.sign(foundUser, TOKEN_SECRET);
      // res.json({ ...foundUser, token });
      res.json(Object.assign({}, foundUser, { token }));
    }
  }
});

app.listen(3000);
```

### Socket Server

```js
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const socketIoJwt = require('socketio-jwt');

const app = express();
const server = http.Server(app);
const io = socketIo(server);

require('dotenv').config();

io.use(socketIoJwt.authorize({
  secret: process.env.SECRET,
  handshake: true,
}));

io.on('connection', (socket) => {
  console.log('Connect', socket.decoded_token);
});


server.listen(2017);
```

### Client App
```js
/* global fetch:false */
import React from 'react';
import { login } from '../services/login-service';

import Login from './Login';
import Game from './Game';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  onLoginSubmit(email, password) {
    this.setState({ loading: true });
    login(email, password)
    .then((data) => {
      console.log('Success', data);
      this.setState({ loading: false, jwt: data.token });
    });
  }
  render() {
    if (this.state.jwt === undefined) {
      if (this.state.loading) {
        return <h1>Loading...</h1>;
      }
      const handleLogin = (email, password) => this.onLoginSubmit(email, password);
      return (
        <Login handleLogin={handleLogin} />
      );
    }
    return (
      <Game jwt={this.state.jwt} />
    );
  }
}

export default App;
```

## State Management with Redux

State Management is always a pain, and with smart clients and socket servers, suddenly state is a big deal.  HTTP servers are stateless, generally speaking, but that's less likely to be the case.  Even with the Tweeter project, there wasn't really state: you would grab data with an AJAX call, turn the data into DOM, then append the DOM and discard the data.  Now, in React, our DOM is a mapped representation of our state.  We change state and watch the DOM change in response.  On the server side of chatty, we keep track of which users are there, who leaves, and who joins.  That's state.  We're not just passing this off to a database: we're keeping track in memory.  For this, I'm going to use an awesome tool: Redux.

Redux has become the *de rigeur* state management tool for React, and often when one discusses Redux, they mention React in the same breath.  Here, I'm going to use Redux apart from React: I'm going to create a Redux store for my socket server.

### Intro to Redux

Redux often takes a moment to understand, but it has a simple idea: there is a **store** that serves as the canonical "single source of truth" for the app (or at least for a certain section of an app.  An app doesn't change the store directly; rather, it sends **actions** which are then intercepted by **reducers**.  Reducers are pure functions, which means two things:

1. They *never* change any outside state, their incoming parameters, or perform any side effects.
1. They are *deterministic*, meaning that given the same input, they produce the same output.  No randomness, no date / time nonsense.

They predictably take in a current state and an action as parameters, then spit out a new state.  It's the difference between throwing a ball at a window and asking the question "If I had an unbroken window, and I threw a ball at it, what would happen?"  The reducer pattern can just respond, "Well, you'd have a broken window."

Here's a very simple redux app that just handles changes to a name.

```js
const { createStore } = require('redux');

const CHANGE_NAME = 'CHANGE_NAME';

function makeNameAction(newName) {
  return { type: CHANGE_NAME, newName };
}

// Start with an empty name.
const initialState = { name: '' };


function nameReducer(state = initialState, action) {
  switch (action.type) {
    // If there is a name change action return a new object.
    case CHANGE_NAME:
      return { name: action.newName };
    // Otherwise, just return the old object.
    default:
      return state;
  }
}

// Create the redux store
const nameStore = createStore(nameReducer);

console.log('Initial State', nameStore.getState());

// Subscribe to changes
const subscription = nameStore.subscribe(() => {
  console.log('Updated State', nameStore.getState());
});

// Create a new action and dispatch it.
const nameAction = makeNameAction('Joel');
console.log('Name Action', nameAction);
nameStore.dispatch(nameAction);

// Unsubscribe.
subscription();
```

Console output:

```
Initial State { name: '' }
Name Action { type: 'CHANGE_NAME', newName: 'Joel' }
Updated State { name: 'Joel' }
```

The initial state was just an object with an empty name.  The only way to change that was to dispatch the name action with the appropriate data, and Redux handled the rest.  I've included a tag reducer that let me add and remove people and play tag, and since it's a pure function, I was able to produce a test suite.  Just run `npm test` to see the output, and `npm run doc` to produce a markdown based documentation.

The point of this separation is that my socket is now responsible only to listen to the redux app and send updates, and dispatch actions to it.  I've separated my interface from my app logic in a way that gives me a lot of confidence in how the app logic will work.  Here's the relevant snippet from `game-server/index.js`

```js
const { createStore } = require('redux');

const { gameReducer, ADD_PLAYER, REMOVE_PLAYER, TAG } = require('./reducers/game');

const store = createStore(gameReducer);

io.on('connection', (socket) => {
  const { id, name } = socket.decoded_token;

  // Listen to the store and send the results to the socket.
  const subscription = store.subscribe(() => {
    socket.emit('update', store.getState());
  });

  // Update the store with this player.
  store.dispatch({ type: ADD_PLAYER, playerId: id, playerName: name });

  socket.on('tag', ({ targetId }) => {
    // Try to play tag.
    store.dispatch({ type: TAG, targetId, taggerId: id });
  });

  socket.on('disconnect', () => {
    // Let the store know that this person has left.
    store.dispatch({ type: REMOVE_PLAYER, playerId: id });
    // Unsubscribe to the store.
    subscription();
  });

});
```

### Individual view

This is the last step, and where we bring the conversation back to that question of identity.  One aspect that we want to emphasize is that we want to give people information that is relevant to them in a way that is relevant to them.  So I created another function called `gameView(state, playerId)` that would basically take this object:

```js
{
  players: [
    {id: 'P1', name: 'Joel', it: false},
    {id: 'P2', name: 'Jeff', it: true},
  ]
}
```

and for player `P1`, produce this object:

```js
{
  it: false // I am not it.
  players: [ // Remaining players who are not me.
    {id: 'P2', name: 'Jeff', it: true},
  ]
}
```

Since this is another pure function, it is very easily tested as well, and can be found in my test results. Now I update my emit to produce this distinct view.

```js
const { createStore } = require('redux');

const { gameReducer, ADD_PLAYER, REMOVE_PLAYER, TAG, gameView } = require('./reducers/game');

const store = createStore(gameReducer);

io.on('connection', (socket) => {
  const { id, name } = socket.decoded_token;

  // Listen to the store and send the results to the socket.
  const subscription = store.subscribe(() => {
    socket.emit('update', gameView(store.getState(), id));
  });
});
```
