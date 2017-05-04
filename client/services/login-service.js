/* global fetch */
export function login(email, password) {
  return new Promise(resolve => setTimeout(resolve, 1000))
    .then(() => fetch('/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
      body: JSON.stringify({ email, password }),
    }))
    .then(response => response.json());
}

