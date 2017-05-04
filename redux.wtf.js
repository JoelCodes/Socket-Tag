const { createStore } = require('redux');

const CHANGE_NAME = 'CHANGE_NAME';

function makeNameAction(newName) {
  return { type: CHANGE_NAME, newName };
}

const initialState = { name: '' };

function nameReducer(state = initialState, action) {
  switch (action.type) {
    case CHANGE_NAME:
      return { name: action.newName };
    default:
      return state;
  }
}

const nameStore = createStore(nameReducer);

console.log('Initial State', nameStore.getState());

const subscription = nameStore.subscribe(() => {
  console.log('Updated State', nameStore.getState());
});

const nameAction = makeNameAction('Joel');
console.log('Name Action', nameAction);
nameStore.dispatch(nameAction);
subscription();
