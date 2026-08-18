// filepath: server/controllers/authController.js

const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

/*
|--------------------------------------------------------------------------
| Register Student / Staff
|--------------------------------------------------------------------------
*/
const register = async (req, res) => {
    const {
        email,
        password,
        role,
        name,
        department
    } = req.body;

    try {
        // Validate required fields
        if (
            !email ||
            !password ||
            !role ||
            !name ||
            !department
        ) {
            return res.status(400).json({
                message:
                    'All fields are required: email, password, role, name, department'
            });
        }

        // Validate email
        const emailRegex =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(email)) {
            return res.status(400).json({
                message:
                    'Please enter a valid email address'
            });
        }

        // Validate password
        if (password.length < 6) {
            return res.status(400).json({
                message:
                    'Password must be at least 6 characters long'
            });
        }

        // Public registration only allows student/staff
        if (!['student', 'staff'].includes(role)) {
            return res.status(400).json({
                message:
                    'Invalid role. Must be student or staff'
            });
        }

        const cleanEmail =
            email.trim().toLowerCase();

        // Check existing account
        const existingUser =
            await User.findOne({
                email: cleanEmail
            });

        if (existingUser) {
            return res.status(400).json({
                message:
                    'User with this email already exists'
            });
        }

        // Hash password
        const hashedPassword =
            await bcrypt.hash(password, 10);

        // Create user
        const newUser = new User({
            email: cleanEmail,
            password: hashedPassword,
            role,
            name: name.trim(),
            department: department.trim(),

            // Account management defaults
            isActive: true,
            isBlocked: false,
            blockedAt: null,
            blockedReason: '',
            lastLogin: null
        });

        await newUser.save();

        console.log(
            'User registered successfully:',
            {
                email: cleanEmail,
                role,
                name,
                department
            }
        );

        return res.status(201).json({
            message:
                'User registered successfully'
        });

    } catch (error) {
        console.error(
            'Registration error:',
            error
        );

        if (error.code === 11000) {
            return res.status(400).json({
                message:
                    'User with this email already exists'
            });
        }

        return res.status(500).json({
            message:
                'Server error during registration'
        });
    }
};


/*
|--------------------------------------------------------------------------
| Login
|--------------------------------------------------------------------------
|
| Admin:
|   Uses ADMIN_EMAIL and ADMIN_PASSWORD from .env
|
| Student / Staff:
|   Uses MongoDB User collection
|
| Blocked / inactive accounts cannot login.
|--------------------------------------------------------------------------
*/
const login = async (req, res) => {
    const {
        email,
        password,
        role
    } = req.body;

    try {
        // Basic validation
        if (!email || !password || !role) {
            return res.status(400).json({
                message:
                    'Email, password and role are required.'
            });
        }

        const cleanEmail =
            email.trim().toLowerCase();


        /*
        |--------------------------------------------------------------------------
        | ADMIN LOGIN
        |--------------------------------------------------------------------------
        */

        if (role === 'admin') {

            const adminEmail =
                process.env.ADMIN_EMAIL
                    ?.trim()
                    .toLowerCase();

            const adminPassword =
                process.env.ADMIN_PASSWORD;

            if (
                cleanEmail === adminEmail &&
                password === adminPassword
            ) {

                const token = jwt.sign(
                    {
                        id: 'admin',
                        email: cleanEmail,
                        role: 'admin',
                        name: 'Administrator'
                    },
                    process.env.JWT_SECRET,
                    {
                        expiresIn: '1h'
                    }
                );

                return res.status(200).json({
                    token,

                    user: {
                        id: 'admin',
                        email: cleanEmail,
                        role: 'admin',
                        name: 'Administrator',
                        department:
                            'Administration'
                    }
                });
            }

            return res.status(400).json({
                message:
                    'Invalid admin credentials'
            });
        }


        /*
        |--------------------------------------------------------------------------
        | STUDENT / STAFF LOGIN
        |--------------------------------------------------------------------------
        */

        if (
            !['student', 'staff'].includes(role)
        ) {
            return res.status(400).json({
                message:
                    'Invalid login role.'
            });
        }

        const user =
            await User.findOne({
                email: cleanEmail,
                role
            });

        if (!user) {
            return res.status(400).json({
                message:
                    'Email not found for the selected role.'
            });
        }


        /*
        |--------------------------------------------------------------------------
        | BLOCK CHECK
        |--------------------------------------------------------------------------
        */

        if (user.isBlocked === true) {
            return res.status(403).json({
                message:
                    user.blockedReason ||
                    'Your account has been blocked by the administrator.'
            });
        }


        /*
        |--------------------------------------------------------------------------
        | ACTIVE CHECK
        |--------------------------------------------------------------------------
        */

        if (user.isActive === false) {
            return res.status(403).json({
                message:
                    'Your account is currently inactive. Please contact the administrator.'
            });
        }


        /*
        |--------------------------------------------------------------------------
        | Password Check
        |--------------------------------------------------------------------------
        */

        const isMatch =
            await bcrypt.compare(
                password,
                user.password
            );

        if (!isMatch) {
            return res.status(400).json({
                message:
                    'Incorrect password.'
            });
        }


        /*
        |--------------------------------------------------------------------------
        | Update Last Login
        |--------------------------------------------------------------------------
        */

        user.lastLogin = new Date();

        await user.save();


        /*
        |--------------------------------------------------------------------------
        | Create JWT
        |--------------------------------------------------------------------------
        */

        const token = jwt.sign(
            {
                id: user._id.toString(),
                email: user.email,
                role: user.role,
                name: user.name,
                department:
                    user.department
            },
            process.env.JWT_SECRET,
            {
                expiresIn: '1h'
            }
        );


        /*
        |--------------------------------------------------------------------------
        | Response
        |--------------------------------------------------------------------------
        */

        return res.status(200).json({
            token,

            user: {
                id: user._id,
                email: user.email,
                role: user.role,
                name: user.name,
                department:
                    user.department,
                isActive:
                    user.isActive,
                isBlocked:
                    user.isBlocked,
                lastLogin:
                    user.lastLogin
            }
        });

    } catch (error) {
        console.error(
            'Login error:',
            error
        );

        return res.status(500).json({
            message:
                'Server error during login.',
            error: error.message
        });
    }
};


/*
|--------------------------------------------------------------------------
| Get User Statistics
|--------------------------------------------------------------------------
| GET /api/auth/stats
|--------------------------------------------------------------------------
*/
const getUserStats = async (req, res) => {
    try {

        const totalUsers =
            await User.countDocuments();

        const studentCount =
            await User.countDocuments({
                role: 'student'
            });

        const staffCount =
            await User.countDocuments({
                role: 'staff'
            });

        const blockedCount =
            await User.countDocuments({
                isBlocked: true
            });

        const activeCount =
            await User.countDocuments({
                isActive: true,
                isBlocked: false
            });

        const inactiveCount =
            await User.countDocuments({
                isActive: false
            });

        const stats = {
            total: totalUsers,
            students: studentCount,
            staff: staffCount,
            blocked: blockedCount,
            active: activeCount,
            inactive: inactiveCount
        };

        console.log(
            'User stats:',
            stats
        );

        return res.json(stats);

    } catch (error) {
        console.error(
            'Error in getUserStats:',
            error
        );

        return res.status(500).json({
            message:
                'Server error while loading user statistics.',
            error: error.message
        });
    }
};


module.exports = {
    register,
    login,
    getUserStats
};