const express = require('express');
const router = express.Router();
const {sendReport, getAllReports} = require('../controllers/EReportController');


router.post('/ereport', sendReport);  
router.get('/getreport', getAllReports);
module.exports = router;
