const express = require('express');
const router = express.Router();

const Complaint = require('../models/Complaint');
const User = require('../models/User');

const authMiddleware =
    require('../middleware/authMiddleware');

const isAdmin =
    require('../middleware/isAdmin');


/*
|--------------------------------------------------------------------------
| PUBLIC COMPLAINT STATISTICS
|--------------------------------------------------------------------------
| GET /api/stats/complaints
|--------------------------------------------------------------------------
*/
router.get(
    '/complaints',
    async (req, res) => {
        try {
            const total =
                await Complaint.countDocuments();

            const pending =
                await Complaint.countDocuments({
                    status: 'pending'
                });

            const inProgress =
                await Complaint.countDocuments({
                    status: 'in-progress'
                });

            const resolved =
                await Complaint.countDocuments({
                    status: 'resolved'
                });

            const resolutionRate =
                total > 0
                    ? Number(
                          (
                              (resolved /
                                  total) *
                              100
                          ).toFixed(1)
                      )
                    : 0;

            /*
            |--------------------------------------------------------------------------
            | Average response time
            |--------------------------------------------------------------------------
            */
            const complaints =
                await Complaint.find({
                    'staffUpdates.0': {
                        $exists: true
                    }
                }).select(
                    'date staffUpdates'
                );

            let totalResponseTime = 0;
            let responseCount = 0;

            complaints.forEach(
                (complaint) => {
                    if (
                        complaint.date &&
                        complaint.staffUpdates &&
                        complaint.staffUpdates.length >
                            0 &&
                        complaint.staffUpdates[0]
                            .updatedAt
                    ) {
                        const created =
                            new Date(
                                complaint.date
                            ).getTime();

                        const firstUpdate =
                            new Date(
                                complaint
                                    .staffUpdates[0]
                                    .updatedAt
                            ).getTime();

                        if (
                            firstUpdate >=
                            created
                        ) {
                            totalResponseTime +=
                                firstUpdate -
                                created;

                            responseCount++;
                        }
                    }
                }
            );

            const avgResponseTime =
                responseCount > 0
                    ? Number(
                          (
                              totalResponseTime /
                              responseCount /
                              (1000 *
                                  60 *
                                  60)
                          ).toFixed(1)
                      )
                    : 0;

            return res.json({
                total,
                pending,
                inProgress,
                resolved,
                resolutionRate,
                avgResponseTime
            });

        } catch (error) {
            console.error(
                'COMPLAINT STATS ERROR:',
                error
            );

            return res.status(500).json({
                message:
                    'Unable to load complaint statistics.'
            });
        }
    }
);


/*
|--------------------------------------------------------------------------
| PUBLIC USER STATISTICS
|--------------------------------------------------------------------------
| GET /api/stats/users
|--------------------------------------------------------------------------
*/
router.get(
    '/users',
    async (req, res) => {
        try {
            const total =
                await User.countDocuments();

            const students =
                await User.countDocuments({
                    role: 'student'
                });

            const staff =
                await User.countDocuments({
                    role: 'staff'
                });

            const activeStudents =
                await User.countDocuments({
                    role: 'student',
                    isActive: {
                        $ne: false
                    },
                    isBlocked: {
                        $ne: true
                    }
                });

            const blockedStudents =
                await User.countDocuments({
                    role: 'student',
                    isBlocked: true
                });

            const activeStaff =
                await User.countDocuments({
                    role: 'staff',
                    isActive: {
                        $ne: false
                    }
                });

            const inactiveStaff =
                await User.countDocuments({
                    role: 'staff',
                    isActive: false
                });

            return res.json({
                total,
                students,
                staff,
                activeStudents,
                blockedStudents,
                activeStaff,
                inactiveStaff
            });

        } catch (error) {
            console.error(
                'USER STATS ERROR:',
                error
            );

            return res.status(500).json({
                message:
                    'Unable to load user statistics.'
            });
        }
    }
);


