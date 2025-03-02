const express = require('express');
const router = express.Router();
const {getAllReports, reportSent} = require('../controllers/EReportController');
const { isAuthenticated } = require('../middlewares/auth');

// router.post('/ereport', sendReport);  
router.get('/getreport', getAllReports);
router.post('/ereport', reportSent);  
module.exports = router;
