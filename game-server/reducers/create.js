module.exports = function createReducer(initialState, handlers) {
  return function reducer(state = initialState, action) {
    if (action !== undefined && typeof handlers[action.type] === 'function') {
      return handlers[action.type](state, action);
    }
    return state;
  };
};
