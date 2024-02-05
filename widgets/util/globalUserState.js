// globalUserState.js
let user = null;
const listeners = new Set();

const setUser = (newUser) => {
  user = newUser;
  listeners.forEach((listener) => listener(newUser));
};

const subscribe = (listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

const getUser = () => user;

export { setUser, subscribe, getUser };
