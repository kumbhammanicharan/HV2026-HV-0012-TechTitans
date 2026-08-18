const express = require('express');

const router = express.Router();

const authMiddleware =
    require('../middleware/authMiddleware');

const {
    submitFeedback,
    getAllFeedbacks,
    getStaffFeedback,
    getStaffPerformance
} = require('../controllers/feedbackController');


/*
|--------------------------------------------------------------------------
| GET ALL FEEDBACK
|--------------------------------------------------------------------------
| GET /api/feedback
|--------------------------------------------------------------------------
*/
router.get(
    '/',
    getAllFeedbacks
);


/*
|--------------------------------------------------------------------------
| GET TECHNICIAN PERFORMANCE
|--------------------------------------------------------------------------
| GET /api/feedback/staff-performance
|--------------------------------------------------------------------------
|
| Used by Admin Dashboard.
|
*/
router.get(
    '/staff-performance',
    authMiddleware,
    getStaffPerformance
);


/*
|--------------------------------------------------------------------------
| GET TECHNICIAN FEEDBACK
|--------------------------------------------------------------------------
| GET /api/feedback/staff/:staffId
|--------------------------------------------------------------------------
*/
router.get(
    '/staff/:staffId',
    authMiddleware,
    getStaffFeedback
);


/*
|--------------------------------------------------------------------------
| SUBMIT FEEDBACK
|--------------------------------------------------------------------------
| POST /api/feedback
|--------------------------------------------------------------------------
*/
router.post(
    '/',
    authMiddleware,
    submitFeedback
);


module.exports = router;