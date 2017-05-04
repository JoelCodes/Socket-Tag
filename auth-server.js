const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const webpackDevMiddleware = require('webpack-dev-middleware');
const webpack = require('webpack');
const webpackConfig = require('./webpack.config.js');

require('dotenv').config();

const { TOKEN_SECRET } = process.env;

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true,
}));

app.use(webpackDevMiddleware(webpack(webpackConfig)));

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
