// filepath: server/controllers/adminController.js

const mongoose = require('mongoose');

const User = require('../models/User');
const Complaint = require('../models/Complaint');
const Feedback = require('../models/Feedback');


/*
|--------------------------------------------------------------------------
| Helper: Validate ObjectId
|--------------------------------------------------------------------------
*/

const isValidObjectId = (id) => {
    return mongoose.Types.ObjectId.isValid(id);
};


/*
|--------------------------------------------------------------------------
| Get All Users
|--------------------------------------------------------------------------
| GET /api/admin/users
|--------------------------------------------------------------------------
*/

const getAllUsers = async (req, res) => {
    try {

        const users = await User.find()
            .select('-password')
            .sort({
                createdAt: -1
            });

        return res.status(200).json({
            success: true,
            count: users.length,
            users
        });

    } catch (error) {

        console.error(
            'Get all users error:',
            error
        );

        return res.status(500).json({
            success: false,
            message:
                'Unable to load users.',
            error: error.message
        });
    }
};


/*
|--------------------------------------------------------------------------
| Get All Students
|--------------------------------------------------------------------------
| GET /api/admin/students
|--------------------------------------------------------------------------
*/

const getStudents = async (req, res) => {
    try {

        const students = await User.find({
            role: 'student'
        })
            .select('-password')
            .sort({
                createdAt: -1
            });

        return res.status(200).json({
            success: true,
            count: students.length,
            students
        });

    } catch (error) {

        console.error(
            'Get students error:',
            error
        );

        return res.status(500).json({
            success: false,
            message:
                'Unable to load students.',
            error: error.message
        });
    }
};


/*
|--------------------------------------------------------------------------
| Get All Staff / Technicians
|--------------------------------------------------------------------------
| GET /api/admin/staff
|--------------------------------------------------------------------------
*/

const getStaff = async (req, res) => {
    try {

        const staff = await User.find({
            role: 'staff'
        })
            .select('-password')
            .sort({
                createdAt: -1
            });

        return res.status(200).json({
            success: true,
            count: staff.length,
            staff
        });

    } catch (error) {

        console.error(
            'Get staff error:',
            error
        );

        return res.status(500).json({
            success: false,
            message:
                'Unable to load technicians.',
            error: error.message
        });
    }
};


/*
|--------------------------------------------------------------------------
| Block User
|--------------------------------------------------------------------------
| PUT /api/admin/users/:id/block
|--------------------------------------------------------------------------
*/

const blockUser = async (req, res) => {
    try {

        const { id } = req.params;

        const {
            reason
        } = req.body;


        if (!isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message:
                    'Invalid user ID.'
            });
        }


        const user =
            await User.findById(id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message:
                    'User not found.'
            });
        }


        // Never allow blocking admin
        if (user.role === 'admin') {
            return res.status(403).json({
                success: false,
                message:
                    'Administrator accounts cannot be blocked.'
            });
        }


        user.isBlocked = true;
        user.isActive = false;
        user.blockedAt = new Date();
        user.blockedReason =
            reason?.trim() ||
            'Account blocked by administrator.';

        await user.save();


        return res.status(200).json({
            success: true,
            message:
                `${user.role === 'staff' ? 'Technician' : 'Student'} blocked successfully.`,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                isBlocked: user.isBlocked,
                isActive: user.isActive,
                blockedAt: user.blockedAt,
                blockedReason:
                    user.blockedReason
            }
        });

    } catch (error) {

        console.error(
            'Block user error:',
            error
        );

        return res.status(500).json({
            success: false,
            message:
                'Unable to block user.',
            error: error.message
        });
    }
};


/*
|--------------------------------------------------------------------------
| Unblock User
|--------------------------------------------------------------------------
| PUT /api/admin/users/:id/unblock
|--------------------------------------------------------------------------
*/

