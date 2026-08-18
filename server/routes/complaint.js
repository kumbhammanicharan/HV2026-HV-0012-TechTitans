const express = require('express');
const mongoose = require('mongoose');

const router = express.Router();

const Complaint = require('../models/Complaint');
const Feedback = require('../models/Feedback');
const User = require('../models/User');

const authMiddleware = require('../middleware/authMiddleware');
const isAdmin = require('../middleware/isAdmin');
const isStaff = require('../middleware/isStaff');
const upload = require('../middleware/upload');

const {
    createComplaint,
    getMyComplaints,
    getComplaintById,
    getAllComplaints,
    assignComplaint,
    updateComplaintStatus,
    getAssignedComplaints,
    staffUpdateComplaint,
    getComplaintStats
} = require('../controllers/complaintController');


/*
|--------------------------------------------------------------------------
| PUBLIC COMPLAINT STATISTICS
|--------------------------------------------------------------------------
*/
router.get('/stats', getComplaintStats);


/*
|--------------------------------------------------------------------------
| ADMIN ANALYTICS
|--------------------------------------------------------------------------
| GET /api/complaints/admin/analytics
|--------------------------------------------------------------------------
*/
router.get(
    '/admin/analytics',
    authMiddleware,
    isAdmin,
    async (req, res) => {
        try {
            const total = await Complaint.countDocuments();

            const pending = await Complaint.countDocuments({
                status: 'pending'
            });

            const inProgress = await Complaint.countDocuments({
                status: 'in-progress'
            });

            const resolved = await Complaint.countDocuments({
                status: 'resolved'
            });

            const students = await User.countDocuments({
                role: 'student'
            });

            const staff = await User.countDocuments({
                role: 'staff'
            });

            const blockedStudents = await User.countDocuments({
                role: 'student',
                isBlocked: true
            });

            const activeStudents = await User.countDocuments({
                role: 'student',
                isBlocked: { $ne: true }
            });

            const assigned = await Complaint.countDocuments({
                assignedTo: { $ne: null }
            });

            const unassigned = await Complaint.countDocuments({
                assignedTo: null
            });

            const overdue = await Complaint.countDocuments({
                status: { $ne: 'resolved' },
                date: {
                    $lt: new Date(
                        Date.now() - 3 * 24 * 60 * 60 * 1000
                    )
                }
            });

            /*
            |--------------------------------------------------------------------------
            | Category analytics
            |--------------------------------------------------------------------------
            */
            const categoryStats = await Complaint.aggregate([
                {
                    $group: {
                        _id: '$category',
                        total: { $sum: 1 }
                    }
                },
                {
                    $sort: {
                        total: -1
                    }
                }
            ]);

            /*
            |--------------------------------------------------------------------------
            | Monthly complaint analytics
            |--------------------------------------------------------------------------
            */
            const monthlyStats = await Complaint.aggregate([
                {
                    $group: {
                        _id: {
                            year: {
                                $year: '$date'
                            },
                            month: {
                                $month: '$date'
                            }
                        },
                        total: {
                            $sum: 1
                        }
                    }
                },
                {
                    $sort: {
                        '_id.year': 1,
                        '_id.month': 1
                    }
                }
            ]);

            /*
            |--------------------------------------------------------------------------
            | Technician workload
            |--------------------------------------------------------------------------
            */
            const technicianWorkload =
                await Complaint.aggregate([
                    {
                        $match: {
                            assignedTo: {
                                $ne: null
                            }
                        }
                    },
                    {
                        $group: {
                            _id: '$assignedTo',
                            total: {
                                $sum: 1
                            },
                            pending: {
                                $sum: {
                                    $cond: [
                                        {
                                            $eq: [
                                                '$status',
                                                'pending'
                                            ]
                                        },
                                        1,
                                        0
                                    ]
                                }
                            },
                            inProgress: {
                                $sum: {
                                    $cond: [
                                        {
                                            $eq: [
                                                '$status',
                                                'in-progress'
                                            ]
                                        },
                                        1,
                                        0
                                    ]
                                }
                            },
                            resolved: {
                                $sum: {
                                    $cond: [
                                        {
                                            $eq: [
                                                '$status',
                                                'resolved'
                                            ]
                                        },
                                        1,
                                        0
                                    ]
                                }
                            }
                        }
                    }
                ]);

            /*
            |--------------------------------------------------------------------------
            | Feedback analytics
            |--------------------------------------------------------------------------
            */
            const feedbackStats =
                await Feedback.aggregate([
                    {
                        $group: {
                            _id: null,
                            totalReviews: {
                                $sum: 1
                            },
                            averageRating: {
                                $avg: '$rating'
                            }
                        }
                    }
                ]);

            const feedbackSummary =
                feedbackStats.length > 0
                    ? {
                          totalReviews:
                              feedbackStats[0]
                                  .totalReviews,
                          averageRating:
                              Number(
                                  feedbackStats[0]
                                      .averageRating
                              ).toFixed(2)
                      }
                    : {
                          totalReviews: 0,
                          averageRating: '0.00'
                      };

            return res.json({
                complaints: {
                    total,
                    pending,
                    inProgress,
                    resolved,
                    assigned,
                    unassigned,
                    overdue
                },

                users: {
                    students,
                    activeStudents,
                    blockedStudents,
                    staff
                },

                categories: categoryStats,

                monthly: monthlyStats,

                technicianWorkload,

                feedback: feedbackSummary
            });

        } catch (error) {
            console.error(
                'ADMIN ANALYTICS ERROR:',
                error
            );

            return res.status(500).json({
                message:
                    'Failed to load admin analytics.',
                error: error.message
            });
        }
    }
);


