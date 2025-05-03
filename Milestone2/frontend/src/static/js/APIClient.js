import HTTPClient from './HTTPClient.js';

const BASE_API_PATH = './api';

// User Routes
const logIn = (email, password) => {
  const data = {
    email: email,
    password: password
  };
  return HTTPClient.post(`${BASE_API_PATH}/users/login`, data);
};

const logOut = () => {
  return HTTPClient.post(`${BASE_API_PATH}/users/logout`, {});
};

const getCurrentUser = () => {
  return HTTPClient.get(`${BASE_API_PATH}/users/current`);
};


// Player Routes
const registerPlayer = (fullName, email, password) => {
  const data = {
    fullName: fullName,
    email: email,
    password: password
  };
  return HTTPClient.post(`${BASE_API_PATH}/players`, data);
};

const getPlayerById = (userId) => {
  return HTTPClient.get(`${BASE_API_PATH}/players/${userId}`);
};

const getPlayerPlays = (userId) => {
  return HTTPClient.get(`${BASE_API_PATH}/players/${userId}/plays`);
};

const getPlayerCoaches = (userId) => {
  return HTTPClient.get(`${BASE_API_PATH}/players/${userId}/coaches`);
};

const updatePlayer = (fullName, email, password) => {
  // TODO
};

const deletePlayer = () => {
  // TODO
};


// Coach Routes
const registerCoach = (fullName, email, password) => {
  const data = {
    fullName: fullName,
    email: email,
    password: password
  };
  return HTTPClient.post(`${BASE_API_PATH}/coaches`, data);
};

const getCoachById = (userId) => {
  return HTTPClient.get(`${BASE_API_PATH}/coaches/${userId}`);
};

const getCoachPlays = (userId) => {
  return HTTPClient.get(`${BASE_API_PATH}/coaches/${userId}/plays`);
};

const updateCoach = (fullName, email, password) => {
  // TODO
};

const deleteCoach = () => {
  // TODO
};


// Play Routes
const getPlayById = (playId) => {
  return HTTPClient.get(`${BASE_API_PATH}/plays/${playId}`);
};

const createNewPlay = (playTitle) => {
  const data = {
    playTitle: playTitle
  };
  return HTTPClient.post(`${BASE_API_PATH}/plays`, data);
};

const updatePlay = (fullName, email, password) => {
  // TODO
};

const deletePlay = () => {
  // TODO
};


export default {
  logIn,
  logOut,
  getCurrentUser,

  registerPlayer,
  getPlayerById,
  getPlayerPlays,
  getPlayerCoaches,
  updatePlayer,
  deletePlayer,

  registerCoach,
  getCoachById,
  getCoachPlays,
  updateCoach,
  deleteCoach,
};
