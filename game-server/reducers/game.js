const createReducer = require('./create');

const initialState = { players: [] };
const ADD_PLAYER = 'ADD_PLAYER';
const REMOVE_PLAYER = 'REMOVE_PLAYER';
const TAG = 'TAG';

const gameReducer = createReducer(initialState, {
  [ADD_PLAYER](state, { playerId, playerName }) {
    // If player is null, ignore
    if (playerId == null || playerName == null) return state;
    // If there's already a player with that id, ignore
    if (state.players.some(player => player.id === playerId)) return state;

    return { players: state.players.map(player => Object.assign({}, player, { it: false }))
      .concat([{ id: playerId, name: playerName, it: true }]) };
  },
  [REMOVE_PLAYER](state, { playerId }) {
    const foundPlayer = state.players.find(player => player.id === playerId);
    if (foundPlayer === undefined) return state;
    const remainingPlayers = state.players.filter(player => player.id !== playerId);
    if (foundPlayer.it) {
      return { players: remainingPlayers.map((player, index) => {
        if (index === 0) return Object.assign({}, player, { it: true });
        return player;
      }) };
    }
    return { players: remainingPlayers };
  },
  [TAG](state, { taggerId, targetId }) {
    const tagger = state.players.find(player => player.id === taggerId);
    if (tagger == null || !tagger.it) return state;
    const target = state.players.find(player => player.id === targetId);
    if (target == null || target.it) return state;
    return { players: state.players.map((player) => {
      if (player.id === taggerId) {
        return Object.assign({}, player, { it: false });
      }
      if (player.id === targetId) {
        return Object.assign({}, player, { it: true });
      }
      return player;
    }) };
  },
});
function gameView(state, playerId) {
  const foundPlayer = state.players.find(player => player.id === playerId);
  if (foundPlayer === undefined) {
    return { players: [] };
  }
  const remainingPlayers = state.players.filter(player => player.id !== playerId);
  return { players: remainingPlayers, it: foundPlayer.it };
}
module.exports = {
  gameReducer,
  ADD_PLAYER,
  REMOVE_PLAYER,
  TAG,
  gameView,
};
