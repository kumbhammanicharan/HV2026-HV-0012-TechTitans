const express = require('express');
const mongoose = require('mongoose');

const {
    register,
    login,
    getUserStats
} = require('../controllers/authController');

const User = require('../models/User');

const router = express.Router();

const authMiddleware =
    require('../middleware/authMiddleware');

const isAdmin =
    require('../middleware/isAdmin');


/*
|--------------------------------------------------------------------------
| PUBLIC
|--------------------------------------------------------------------------
*/

router.get(
    '/stats',
    getUserStats
);

router.post(
    '/register',
    register
);

router.post(
    '/login',
    login
);


/*
|--------------------------------------------------------------------------
| USER PROFILE
|--------------------------------------------------------------------------
*/

router.get(
    '/profile',
    authMiddleware,
    async (req, res) => {
        try {
            const user =
                await User.findById(
                    req.user.id
                ).select(
                    '-password'
                );

            if (!user) {
                return res.status(404).json({
                    message:
                        'User not found.'
                });
            }

            return res.json(
                user
            );

        } catch (error) {
            console.error(
                'PROFILE ERROR:',
                error
            );

            return res.status(500).json({
                message:
                    'Server error.'
            });
        }
    }
);


/*
|--------------------------------------------------------------------------
| ADMIN - GET ALL STAFF / TECHNICIANS
|--------------------------------------------------------------------------
*/

router.get(
    '/staff',
    authMiddleware,
    isAdmin,
    async (req, res) => {
        try {
            const staff =
                await User.find({
                    role: 'staff'
                })
                    .select(
                        '-password'
                    )
                    .sort({
                        name: 1
                    });

            return res.json(
                staff
            );

        } catch (error) {
            console.error(
                'GET STAFF ERROR:',
                error
            );

            return res.status(500).json({
                message:
                    'Error fetching staff list.'
            });
        }
    }
);


/*
|--------------------------------------------------------------------------
| ADMIN - GET ALL USERS
|--------------------------------------------------------------------------
| GET /api/auth/users
|--------------------------------------------------------------------------
*/

router.get(
    '/users',
    authMiddleware,
    isAdmin,
    async (req, res) => {
        try {
            const users =
                await User.find()
                    .select(
                        '-password'
                    )
                    .sort({
                        createdAt: -1
                    });

            return res.json(
                users
            );

        } catch (error) {
            console.error(
                'GET USERS ERROR:',
                error
            );

            return res.status(500).json({
                message:
                    'Unable to load users.'
            });
        }
    }
);


/*
|--------------------------------------------------------------------------
| ADMIN - GET STUDENTS
|--------------------------------------------------------------------------
*/

router.get(
    '/students',
    authMiddleware,
    isAdmin,
    async (req, res) => {
        try {
            const students =
                await User.find({
                    role: 'student'
                })
                    .select(
                        '-password'
                    )
                    .sort({
                        createdAt: -1
                    });

            return res.json(
                students
            );

        } catch (error) {
            console.error(
                'GET STUDENTS ERROR:',
                error
            );

            return res.status(500).json({
                message:
                    'Unable to load students.'
            });
        }
    }
);


/*
|--------------------------------------------------------------------------
| ADMIN - BLOCK STUDENT
|--------------------------------------------------------------------------
| PUT /api/auth/users/:id/block
|--------------------------------------------------------------------------
*/

router.put(
    '/users/:id/block',
    authMiddleware,
    isAdmin,
    async (req, res) => {
        try {
            const {
                id
            } = req.params;

            const {
                reason
            } = req.body;

            if (
                !mongoose.Types.ObjectId.isValid(
                    id
                )
            ) {
                return res.status(400).json({
                    message:
                        'Invalid user ID.'
                });
            }

            const user =
                await User.findOne({
                    _id: id,
                    role: 'student'
                });

            if (!user) {
                return res.status(404).json({
                    message:
                        'Student not found.'
                });
            }

            user.isBlocked = true;
            user.isActive = false;
            user.blockedAt = new Date();
            user.blockedReason =
                reason
                    ? reason.trim()
                    : 'Blocked by administrator.';

            await user.save();

            return res.json({
                message:
                    'Student blocked successfully.',
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    isBlocked:
                        user.isBlocked,
                    isActive:
                        user.isActive,
                    blockedAt:
                        user.blockedAt,
                    blockedReason:
                        user.blockedReason
                }
            });

        } catch (error) {
            console.error(
                'BLOCK USER ERROR:',
                error
            );

            return res.status(500).json({
                message:
                    'Unable to block student.'
            });
        }
    }
);


/*
|--------------------------------------------------------------------------
| ADMIN - UNBLOCK STUDENT
|--------------------------------------------------------------------------
| PUT /api/auth/users/:id/unblock
|--------------------------------------------------------------------------
*/

router.put(
    '/users/:id/unblock',
    authMiddleware,
    isAdmin,
    async (req, res) => {
        try {
            const {
                id
            } = req.params;

            if (
                !mongoose.Types.ObjectId.isValid(
                    id
                )
            ) {
                return res.status(400).json({
                    message:
                        'Invalid user ID.'
                });
            }

            const user =
                await User.findOne({
                    _id: id,
                    role: 'student'
                });

            if (!user) {
                return res.status(404).json({
                    message:
                        'Student not found.'
                });
            }

            user.isBlocked = false;
            user.isActive = true;
            user.blockedAt = null;
            user.blockedReason = '';

            await user.save();

            return res.json({
                message:
                    'Student unblocked successfully.',
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    isBlocked:
                        user.isBlocked,
                    isActive:
                        user.isActive
                }
            });

        } catch (error) {
            console.error(
                'UNBLOCK USER ERROR:',
                error
            );

            return res.status(500).json({
                message:
                    'Unable to unblock student.'
            });
        }
    }
);


/*
|--------------------------------------------------------------------------
| ADMIN - ACTIVATE / DEACTIVATE USER
|--------------------------------------------------------------------------
*/

router.put(
    '/users/:id/status',
    authMiddleware,
    isAdmin,
    async (req, res) => {
        try {
            const {
                id
            } = req.params;

            const {
                isActive
            } = req.body;

            if (
                !mongoose.Types.ObjectId.isValid(
                    id
                )
            ) {
                return res.status(400).json({
                    message:
                        'Invalid user ID.'
                });
            }

            if (
                typeof isActive !==
                'boolean'
            ) {
                return res.status(400).json({
                    message:
                        'isActive must be true or false.'
                });
            }

            const user =
                await User.findById(
                    id
                );

            if (!user) {
                return res.status(404).json({
                    message:
                        'User not found.'
                });
            }

            /*
            |--------------------------------------------------------------------------
            | Do not allow admin account to be disabled
            |--------------------------------------------------------------------------
            */
            if (
                user.role === 'admin'
            ) {
                return res.status(400).json({
                    message:
                        'Administrator account cannot be disabled.'
                });
            }

            user.isActive =
                isActive;

            await user.save();

            return res.json({
                message:
                    `User ${
                        isActive
                            ? 'activated'
                            : 'deactivated'
                    } successfully.`,
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    isActive:
                        user.isActive,
                    isBlocked:
                        user.isBlocked
                }
            });

        } catch (error) {
            console.error(
                'USER STATUS ERROR:',
                error
            );

            return res.status(500).json({
                message:
                    'Unable to update user status.'
            });
        }
    }
);


module.exports = router;