/*
|--------------------------------------------------------------------------
| TECHNICIAN ANALYTICS
|--------------------------------------------------------------------------
| GET /api/complaints/staff/analytics
|--------------------------------------------------------------------------
*/
router.get(
    '/staff/analytics',
    authMiddleware,
    isStaff,
    async (req, res) => {
        try {
            const staffId =
                req.user.id || req.user._id;

            if (
                !mongoose.Types.ObjectId.isValid(
                    staffId
                )
            ) {
                return res.status(400).json({
                    message:
                        'Invalid technician account.'
                });
            }

            const objectId =
                new mongoose.Types.ObjectId(
                    staffId
                );

            const total =
                await Complaint.countDocuments({
                    assignedTo: objectId
                });

            const pending =
                await Complaint.countDocuments({
                    assignedTo: objectId,
                    status: 'pending'
                });

            const inProgress =
                await Complaint.countDocuments({
                    assignedTo: objectId,
                    status: 'in-progress'
                });

            const resolved =
                await Complaint.countDocuments({
                    assignedTo: objectId,
                    status: 'resolved'
                });

            const feedback =
                await Feedback.aggregate([
                    {
                        $match: {
                            staffId: objectId
                        }
                    },
                    {
                        $group: {
                            _id: null,
                            totalReviews: {
                                $sum: 1
                            },
                            averageRating: {
                                $avg: '$rating'
                            },
                            fiveStar: {
                                $sum: {
                                    $cond: [
                                        {
                                            $eq: [
                                                '$rating',
                                                5
                                            ]
                                        },
                                        1,
                                        0
                                    ]
                                }
                            },
                            fourStar: {
                                $sum: {
                                    $cond: [
                                        {
                                            $eq: [
                                                '$rating',
                                                4
                                            ]
                                        },
                                        1,
                                        0
                                    ]
                                }
                            },
                            threeStar: {
                                $sum: {
                                    $cond: [
                                        {
                                            $eq: [
                                                '$rating',
                                                3
                                            ]
                                        },
                                        1,
                                        0
                                    ]
                                }
                            },
                            twoStar: {
                                $sum: {
                                    $cond: [
                                        {
                                            $eq: [
                                                '$rating',
                                                2
                                            ]
                                        },
                                        1,
                                        0
                                    ]
                                }
                            },
                            oneStar: {
                                $sum: {
                                    $cond: [
                                        {
                                            $eq: [
                                                '$rating',
                                                1
                                            ]
                                        },
                                        1,
                                        0
                                    ]
                                }
                            }
                        }
                    }
                ]);

            const rating =
                feedback.length > 0
                    ? Number(
                          feedback[0]
                              .averageRating
                      ).toFixed(2)
                    : '0.00';

            const resolutionRate =
                total > 0
                    ? Number(
                          (resolved / total) * 100
                      ).toFixed(1)
                    : '0.0';

            return res.json({
                complaints: {
                    total,
                    pending,
                    inProgress,
                    resolved
                },

                performance: {
                    resolutionRate,
                    averageRating: rating
                },

                reviews:
                    feedback.length > 0
                        ? feedback[0]
                        : {
                              totalReviews: 0,
                              averageRating: 0,
                              fiveStar: 0,
                              fourStar: 0,
                              threeStar: 0,
                              twoStar: 0,
                              oneStar: 0
                          }
            });

        } catch (error) {
            console.error(
                'TECHNICIAN ANALYTICS ERROR:',
                error
            );

            return res.status(500).json({
                message:
                    'Failed to load technician analytics.',
                error: error.message
            });
        }
    }
);