/*
|--------------------------------------------------------------------------
| ADMIN DASHBOARD OVERVIEW
|--------------------------------------------------------------------------
| GET /api/stats/admin-overview
|--------------------------------------------------------------------------
|
| Protected admin endpoint containing everything required
| for the Admin Dashboard summary cards.
|--------------------------------------------------------------------------
*/
router.get(
    '/admin-overview',
    authMiddleware,
    isAdmin,
    async (req, res) => {
        try {

            /*
            |--------------------------------------------------------------------------
            | Complaint counts
            |--------------------------------------------------------------------------
            */
            const totalComplaints =
                await Complaint.countDocuments();

            const pendingComplaints =
                await Complaint.countDocuments({
                    status: 'pending'
                });

            const inProgressComplaints =
                await Complaint.countDocuments({
                    status: 'in-progress'
                });

            const resolvedComplaints =
                await Complaint.countDocuments({
                    status: 'resolved'
                });

            const resolutionRate =
                totalComplaints > 0
                    ? Number(
                          (
                              (resolvedComplaints /
                                  totalComplaints) *
                              100
                          ).toFixed(1)
                      )
                    : 0;

            /*
            |--------------------------------------------------------------------------
            | User counts
            |--------------------------------------------------------------------------
            */
            const totalStudents =
                await User.countDocuments({
                    role: 'student'
                });

            const blockedStudents =
                await User.countDocuments({
                    role: 'student',
                    isBlocked: true
                });

            const activeStudents =
                await User.countDocuments({
                    role: 'student',
                    isActive: {
                        $ne: false
                    },
                    isBlocked: {
                        $ne: true
                    }
                });

            /*
            |--------------------------------------------------------------------------
            | Technician counts
            |--------------------------------------------------------------------------
            */
            const totalTechnicians =
                await User.countDocuments({
                    role: 'staff'
                });

            const activeTechnicians =
                await User.countDocuments({
                    role: 'staff',
                    isActive: {
                        $ne: false
                    },
                    isBlocked: {
                        $ne: true
                    }
                });

            const inactiveTechnicians =
                await User.countDocuments({
                    role: 'staff',
                    isActive: false
                });

            /*
            |--------------------------------------------------------------------------
            | Complaint category statistics
            |--------------------------------------------------------------------------
            */
            const categoryStats =
                await Complaint.aggregate([
                    {
                        $group: {
                            _id: '$category',
                            count: {
                                $sum: 1
                            }
                        }
                    },
                    {
                        $sort: {
                            count: -1
                        }
                    }
                ]);

            /*
            |--------------------------------------------------------------------------
            | Complaint status statistics
            |--------------------------------------------------------------------------
            */
            const statusStats = [
                {
                    status: 'pending',
                    count:
                        pendingComplaints
                },
                {
                    status: 'in-progress',
                    count:
                        inProgressComplaints
                },
                {
                    status: 'resolved',
                    count:
                        resolvedComplaints
                }
            ];

            return res.json({
                complaints: {
                    total:
                        totalComplaints,

                    pending:
                        pendingComplaints,

                    inProgress:
                        inProgressComplaints,

                    resolved:
                        resolvedComplaints,

                    resolutionRate
                },

                users: {
                    students:
                        totalStudents,

                    activeStudents:
                        activeStudents,

                    blockedStudents:
                        blockedStudents,

                    technicians:
                        totalTechnicians,

                    activeTechnicians:
                        activeTechnicians,

                    inactiveTechnicians:
                        inactiveTechnicians
                },

                categories:
                    categoryStats,

                statuses:
                    statusStats
            });

        } catch (error) {
            console.error(
                'ADMIN OVERVIEW ERROR:',
                error
            );

            return res.status(500).json({
                message:
                    'Unable to load admin dashboard statistics.',
                error:
                    process.env.NODE_ENV ===
                    'development'
                        ? error.message
                        : undefined
            });
        }
    }
);


module.exports = router;