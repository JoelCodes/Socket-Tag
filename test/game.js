/* global describe, it */
const expect = require('chai').expect;
const { gameReducer, ADD_PLAYER, REMOVE_PLAYER, TAG, gameView } = require('../game-server/reducers/game');

describe('#gameReducer(state, action)', () => {
  it('returns the proper initial state', () => {
    const initialState = gameReducer();

    expect(initialState).to.deep.eq({ players: [] });
  });
  describe('Adding and removing players', () => {
    describe('{type: ADD_PLAYER, playerId: String, playerName: String}', () => {
      it('ignores an undefined playerId', () => {
        const initialState = gameReducer();
        const move = { type: ADD_PLAYER };

        expect(gameReducer(initialState, move)).to.eq(initialState);
      });
      it('ignores an existing playerId', () => {
        const initialState = { players: [{ id: 'P1' }] };
        const move = { type: ADD_PLAYER, playerId: 'P1' };

        expect(gameReducer(initialState, move)).to.eq(initialState);
      });
      it('ignores an empty player name', () => {
        const initialState = { players: [{ id: 'P1' }] };
        const move = { type: ADD_PLAYER, playerId: 'P2' };

        expect(gameReducer(initialState, move)).to.eq(initialState);
      });
      it('adds a new player and makes them it', () => {
        const initialState = { players: [{ id: 'P1', it: true }] };
        const move = { type: ADD_PLAYER, playerId: 'P2', playerName: 'Jeff' };

        expect(gameReducer(initialState, move)).to.deep.eq({
          players: [
            { id: 'P1', it: false },
            { id: 'P2', it: true, name: 'Jeff' },
          ],
        });
      });
    });
    describe('{type: REMOVE_PLAYER, playerId: String}', () => {
      it('ignores an undefined playerId', () => {
        const initialState = { players: [{ id: 'P1', it: true }] };
        const move = { type: REMOVE_PLAYER };

        expect(gameReducer(initialState, move)).to.deep.eq(initialState);
      });
      it('ignores a player not in the system', () => {
        const initialState = { players: [{ id: 'P1', it: true }] };
        const move = { type: REMOVE_PLAYER, playerId: 'P2' };

        expect(gameReducer(initialState, move)).to.deep.eq(initialState);
      });
      it('takes out an existing player', () => {
        const initialState = { players: [{ id: 'P1', it: false }, { id: 'P2', it: true }] };
        const move = { type: REMOVE_PLAYER, playerId: 'P1' };

        expect(gameReducer(initialState, move)).to.deep.eq({ players: [{ id: 'P2', it: true }] });
      });
      it('takes out an existing player and, if necessary, transfers the new it', () => {
        const initialState = { players: [{ id: 'P1', it: true }, { id: 'P2', it: false }, { id: 'P3', it: false }] };
        const move = { type: REMOVE_PLAYER, playerId: 'P1' };

        expect(gameReducer(initialState, move)).to.deep.eq({ players: [{ id: 'P2', it: true }, { id: 'P3', it: false }] });
      });
    });
  });
  describe('Tag', () => {
    describe('{type: TAG, taggerId:string, targetId:string}', () => {
      it('ignores a tag from someone who isn\'t it', () => {
        const initialState = { players: [{ id: 'P1', it: true }, { id: 'P2', it: false }, { id: 'P3', it: false }] };
        const move = { type: TAG, taggerId: 'P2', targetId: 'P3' };

        expect(gameReducer(initialState, move)).to.deep.eq(initialState);
      });
      it('ignores a tag to the current it', () => {
        const initialState = { players: [{ id: 'P1', it: true }, { id: 'P2', it: false }, { id: 'P3', it: false }] };
        const move = { type: TAG, taggerId: 'P1', targetId: 'P1' };

        expect(gameReducer(initialState, move)).to.deep.eq(initialState);
      });
      it('ignores a tag to a target not in the game', () => {
        const initialState = { players: [{ id: 'P1', it: true }, { id: 'P2', it: false }, { id: 'P3', it: false }] };
        const move = { type: TAG, taggerId: 'P1', targetId: 'P4' };

        expect(gameReducer(initialState, move)).to.deep.eq(initialState);
      });
      it('makes an appropriate target the new it', () => {
        const initialState = { players: [{ id: 'P1', it: true }, { id: 'P2', it: false }, { id: 'P3', it: false }] };
        const move = { type: TAG, taggerId: 'P1', targetId: 'P2' };

        expect(gameReducer(initialState, move)).to.deep.eq({ players: [
          { id: 'P1', it: false },
          { id: 'P2', it: true },
          { id: 'P3', it: false },
        ] });
      });
    });
  });
});

describe('#gameView(state, playerId)', () => {
  it('renders nothing for a player who isn\'t playing', () => {
    const initialState = {
      players: [
          { id: 'P1', it: false, name: 'Joel' },
          { id: 'P2', it: true, name: 'Jeff' },
      ],
    };
    expect(gameView(initialState, 'P3')).to.deep.eq({ players: [] });
  });
  it('gives a player a customized view', () => {
    const initialState = {
      players: [
          { id: 'P1', it: false, name: 'Joel' },
          { id: 'P2', it: true, name: 'Jeff' },
      ],
    };
    expect(gameView(initialState, 'P1')).to.deep.eq({
      it: false,
      players: [
        { id: 'P2', it: true, name: 'Jeff' },
      ] });
    expect(gameView(initialState, 'P2')).to.deep.eq({
      it: true,
      players: [
        { id: 'P1', it: false, name: 'Joel' },
      ] });
  });
});