const unblockUser = async (req, res) => {
    try {

        const { id } = req.params;

        if (!isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message:
                    'Invalid user ID.'
            });
        }


        const user =
            await User.findById(id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message:
                    'User not found.'
            });
        }


        if (user.role === 'admin') {
            return res.status(403).json({
                success: false,
                message:
                    'Administrator accounts cannot be modified this way.'
            });
        }


        user.isBlocked = false;
        user.isActive = true;
        user.blockedAt = null;
        user.blockedReason = '';


        await user.save();


        return res.status(200).json({
            success: true,
            message:
                'User unblocked successfully.',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                isBlocked: user.isBlocked,
                isActive: user.isActive
            }
        });

    } catch (error) {

        console.error(
            'Unblock user error:',
            error
        );

        return res.status(500).json({
            success: false,
            message:
                'Unable to unblock user.',
            error: error.message
        });
    }
};


/*
|--------------------------------------------------------------------------
| Activate User
|--------------------------------------------------------------------------
| PUT /api/admin/users/:id/activate
|--------------------------------------------------------------------------
*/

const activateUser = async (req, res) => {
    try {

        const { id } = req.params;

        if (!isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message:
                    'Invalid user ID.'
            });
        }


        const user =
            await User.findById(id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message:
                    'User not found.'
            });
        }


        if (user.role === 'admin') {
            return res.status(403).json({
                success: false,
                message:
                    'Administrator accounts cannot be modified this way.'
            });
        }


        user.isActive = true;
        user.isBlocked = false;
        user.blockedAt = null;
        user.blockedReason = '';


        await user.save();


        return res.status(200).json({
            success: true,
            message:
                'User activated successfully.',
            user
        });

    } catch (error) {

        console.error(
            'Activate user error:',
            error
        );

        return res.status(500).json({
            success: false,
            message:
                'Unable to activate user.',
            error: error.message
        });
    }
};


/*
|--------------------------------------------------------------------------
| Deactivate User
|--------------------------------------------------------------------------
| PUT /api/admin/users/:id/deactivate
|--------------------------------------------------------------------------
*/

const deactivateUser = async (req, res) => {
    try {

        const { id } = req.params;

        if (!isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message:
                    'Invalid user ID.'
            });
        }


        const user =
            await User.findById(id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message:
                    'User not found.'
            });
        }


        if (user.role === 'admin') {
            return res.status(403).json({
                success: false,
                message:
                    'Administrator accounts cannot be deactivated.'
            });
        }


        user.isActive = false;


        await user.save();


        return res.status(200).json({
            success: true,
            message:
                'User deactivated successfully.',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                isActive: user.isActive,
                isBlocked: user.isBlocked
            }
        });

    } catch (error) {

        console.error(
            'Deactivate user error:',
            error
        );

        return res.status(500).json({
            success: false,
            message:
                'Unable to deactivate user.',
            error: error.message
        });
    }
};


/*
|--------------------------------------------------------------------------
| Delete User
|--------------------------------------------------------------------------
| DELETE /api/admin/users/:id
|--------------------------------------------------------------------------
*/

const deleteUser = async (req, res) => {
    try {

        const { id } = req.params;

        if (!isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message:
                    'Invalid user ID.'
            });
        }


        const user =
            await User.findById(id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message:
                    'User not found.'
            });
        }


        if (user.role === 'admin') {
            return res.status(403).json({
                success: false,
                message:
                    'Administrator account cannot be deleted.'
            });
        }


        /*
        |--------------------------------------------------------------------------
        | Check assigned complaints
        |--------------------------------------------------------------------------
        */

        const assignedComplaints =
            await Complaint.countDocuments({
                assignedTo: user._id
            });


        if (
            user.role === 'staff' &&
            assignedComplaints > 0
        ) {
            return res.status(400).json({
                success: false,
                message:
                    `This technician has ${assignedComplaints} assigned complaint(s). Reassign them before deleting the account.`
            });
        }


        /*
        |--------------------------------------------------------------------------
        | Delete user
        |--------------------------------------------------------------------------
        */

        await User.findByIdAndDelete(
            user._id
        );


        return res.status(200).json({
            success: true,
            message:
                'User deleted successfully.'
        });

    } catch (error) {

        console.error(
            'Delete user error:',
            error
        );

        return res.status(500).json({
            success: false,
            message:
                'Unable to delete user.',
            error: error.message
        });
    }
};


