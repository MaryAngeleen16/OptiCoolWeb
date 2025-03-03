const express = require('express');
const router = express.Router();
const {createLog, getLogs} = require('../controllers/LogController');
const { isAuthenticated } = require('../middlewares/auth');

router.post('/userlogs', isAuthenticated, createLog);
router.get('/loglist', isAuthenticated, getLogs);

module.exports = router;
