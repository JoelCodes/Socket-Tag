const jwt = require('jsonwebtoken');

const data = { name: 'Joel Shinness', admin: true, groups: ['JavaScript Nerds', 'Mandolin Nerds', 'Tolkien Nerds'] };

const secret = 'fluffybunny';
const token = jwt.sign(data, secret);

console.log(token, token.length);

const decodedToken = jwt.verify(token, secret);
console.log(decodedToken);

try {
  jwt.verify(token, 'fluffypuppy');
} catch (err) {
  console.error(err.message);
}