/*
|--------------------------------------------------------------------------
| ADMIN - ALL TECHNICIANS PERFORMANCE
|--------------------------------------------------------------------------
| GET /api/complaints/admin/technicians
|--------------------------------------------------------------------------
*/
router.get(
    '/admin/technicians',
    authMiddleware,
    isAdmin,
    async (req, res) => {
        try {
            const technicians =
                await User.find({
                    role: 'staff'
                }).select(
                    '-password'
                );

            const result =
                await Promise.all(
                    technicians.map(
                        async technician => {
                            const id =
                                technician._id;

                            const total =
                                await Complaint.countDocuments(
                                    {
                                        assignedTo:
                                            id
                                    }
                                );

                            const resolved =
                                await Complaint.countDocuments(
                                    {
                                        assignedTo:
                                            id,
                                        status:
                                            'resolved'
                                    }
                                );

                            const pending =
                                await Complaint.countDocuments(
                                    {
                                        assignedTo:
                                            id,
                                        status:
                                            'pending'
                                    }
                                );

                            const inProgress =
                                await Complaint.countDocuments(
                                    {
                                        assignedTo:
                                            id,
                                        status:
                                            'in-progress'
                                    }
                                );

                            const feedback =
                                await Feedback.aggregate(
                                    [
                                        {
                                            $match: {
                                                staffId:
                                                    id
                                            }
                                        },
                                        {
                                            $group: {
                                                _id: null,
                                                totalReviews:
                                                    {
                                                        $sum: 1
                                                    },
                                                averageRating:
                                                    {
                                                        $avg: '$rating'
                                                    }
                                            }
                                        }
                                    ]
                                );

                            const averageRating =
                                feedback.length
                                    ? Number(
                                          feedback[0]
                                              .averageRating
                                      ).toFixed(
                                          2
                                      )
                                    : '0.00';

                            const totalReviews =
                                feedback.length
                                    ? feedback[0]
                                          .totalReviews
                                    : 0;

                            const resolutionRate =
                                total > 0
                                    ? Number(
                                          (resolved /
                                              total) *
                                              100
                                      ).toFixed(
                                          1
                                      )
                                    : '0.0';

                            return {
                                _id:
                                    technician._id,
                                name:
                                    technician.name,
                                email:
                                    technician.email,
                                department:
                                    technician.department,

                                isActive:
                                    technician.isActive,

                                complaints: {
                                    total,
                                    pending,
                                    inProgress,
                                    resolved
                                },

                                performance: {
                                    resolutionRate,
                                    averageRating,
                                    totalReviews
                                }
                            };
                        }
                    )
                );

            /*
            |--------------------------------------------------------------------------
            | Best technicians first
            |--------------------------------------------------------------------------
            */
            result.sort(
                (a, b) =>
                    Number(
                        b.performance
                            .averageRating
                    ) -
                    Number(
                        a.performance
                            .averageRating
                    )
            );

            return res.json(result);

        } catch (error) {
            console.error(
                'TECHNICIAN LIST ERROR:',
                error
            );

            return res.status(500).json({
                message:
                    'Failed to load technician analytics.',
                error: error.message
            });
        }
    }
);


/*
|--------------------------------------------------------------------------
| STUDENT ROUTES
|--------------------------------------------------------------------------
*/

router.post(
    '/',
    authMiddleware,
    upload.single('image'),
    createComplaint
);

router.get(
    '/my',
    authMiddleware,
    getMyComplaints
);


/*
|--------------------------------------------------------------------------
| STAFF ROUTES
|--------------------------------------------------------------------------
*/

router.get(
    '/assigned',
    authMiddleware,
    isStaff,
    getAssignedComplaints
);

router.post(
    '/:id/staff-update',
    authMiddleware,
    isStaff,
    upload.single('photo'),
    staffUpdateComplaint
);


/*
|--------------------------------------------------------------------------
| ADMIN ROUTES
|--------------------------------------------------------------------------
*/

router.put(
    '/:id/assign',
    authMiddleware,
    isAdmin,
    assignComplaint
);

router.put(
    '/:id/status',
    authMiddleware,
    isAdmin,
    updateComplaintStatus
);

router.get(
    '/',
    authMiddleware,
    isAdmin,
    getAllComplaints
);


/*
|--------------------------------------------------------------------------
| GENERIC COMPLAINT
|--------------------------------------------------------------------------
| Keep this LAST.
|--------------------------------------------------------------------------
*/

router.get(
    '/:id',
    authMiddleware,
    getComplaintById
);


module.exports = router;