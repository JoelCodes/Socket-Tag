import React from 'react';
import PropTypes from 'prop-types';
import io from 'socket.io-client';

class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  componentDidMount() {
    const { jwt } = this.props;
    console.log('Got To Game with', jwt);
    this.socket = io.connect('ws://localhost:2017', {
      query: `token=${jwt}`,
    });
    this.socket.on('connect', () => {
      console.log('connect');
    });
    this.socket.on('update', (data) => {
      console.log('updated', data);
      this.setState({ game: data });
    });
  }
  tag(targetId) {
    this.socket.emit('tag', { targetId });
  }
  render() {
    const { jwt } = this.props;
    const { game } = this.state;

    const gameSection = game && (game.it ?
      (<div>
        <p>You Are It</p>
        <ul>
          {game.players.map(player => (<li key={player.id}><button onClick={() => this.tag(player.id)} className="button" >{player.name}</button></li>))}
        </ul>
      </div>) :
      (<div>
        <p>You Are Not It</p>
        <ul>
          {game.players.map(player => (<li key={player.id}>{player.name} {player.it ? '(it)' : ''}</li>))}
        </ul>
      </div>));
    return (
      <div>
        <h1 className="title">Connecting to game server</h1>
        <p>{jwt}</p>
        {gameSection}
        <p>{JSON.stringify(this.state.game)}</p>
      </div>
    );
  }
}

Game.propTypes = {
  jwt: PropTypes.string.isRequired,
};

export default Game;