/*
|--------------------------------------------------------------------------
| Technician Performance
|--------------------------------------------------------------------------
| GET /api/admin/technicians/performance
|--------------------------------------------------------------------------
|
| Provides:
|
| - Total assigned complaints
| - Pending complaints
| - In-progress complaints
| - Resolved complaints
| - Resolution percentage
| - Total reviews
| - Average rating
| - Rating distribution
| - Recent reviews
|
|--------------------------------------------------------------------------
*/

const getTechnicianPerformance = async (
    req,
    res
) => {

    try {

        /*
        |--------------------------------------------------------------------------
        | Get all technicians
        |--------------------------------------------------------------------------
        */

        const technicians =
            await User.find({
                role: 'staff'
            })
                .select(
                    '_id name email department isActive isBlocked createdAt lastLogin'
                )
                .sort({
                    name: 1
                });


        /*
        |--------------------------------------------------------------------------
        | Build performance data
        |--------------------------------------------------------------------------
        */

        const performance = [];


        for (
            const technician
            of technicians
        ) {

            /*
            |--------------------------------------------------------------------------
            | Complaint counts
            |--------------------------------------------------------------------------
            */

            const totalAssigned =
                await Complaint.countDocuments({
                    assignedTo:
                        technician._id
                });


            const pending =
                await Complaint.countDocuments({
                    assignedTo:
                        technician._id,
                    status: 'pending'
                });


            const inProgress =
                await Complaint.countDocuments({
                    assignedTo:
                        technician._id,
                    status: 'in-progress'
                });


            const resolved =
                await Complaint.countDocuments({
                    assignedTo:
                        technician._id,
                    status: 'resolved'
                });


            /*
            |--------------------------------------------------------------------------
            | Resolution percentage
            |--------------------------------------------------------------------------
            */

            const resolutionPercentage =
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
            | Feedback
            |--------------------------------------------------------------------------
            */

            const feedbacks =
                await Feedback.find({
                    staffId:
                        technician._id
                })
                    .select(
                        'rating comment submittedAt createdAt complaintId userId'
                    )
                    .populate(
                        'userId',
                        'name email'
                    )
                    .populate(
                        'complaintId',
                        'title'
                    )
                    .sort({
                        createdAt: -1
                    });


            /*
            |--------------------------------------------------------------------------
            | Rating calculation
            |--------------------------------------------------------------------------
            */

            const totalReviews =
                feedbacks.length;


            let totalRating = 0;


            feedbacks.forEach(
                (feedback) => {
                    totalRating +=
                        Number(
                            feedback.rating
                        );
                }
            );


            const averageRating =
                totalReviews > 0
                    ? Number(
                          (
                              totalRating /
                              totalReviews
                          ).toFixed(2)
                      )
                    : 0;


            /*
            |--------------------------------------------------------------------------
            | Rating distribution
            |--------------------------------------------------------------------------
            */

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


            /*
            |--------------------------------------------------------------------------
            | Performance score
            |--------------------------------------------------------------------------
            |
            | Combines:
            |
            | 70% resolution rate
            | 30% customer rating
            |
            */

            const ratingScore =
                averageRating > 0
                    ? (averageRating / 5) *
                      100
                    : 0;


            const performanceScore =
                Number(
                    (
                        resolutionPercentage *
                            0.7 +
                        ratingScore *
                            0.3
                    ).toFixed(1)
                );


            /*
            |--------------------------------------------------------------------------
            | Recent Reviews
            |--------------------------------------------------------------------------
            */

            const recentReviews =
                feedbacks
                    .slice(0, 5)
                    .map(
                        (feedback) => ({
                            id:
                                feedback._id,

                            rating:
                                feedback.rating,

                            comment:
                                feedback.comment,

                            student:
                                feedback.userId
                                    ? feedback
                                          .userId
                                          .name
                                    : 'Student',

                            complaint:
                                feedback
                                    .complaintId
                                    ? feedback
                                          .complaintId
                                          .title
                                    : 'Complaint',

                            submittedAt:
                                feedback.submittedAt ||
                                feedback.createdAt
                        })
                    );


            /*
            |--------------------------------------------------------------------------
            | Final technician object
            |--------------------------------------------------------------------------
            */

            performance.push({

                technician: {
                    id:
                        technician._id,

                    name:
                        technician.name,

                    email:
                        technician.email,

                    department:
                        technician.department,

                    isActive:
                        technician.isActive,

                    isBlocked:
                        technician.isBlocked,

                    createdAt:
                        technician.createdAt,

                    lastLogin:
                        technician.lastLogin
                },


                complaints: {
                    total:
                        totalAssigned,

                    pending:
                        pending,

                    inProgress:
                        inProgress,

                    resolved:
                        resolved
                },


                resolutionPercentage,


                reviews: {
                    total:
                        totalReviews,

                    averageRating,

                    ratingDistribution,

                    recent:
                        recentReviews
                },


                performanceScore
            });
        }


        /*
        |--------------------------------------------------------------------------
        | Ranking
        |--------------------------------------------------------------------------
        */

        performance.sort(
            (a, b) =>
                b.performanceScore -
                a.performanceScore
        );


        /*
        |--------------------------------------------------------------------------
        | Summary
        |--------------------------------------------------------------------------
        */

        const totalTechnicians =
            performance.length;


        const activeTechnicians =
            performance.filter(
                (item) =>
                    item.technician
                        .isActive &&
                    !item.technician
                        .isBlocked
            ).length;


        const blockedTechnicians =
            performance.filter(
                (item) =>
                    item.technician
                        .isBlocked
            ).length;


        const totalAssigned =
            performance.reduce(
                (sum, item) =>
                    sum +
                    item.complaints
                        .total,
                0
            );


        const totalResolved =
            performance.reduce(
                (sum, item) =>
                    sum +
                    item.complaints
                        .resolved,
                0
            );


        const totalReviews =
            performance.reduce(
                (sum, item) =>
                    sum +
                    item.reviews.total,
                0
            );


        const techniciansWithRatings =
            performance.filter(
                (item) =>
                    item.reviews
                        .total > 0
            );


        const averageTechnicianRating =
            techniciansWithRatings.length >
            0
                ? Number(
                      (
                          techniciansWithRatings.reduce(
                              (sum, item) =>
                                  sum +
                                  item.reviews
                                      .averageRating,
                              0
                          ) /
                          techniciansWithRatings.length
                      ).toFixed(2)
                  )
                : 0;


        /*
        |--------------------------------------------------------------------------
        | Response
        |--------------------------------------------------------------------------
        */

        return res.status(200).json({

            success: true,

            summary: {

                totalTechnicians,

                activeTechnicians,

                blockedTechnicians,

                totalAssigned,

                totalResolved,

                overallResolutionPercentage:
                    totalAssigned > 0
                        ? Number(
                              (
                                  (totalResolved /
                                      totalAssigned) *
                                  100
                              ).toFixed(1)
                          )
                        : 0,

                totalReviews,

                averageTechnicianRating
            },

            technicians:
                performance
        });

    } catch (error) {

        console.error(
            'Technician performance error:',
            error
        );

        return res.status(500).json({
            success: false,
            message:
                'Unable to load technician performance.',
            error: error.message
        });
    }
};


/*
|--------------------------------------------------------------------------
| Exports
|--------------------------------------------------------------------------
*/

module.exports = {

    getAllUsers,

    getStudents,

    getStaff,

    blockUser,

    unblockUser,

    activateUser,

    deactivateUser,

    deleteUser,

    getTechnicianPerformance
};