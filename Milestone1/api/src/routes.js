const express = require('express');
const router = express.Router();

const APIRoutes = require('./APIRoutes');
router.use('/api', APIRoutes);

module.exports = router;