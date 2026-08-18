const mongoose = require('mongoose');
const Feedback = require('../models/Feedback');
const Complaint = require('../models/Complaint');
const User = require('../models/User');

/*
|--------------------------------------------------------------------------
| Submit Feedback
|--------------------------------------------------------------------------
| Student can rate a resolved complaint.
|--------------------------------------------------------------------------
*/
const submitFeedback = async (req, res) => {
    try {
        const { complaintId, rating, comment } = req.body;

        if (!req.user || !req.user.id) {
            return res.status(401).json({
                message: 'Authentication required.'
            });
        }

        if (!complaintId) {
            return res.status(400).json({
                message: 'Complaint ID is required.'
            });
        }

        const numericRating = Number(rating);

        if (
            !Number.isInteger(numericRating) ||
            numericRating < 1 ||
            numericRating > 5
        ) {
            return res.status(400).json({
                message: 'Rating must be between 1 and 5.'
            });
        }

        if (!mongoose.Types.ObjectId.isValid(complaintId)) {
            return res.status(400).json({
                message: 'Invalid complaint ID.'
            });
        }

        const complaint = await Complaint.findById(complaintId);

        if (!complaint) {
            return res.status(404).json({
                message: 'Complaint not found.'
            });
        }

        if (complaint.status !== 'resolved') {
            return res.status(400).json({
                message:
                    'Feedback can only be submitted for resolved complaints.'
            });
        }

        /*
        |--------------------------------------------------------------------------
        | Only complaint owner can submit feedback
        |--------------------------------------------------------------------------
        */
        if (
            !complaint.raisedBy ||
            complaint.raisedBy.toString() !== req.user.id.toString()
        ) {
            return res.status(403).json({
                message:
                    'You are not authorized to submit feedback for this complaint.'
            });
        }

        /*
        |--------------------------------------------------------------------------
        | Complaint must have assigned technician
        |--------------------------------------------------------------------------
        */
        if (!complaint.assignedTo) {
            return res.status(400).json({
                message:
                    'This complaint does not have an assigned technician.'
            });
        }

        /*
        |--------------------------------------------------------------------------
        | Prevent duplicate feedback
        |--------------------------------------------------------------------------
        */
        const existingFeedback = await Feedback.findOne({
            complaintId,
            userId: req.user.id
        });

        if (existingFeedback) {
            return res.status(400).json({
                message:
                    'Feedback already submitted for this complaint.'
            });
        }

        const feedback = new Feedback({
            complaintId,
            userId: req.user.id,
            staffId: complaint.assignedTo,
            rating: numericRating,
            comment: comment ? comment.trim() : ''
        });

        await feedback.save();

        /*
        |--------------------------------------------------------------------------
        | Return populated feedback
        |--------------------------------------------------------------------------
        */
        const populatedFeedback = await Feedback.findById(
            feedback._id
        )
            .populate('userId', 'name email')
            .populate('staffId', 'name email department')
            .populate('complaintId', 'title status');

        return res.status(201).json({
            message: 'Feedback submitted successfully.',
            feedback: populatedFeedback
        });

    } catch (error) {
        console.error('SUBMIT FEEDBACK ERROR:', error);

        return res.status(500).json({
            message: 'Server error while submitting feedback.',
            error:
                process.env.NODE_ENV === 'development'
                    ? error.message
                    : undefined
        });
    }
};


/*
|--------------------------------------------------------------------------
| Get All Feedback
|--------------------------------------------------------------------------
| Public
|--------------------------------------------------------------------------
*/
const getAllFeedbacks = async (req, res) => {
    try {
        const feedbacks = await Feedback.find()
            .populate('userId', 'name email')
            .populate('staffId', 'name email department')
            .populate('complaintId', 'title status')
            .sort({
                createdAt: -1,
                submittedAt: -1
            });

        return res.json(feedbacks);

    } catch (error) {
        console.error('GET FEEDBACK ERROR:', error);

        return res.status(500).json({
            message: 'Unable to load feedback.',
            error:
                process.env.NODE_ENV === 'development'
                    ? error.message
                    : undefined
        });
    }
};


/*
|--------------------------------------------------------------------------
| Get Technician Feedback
|--------------------------------------------------------------------------
| GET /api/feedback/staff/:staffId
|--------------------------------------------------------------------------
*/
const getStaffFeedback = async (req, res) => {
    try {
        const { staffId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(staffId)) {
            return res.status(400).json({
                message: 'Invalid technician ID.'
            });
        }

        const feedbacks = await Feedback.find({
            staffId
        })
            .populate('userId', 'name email')
            .populate('complaintId', 'title status')
            .sort({
                createdAt: -1,
                submittedAt: -1
            });

        /*
        |--------------------------------------------------------------------------
        | Calculate rating statistics
        |--------------------------------------------------------------------------
        */
        const totalReviews = feedbacks.length;

        const ratingSum = feedbacks.reduce(
            (sum, feedback) =>
                sum + Number(feedback.rating || 0),
            0
        );

        const averageRating =
            totalReviews > 0
                ? Number(
                      (ratingSum / totalReviews).toFixed(2)
                  )
                : 0;

        const ratingDistribution = {
            1: 0,
            2: 0,
            3: 0,
            4: 0,
            5: 0
        };

        feedbacks.forEach((feedback) => {
            const rating = Number(feedback.rating);

            if (rating >= 1 && rating <= 5) {
                ratingDistribution[rating]++;
            }
        });

        return res.json({
            staffId,
            totalReviews,
            averageRating,
            ratingDistribution,
            feedbacks
        });

    } catch (error) {
        console.error(
            'GET TECHNICIAN FEEDBACK ERROR:',
            error
        );

        return res.status(500).json({
            message:
                'Unable to load technician feedback.',
            error:
                process.env.NODE_ENV === 'development'
                    ? error.message
                    : undefined
        });
    }
};


