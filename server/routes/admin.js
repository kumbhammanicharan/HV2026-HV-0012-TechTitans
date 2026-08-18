const express = require('express');

const router = express.Router();

const authMiddleware =
    require('../middleware/authMiddleware');

const isAdmin =
    require('../middleware/isAdmin');

const {
    getAllUsers,
    getStudents,
    getStaff,
    blockUser,
    unblockUser,
    activateUser,
    deactivateUser,
    deleteUser,
    getTechnicianPerformance
} = require('../controllers/adminController');


/*
|--------------------------------------------------------------------------
| ADMIN PROTECTION
|--------------------------------------------------------------------------
|
| Every route in this file requires:
|
| 1. Valid JWT
| 2. Admin role
|
|--------------------------------------------------------------------------
*/

router.use(authMiddleware);
router.use(isAdmin);


/*
|--------------------------------------------------------------------------
| USER MANAGEMENT
|--------------------------------------------------------------------------
*/

/*
GET /api/admin/users
*/
router.get(
    '/users',
    getAllUsers
);


/*
GET /api/admin/students
*/
router.get(
    '/students',
    getStudents
);


/*
GET /api/admin/staff
*/
router.get(
    '/staff',
    getStaff
);


/*
|--------------------------------------------------------------------------
| TECHNICIAN ANALYTICS
|--------------------------------------------------------------------------
*/

/*
GET /api/admin/technicians/performance
*/
router.get(
    '/technicians/performance',
    getTechnicianPerformance
);


/*
|--------------------------------------------------------------------------
| BLOCK / UNBLOCK
|--------------------------------------------------------------------------
*/

/*
PUT /api/admin/users/:id/block
*/
router.put(
    '/users/:id/block',
    blockUser
);


/*
PUT /api/admin/users/:id/unblock
*/
router.put(
    '/users/:id/unblock',
    unblockUser
);


/*
|--------------------------------------------------------------------------
| ACTIVATE / DEACTIVATE
|--------------------------------------------------------------------------
*/

/*
PUT /api/admin/users/:id/activate
*/
router.put(
    '/users/:id/activate',
    activateUser
);


/*
PUT /api/admin/users/:id/deactivate
*/
router.put(
    '/users/:id/deactivate',
    deactivateUser
);


/*
|--------------------------------------------------------------------------
| DELETE USER
|--------------------------------------------------------------------------
*/

/*
DELETE /api/admin/users/:id
*/
router.delete(
    '/users/:id',
    deleteUser
);


module.exports = router;