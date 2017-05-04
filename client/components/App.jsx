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