/*
|--------------------------------------------------------------------------
| Technician Performance
|--------------------------------------------------------------------------
| GET /api/feedback/staff-performance
|--------------------------------------------------------------------------
|
| Returns rating + complaint performance for every technician.
|--------------------------------------------------------------------------
*/
const getStaffPerformance = async (req, res) => {
    try {
        const staffMembers = await User.find({
            role: 'staff'
        })
            .select(
                '_id name email department isActive isBlocked createdAt lastLogin'
            )
            .sort({
                name: 1
            });

        const performance = [];

        for (const staff of staffMembers) {

            /*
            |--------------------------------------------------------------------------
            | Complaint statistics
            |--------------------------------------------------------------------------
            */
            const complaints = await Complaint.find({
                assignedTo: staff._id
            }).select(
                'status date updatedAt staffUpdates'
            );

            const totalAssigned = complaints.length;

            const pending = complaints.filter(
                complaint =>
                    complaint.status === 'pending'
            ).length;

            const inProgress = complaints.filter(
                complaint =>
                    complaint.status === 'in-progress'
            ).length;

            const resolved = complaints.filter(
                complaint =>
                    complaint.status === 'resolved'
            ).length;

            const resolutionRate =
                totalAssigned > 0
                    ? Number(
                          (
                              (resolved /
                                  totalAssigned) *
                              100
                          ).toFixed(1)
                      )
                    : 0;

            /*
            |--------------------------------------------------------------------------
            | Average response time
            |--------------------------------------------------------------------------
            */
            let responseTimeTotal = 0;
            let responseTimeCount = 0;

            complaints.forEach((complaint) => {
                if (
                    complaint.date &&
                    complaint.staffUpdates &&
                    complaint.staffUpdates.length > 0 &&
                    complaint.staffUpdates[0].updatedAt
                ) {
                    const created =
                        new Date(
                            complaint.date
                        ).getTime();

                    const firstUpdate =
                        new Date(
                            complaint.staffUpdates[0]
                                .updatedAt
                        ).getTime();

                    if (
                        firstUpdate >= created
                    ) {
                        responseTimeTotal +=
                            firstUpdate -
                            created;

                        responseTimeCount++;
                    }
                }
            });

            const averageResponseTime =
                responseTimeCount > 0
                    ? Number(
                          (
                              responseTimeTotal /
                              responseTimeCount /
                              (1000 * 60 * 60)
                          ).toFixed(1)
                      )
                    : 0;

            /*
            |--------------------------------------------------------------------------
            | Feedback statistics
            |--------------------------------------------------------------------------
            */
            const feedbacks =
                await Feedback.find({
                    staffId: staff._id
                }).select(
                    'rating comment submittedAt'
                );

            const totalReviews =
                feedbacks.length;

            const ratingSum =
                feedbacks.reduce(
                    (sum, feedback) =>
                        sum +
                        Number(
                            feedback.rating || 0
                        ),
                    0
                );

            const averageRating =
                totalReviews > 0
                    ? Number(
                          (
                              ratingSum /
                              totalReviews
                          ).toFixed(2)
                      )
                    : 0;

            const ratingDistribution = {
                1: 0,
                2: 0,
                3: 0,
                4: 0,
                5: 0
            };

            feedbacks.forEach(
                (feedback) => {
                    const rating =
                        Number(
                            feedback.rating
                        );

                    if (
                        rating >= 1 &&
                        rating <= 5
                    ) {
                        ratingDistribution[
                            rating
                        ]++;
                    }
                }
            );

            performance.push({
                staff: {
                    id: staff._id,
                    name: staff.name,
                    email: staff.email,
                    department:
                        staff.department,
                    isActive:
                        staff.isActive,
                    isBlocked:
                        staff.isBlocked,
                    lastLogin:
                        staff.lastLogin
                },

                complaints: {
                    totalAssigned,
                    pending,
                    inProgress,
                    resolved,
                    resolutionRate,
                    averageResponseTime
                },

                ratings: {
                    averageRating,
                    totalReviews,
                    ratingDistribution
                }
            });
        }

        /*
        |--------------------------------------------------------------------------
        | Ranking
        |--------------------------------------------------------------------------
        */
        performance.sort((a, b) => {

            if (
                b.ratings.averageRating !==
                a.ratings.averageRating
            ) {
                return (
                    b.ratings.averageRating -
                    a.ratings.averageRating
                );
            }

            return (
                b.complaints.resolutionRate -
                a.complaints.resolutionRate
            );
        });

        /*
        |--------------------------------------------------------------------------
        | Add ranking
        |--------------------------------------------------------------------------
        */
        const rankedPerformance =
            performance.map(
                (technician, index) => ({
                    rank: index + 1,
                    ...technician
                })
            );

        return res.json(
            rankedPerformance
        );

    } catch (error) {
        console.error(
            'STAFF PERFORMANCE ERROR:',
            error
        );

        return res.status(500).json({
            message:
                'Unable to load technician performance.',
            error:
                process.env.NODE_ENV === 'development'
                    ? error.message
                    : undefined
        });
    }
};


module.exports = {
    submitFeedback,
    getAllFeedbacks,
    getStaffFeedback,
    getStaffPerformance
};