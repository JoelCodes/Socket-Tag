import React from 'react';
import PropTypes from 'prop-types';

export default function Login({ handleLogin }) {
  const onSubmit = (e) => {
    e.preventDefault();
    handleLogin(e.target.elements.email.value, e.target.elements.password.value);
  };

  return (<div>
    <h1 className="title">Please Log In</h1>
    <form onSubmit={onSubmit}>
      <div className="field">
        <label className="label" htmlFor="email">Email</label>
        <p className="control">
          <input type="email" name="email" defaultValue="me@joelshinness.com" />
        </p>
      </div>
      <div className="field">
        <label className="label" htmlFor="password">Password</label>
        <p className="control">
          <input type="password" name="password" defaultValue="asdf" />
        </p>
      </div>
      <div className="field">
        <p className="control">
          <button className="button is-primary">Submit</button>
        </p>
      </div>
    </form>
  </div>);
}

Login.propTypes = {
  handleLogin: PropTypes.func.isRequired,
};
