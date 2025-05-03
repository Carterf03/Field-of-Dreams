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

const followCoach = (playerId, coachCode) => {
  const data = {
    coachCode: coachCode
  };
  return HTTPClient.post(`${BASE_API_PATH}/players/${playerId}`, data);
};

const updatePlayer = (userId, fullName, email, password, avatar) => {
  const data = {
    fullName: fullName,
    email: email,
    password: password,
    avatar: avatar
  };
  return HTTPClient.put(`${BASE_API_PATH}/players/${userId}`, data);
};

const deletePlayer = (userId) => {
  return HTTPClient.delete(`${BASE_API_PATH}/players`);
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

const updateCoach = (userId, fullName, email, password, avatar) => {
  const data = {
    fullName: fullName,
    email: email,
    password: password,
    avatar: avatar
  };
  return HTTPClient.put(`${BASE_API_PATH}/coaches/${userId}`, data);
};

const deleteCoach = (userId) => {
  return HTTPClient.delete(`${BASE_API_PATH}/coaches/${userId}`);
};


// Play Routes
const getPlayById = (playId) => {
  return HTTPClient.get(`${BASE_API_PATH}/plays/${playId}`);
};

const getPlayFrames = (playId) => {
  return HTTPClient.get(`${BASE_API_PATH}/plays/${playId}/frames`);
};

const createNewPlay = (playTitle, playPreview) => {
  const data = {
    playTitle: playTitle,
    playPreview: playPreview
  };
  console.log("Data in APIClient:", data);
  return HTTPClient.post(`${BASE_API_PATH}/plays`, data);
};

const updatePlay = (playId, playTitle, playPreview) => {
  const data = {
    playTitle: playTitle,
    playPreview: playPreview
  }
  return HTTPClient.put(`${BASE_API_PATH}/plays/${playId}`, data);
};

const savePlayPreviewImage = (imageBlob, filename) => {
  const formData = new FormData();
  formData.append('preview', imageBlob, filename);
  
  // Using a custom fetch implementation since HTTPClient doesn't support formData
  return fetch(`${BASE_API_PATH}/preview`, {
    method: 'POST',
    body: formData,
  })
  .then(res => {
    if(!res.ok) {
      const error = new Error(`This request was not successful: ${res.statusText} (${res.status})`);
      error.status = res.status;
      throw error;
    }
    return res.json();
  })
  .catch(err => {
    console.error('Error in fetch', err);
    throw err;
  });
};

const deletePlay = (playId) => {
  return HTTPClient.delete(`${BASE_API_PATH}/plays/${playId}`);
};

// Frame Routes
const getFrameById = (frameId) => {
  return HTTPClient.get(`${BASE_API_PATH}/frames/${frameId}`);
};

const getFrameObjects = (frameId) => {
  return HTTPClient.get(`${BASE_API_PATH}/frames/${frameId}/objects`);
};

const createNewFrame = (ball_x, ball_y) => {
  const data = {
    ball_x: ball_x,
    ball_y: ball_y
  };
  return HTTPClient.post(`${BASE_API_PATH}/frames`, data);
};

const updateFrame = (frameId, ball_x, ball_y) => {
  const data = {
    ball_x: ball_x,
    ball_y: ball_y
  };
  return HTTPClient.put(`${BASE_API_PATH}/frames/${frameId}`, data);
};

const deleteFrame = (frameId) => {
  return HTTPClient.delete(`${BASE_API_PATH}/frames/${frameId}`);
};

// Object Routes

const getObjectMoves = (playerId) => {
  return HTTPClient.get(`${BASE_API_PATH}/objects/${playerId}`);
};

const createNewObject = (playerId, objectX, objectY, objectColor, frameId) => {
  const data = {
    playerId: playerId,
    objectX: objectX,
    objectY: objectY,
    objectColor: objectColor,
    frameId: frameId
  };
  return HTTPClient.post(`${BASE_API_PATH}/objects`, data);
};

const updateObject = (objectId, playerId, objectX, objectY, objectColor) => {
  const data = {
    objectId: objectId,
    playerId: playerId,
    objectX: objectX,
    objectY: objectY,
    objectColor: objectColor
  };
  return HTTPClient.put(`${BASE_API_PATH}/objects/${objectId}`, data);
};

const deleteObject = (objectId) => {
  return HTTPClient.delete(`${BASE_API_PATH}/objects/${objectId}`);
};




export default {
  logIn,
  logOut,
  getCurrentUser,

  registerPlayer,
  getPlayerById,
  getPlayerPlays,
  getPlayerCoaches,
  followCoach,
  updatePlayer,
  deletePlayer,

  registerCoach,
  getCoachById,
  getCoachPlays,
  updateCoach,
  deleteCoach,

  getPlayById,
  getPlayFrames,
  createNewPlay,
  updatePlay,
  savePlayPreviewImage,
  deletePlay,

  getFrameById,
  getFrameObjects,
  createNewFrame,
  updateFrame,
  deleteFrame,

  getObjectMoves,
  createNewObject,
  updateObject,
  deleteObject
};
