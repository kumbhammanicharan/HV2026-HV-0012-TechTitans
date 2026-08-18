const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();


/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
*/

const authRoutes =
    require('./routes/auth');

const complaintRoutes =
    require('./routes/complaint');

const feedbackRoutes =
    require('./routes/feedback');

const statsRoutes =
    require('./routes/stats');

const adminRoutes =
    require('./routes/admin');


/*
|--------------------------------------------------------------------------
| App
|--------------------------------------------------------------------------
*/

const app = express();

const PORT =
    process.env.PORT || 5000;


/*
|--------------------------------------------------------------------------
| Middleware
|--------------------------------------------------------------------------
*/

app.use(
    cors()
);

app.use(
    express.json()
);

app.use(
    express.urlencoded({
        extended: true
    })
);


/*
|--------------------------------------------------------------------------
| Uploaded files
|--------------------------------------------------------------------------
*/

app.use(
    '/uploads',
    express.static('uploads')
);


/*
|--------------------------------------------------------------------------
| Request Logger
|--------------------------------------------------------------------------
*/

app.use(
    (req, res, next) => {

        console.log(
            `${req.method} ${req.path}`
        );

        next();
    }
);


/*
|--------------------------------------------------------------------------
| MongoDB Connection
|--------------------------------------------------------------------------
*/

mongoose
    .connect(
        process.env.MONGO_URI,
        {
            useNewUrlParser: true,
            useUnifiedTopology: true
        }
    )
    .then(() => {
        console.log(
            'MongoDB connected'
        );
    })
    .catch((error) => {

        console.error(
            'MongoDB connection error:',
            error
        );
    });


/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
*/

console.log(
    'Registering routes...'
);


app.use(
    '/api/auth',
    authRoutes
);


app.use(
    '/api/complaints',
    complaintRoutes
);


app.use(
    '/api/feedback',
    feedbackRoutes
);


app.use(
    '/api/stats',
    statsRoutes
);


/*
|--------------------------------------------------------------------------
| ADMIN ROUTES
|--------------------------------------------------------------------------
*/

app.use(
    '/api/admin',
    adminRoutes
);


/*
|--------------------------------------------------------------------------
| Test Route
|--------------------------------------------------------------------------
*/

app.get(
    '/api/test',
    (req, res) => {

        console.log(
            'Test route hit'
        );

        res.json({
            message:
                'Server is working!',
            timestamp:
                new Date().toISOString()
        });
    }
);


/*
|--------------------------------------------------------------------------
| Test Complaint Statistics
|--------------------------------------------------------------------------
*/

app.get(
    '/api/test-complaint-stats',
    async (req, res) => {

        try {

            const Complaint =
                require('./models/Complaint');

            const totalComplaints =
                await Complaint.countDocuments();

            const resolvedComplaints =
                await Complaint.countDocuments({
                    status: 'resolved'
                });

            res.json({
                total:
                    totalComplaints,
                resolved:
                    resolvedComplaints
            });

        } catch (error) {

            console.error(
                'Direct complaint stats error:',
                error
            );

            res.status(500).json({
                error:
                    error.message
            });
        }
    }
);


/*
|--------------------------------------------------------------------------
| Test User Statistics
|--------------------------------------------------------------------------
*/

app.get(
    '/api/test-user-stats',
    async (req, res) => {

        try {

            const User =
                require('./models/User');

            const totalUsers =
                await User.countDocuments();

            res.json({
                total:
                    totalUsers
            });

        } catch (error) {

            console.error(
                'Direct user stats error:',
                error
            );

            res.status(500).json({
                error:
                    error.message
            });
        }
    }
);


/*
|--------------------------------------------------------------------------
| Debug Routes
|--------------------------------------------------------------------------
*/

app.get(
    '/api/debug/routes',
    (req, res) => {

        const routes = [];

        if (app._router) {

            app._router.stack.forEach(
                (middleware) => {

                    if (
                        middleware.route
                    ) {

                        routes.push({
                            path:
                                middleware.route.path,
                            methods:
                                Object.keys(
                                    middleware
                                        .route
                                        .methods
                                )
                        });

                    } else if (
                        middleware.name ===
                        'router'
                    ) {

                        if (
                            middleware.handle &&
                            middleware.handle.stack
                        ) {

                            middleware.handle.stack.forEach(
                                (handler) => {

                                    if (
                                        handler.route
                                    ) {

                                        routes.push({
                                            path:
                                                handler
                                                    .route
                                                    .path,
                                            methods:
                                                Object.keys(
                                                    handler
                                                        .route
                                                        .methods
                                                )
                                        });
                                    }
                                }
                            );
                        }
                    }
                }
            );
        }

        res.json({
            routes
        });
    }
);


/*
|--------------------------------------------------------------------------
| 404 Handler
|--------------------------------------------------------------------------
*/

app.use(
    (req, res) => {

        res.status(404).json({
            message:
                'API route not found.',
            path:
                req.originalUrl
        });
    }
);


/*
|--------------------------------------------------------------------------
| Global Error Handler
|--------------------------------------------------------------------------
*/

app.use(
    (
        error,
        req,
        res,
        next
    ) => {

        console.error(
            'Unhandled server error:',
            error
        );

        res.status(
            error.status || 500
        ).json({
            message:
                error.message ||
                'Internal server error.'
        });
    }
);


/*
|--------------------------------------------------------------------------
| Start Server
|--------------------------------------------------------------------------
*/

app.listen(
    PORT,
    () => {

        console.log(
            `Server is running on port ${PORT}`
        );

        console.log(
            'Available routes:'
        );

        console.log(
            '- GET /api/test'
        );

        console.log(
            '- GET /api/stats/complaints'
        );

        console.log(
            '- GET /api/stats/users'
        );

        console.log(
            '- GET /api/auth/stats'
        );

        console.log(
            '- GET /api/complaints/stats'
        );

        console.log(
            '- GET /api/admin/users'
        );

        console.log(
            '- GET /api/admin/students'
        );

        console.log(
            '- GET /api/admin/staff'
        );

        console.log(
            '- GET /api/admin/technicians/performance'
        );

        console.log(
            '- PUT /api/admin/users/:id/block'
        );

        console.log(
            '- PUT /api/admin/users/:id/unblock'
        );

        console.log(
            '- PUT /api/admin/users/:id/activate'
        );

        console.log(
            '- PUT /api/admin/users/:id/deactivate'
        );

        console.log(
            '- DELETE /api/admin/users/:id'
        );
    }
);