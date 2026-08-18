const mongoose = require('mongoose');
const Complaint = require('../models/Complaint');
const User = require('../models/User');
const { sendResolutionEmail } = require('../utils/mailer');

/*
|--------------------------------------------------------------------------
| CREATE COMPLAINT
|--------------------------------------------------------------------------
*/
const createComplaint = async (req, res) => {
    try {
        console.log('Creating complaint...');
        console.log('Authenticated user:', req.user);

        if (!req.user) {
            return res.status(401).json({
                message: 'Authentication required. Please login again.'
            });
        }

        if (req.user.role !== 'student') {
            return res.status(403).json({
                message: 'Only students can submit complaints.'
            });
        }

        const userId = req.user.id || req.user._id;

        if (!userId) {
            return res.status(401).json({
                message: 'User ID missing from authentication token.'
            });
        }

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({
                message: 'Invalid user account. Please logout and login again.'
            });
        }

        const {
            title,
            description,
            category,
            dueInDays
        } = req.body;

        if (!title || !description || !category || !dueInDays) {
            return res.status(400).json({
                message:
                    'Title, description, category and due period are required.'
            });
        }

        const numericDueDays = Number(dueInDays);

        if (![1, 2, 3].includes(numericDueDays)) {
            return res.status(400).json({
                message: 'Invalid due period. Please select 1, 2 or 3 days.'
            });
        }

        const student = await User.findById(userId);

        if (!student) {
            return res.status(404).json({
                message: 'Student account not found. Please login again.'
            });
        }

        if (student.role !== 'student') {
            return res.status(403).json({
                message: 'Only student accounts can submit complaints.'
            });
        }

        const imageUrl = req.file
            ? `/uploads/${req.file.filename}`
            : '';

        const complaint = new Complaint({
            title: title.trim(),
            description: description.trim(),
            category: category.trim(),
            dueInDays: numericDueDays,
            imageUrl,
            raisedBy: new mongoose.Types.ObjectId(userId),
            status: 'pending',
            date: new Date(),
            updatedAt: new Date()
        });

        await complaint.save();

        console.log(
            'Complaint created:',
            complaint._id.toString()
        );

        return res.status(201).json({
            message: 'Complaint submitted successfully',
            complaint
        });

    } catch (error) {
        console.error('Error creating complaint:', error);

        if (error.name === 'ValidationError') {
            return res.status(400).json({
                message: 'Complaint validation failed.',
                error: error.message
            });
        }

        return res.status(500).json({
            message: 'Server error while creating complaint.',
            error: error.message
        });
    }
};


/*
|--------------------------------------------------------------------------
| STUDENT - GET MY COMPLAINTS
|--------------------------------------------------------------------------
*/
const getMyComplaints = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                message: 'Authentication required.'
            });
        }

        const userId = req.user.id || req.user._id;

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({
                message: 'Invalid user account.'
            });
        }

        const complaints = await Complaint.find({
            raisedBy: userId
        })
            .populate(
                'assignedTo',
                'name email department'
            )
            .sort({ date: -1 });

        return res.json(complaints);

    } catch (error) {
        console.error('Error getting student complaints:', error);

        return res.status(500).json({
            message: 'Server error while loading complaints.',
            error: error.message
        });
    }
};


/*
|--------------------------------------------------------------------------
| GET SINGLE COMPLAINT
|--------------------------------------------------------------------------
*/
const getComplaintById = async (req, res) => {
    try {
        const complaintId = req.params.id;

        if (!mongoose.Types.ObjectId.isValid(complaintId)) {
            return res.status(400).json({
                message: 'Invalid complaint ID.'
            });
        }

        const complaint = await Complaint.findById(complaintId)
            .populate(
                'raisedBy',
                'name email department'
            )
            .populate(
                'assignedTo',
                'name email department'
            );

        if (!complaint) {
            return res.status(404).json({
                message: 'Complaint not found.'
            });
        }

        /*
        |--------------------------------------------------------------------------
        | STUDENT ACCESS
        |--------------------------------------------------------------------------
        */
        if (req.user?.role === 'student') {
            const userId = req.user.id || req.user._id;

            if (
                complaint.raisedBy &&
                complaint.raisedBy._id.toString() !==
                    userId.toString()
            ) {
                return res.status(403).json({
                    message:
                        'You are not authorized to view this complaint.'
                });
            }
        }

        /*
        |--------------------------------------------------------------------------
        | STAFF ACCESS
        |--------------------------------------------------------------------------
        | Staff can only view complaints assigned to them.
        |--------------------------------------------------------------------------
        */
        if (req.user?.role === 'staff') {
            const staffId = req.user.id || req.user._id;

            if (
                !complaint.assignedTo ||
                complaint.assignedTo._id.toString() !==
                    staffId.toString()
            ) {
                return res.status(403).json({
                    message:
                        'This complaint is not assigned to you.'
                });
            }
        }

        return res.json(complaint);

    } catch (error) {
        console.error('Error getting complaint:', error);

        return res.status(500).json({
            message: 'Server error while loading complaint.',
            error: error.message
        });
    }
};


/*
|--------------------------------------------------------------------------
| ADMIN - GET ALL COMPLAINTS
|--------------------------------------------------------------------------
*/
const getAllComplaints = async (req, res) => {
    try {
        if (!req.user || req.user.role !== 'admin') {
            return res.status(403).json({
                message:
                    'Only administrators can view all complaints.'
            });
        }

        const complaints = await Complaint.find()
            .populate(
                'raisedBy',
                'email name department'
            )
            .populate(
                'assignedTo',
                'email name department'
            )
            .sort({ date: -1 });

        const pending = complaints
            .filter(c => c.status === 'pending')
            .sort((a, b) => a.dueInDays - b.dueInDays);

        const inProgress = complaints
            .filter(c => c.status === 'in-progress')
            .sort((a, b) => a.dueInDays - b.dueInDays);

        const resolved = complaints
            .filter(c => c.status === 'resolved')
            .sort(
                (a, b) =>
                    new Date(b.updatedAt) -
                    new Date(a.updatedAt)
            );

        return res.json({
            pending,
            inProgress,
            resolved
        });

    } catch (error) {
        console.error('Error getting all complaints:', error);

        return res.status(500).json({
            message:
                'Server error while loading admin complaints.',
            error: error.message
        });
    }
};


/*
|--------------------------------------------------------------------------
| ADMIN - ASSIGN COMPLAINT
|--------------------------------------------------------------------------
*/
const assignComplaint = async (req, res) => {
    try {
        if (!req.user || req.user.role !== 'admin') {
            return res.status(403).json({
                message:
                    'Only administrators can assign complaints.'
            });
        }

        const { staffId } = req.body;

        if (!staffId) {
            return res.status(400).json({
                message: 'Staff ID is required.'
            });
        }

        if (!mongoose.Types.ObjectId.isValid(staffId)) {
            return res.status(400).json({
                message: 'Invalid staff ID.'
            });
        }

        const staff = await User.findOne({
            _id: staffId,
            role: 'staff'
        });

        if (!staff) {
            return res.status(400).json({
                message: 'Invalid staff member selected.'
            });
        }

        const complaint = await Complaint.findByIdAndUpdate(
            req.params.id,
            {
                $set: {
                    assignedTo: staff._id,
                    status: 'in-progress',
                    updatedAt: new Date()
                }
            },
            {
                new: true,
                runValidators: true
            }
        )
            .populate(
                'raisedBy',
                'name email department'
            )
            .populate(
                'assignedTo',
                'name email department'
            );

        if (!complaint) {
            return res.status(404).json({
                message: 'Complaint not found.'
            });
        }

        console.log(
            '======================================'
        );

        console.log(
            'COMPLAINT ASSIGNED SUCCESSFULLY'
        );

        console.log(
            'Complaint:',
            complaint._id.toString()
        );

        console.log(
            'Technician:',
            staff.name || staff.email
        );

        console.log(
            'Technician ID:',
            staff._id.toString()
        );

        console.log(
            'AssignedTo saved as:',
            complaint.assignedTo?._id?.toString()
        );

        console.log(
            'Status:',
            complaint.status
        );

        console.log(
            '======================================'
        );

        /*
        |--------------------------------------------------------------------------
        | OPTIONAL EMAIL
        |--------------------------------------------------------------------------
        */
        try {
            if (
                process.env.EMAIL_USER &&
                process.env.EMAIL_PASS &&
                staff.email
            ) {
                await sendResolutionEmail(
                    staff.email,
                    'New Complaint Assigned to You',
                    `Hello ${staff.name || staff.email},

A new complaint titled "${complaint.title}" has been assigned to you.

Please login to the complaint tracking system to view the complaint.

Thank you.`
                );

                console.log(
                    `Assignment email sent to ${staff.email}`
                );
            } else {
                console.log(
                    'Email not configured. Skipping assignment email.'
                );
            }
        } catch (mailError) {
            console.error(
                'Assignment email failed:',
                mailError.message
            );
        }

        return res.status(200).json({
            message: 'Complaint assigned successfully.',
            complaint
        });

    } catch (error) {
        console.error('Error assigning complaint:', error);

        return res.status(500).json({
            message:
                'Server error while assigning complaint.',
            error: error.message
        });
    }
};


/*
|--------------------------------------------------------------------------
| ADMIN - UPDATE STATUS
|--------------------------------------------------------------------------
*/
const updateComplaintStatus = async (req, res) => {
    try {
        if (!req.user || req.user.role !== 'admin') {
            return res.status(403).json({
                message:
                    'Only administrators can update complaint status.'
            });
        }

        const {
            status,
            resolutionNotes
        } = req.body;

        const allowedStatuses = [
            'pending',
            'in-progress',
            'resolved'
        ];

        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({
                message: 'Invalid complaint status.'
            });
        }

        const complaint = await Complaint.findById(
            req.params.id
        ).populate('raisedBy');

        if (!complaint) {
            return res.status(404).json({
                message: 'Complaint not found.'
            });
        }

        const previousStatus = complaint.status;

        complaint.status = status;

        if (resolutionNotes !== undefined) {
            complaint.resolutionNotes = resolutionNotes;
        }

        complaint.updatedAt = new Date();

        await complaint.save();

        /*
        |--------------------------------------------------------------------------
        | RESOLUTION EMAIL
        |--------------------------------------------------------------------------
        */
        if (
            status === 'resolved' &&
            previousStatus !== 'resolved' &&
            complaint.raisedBy?.email &&
            process.env.EMAIL_USER &&
            process.env.EMAIL_PASS
        ) {
            try {
                await sendResolutionEmail(
                    complaint.raisedBy.email,
                    'Your complaint has been resolved',
                    `Hello ${
                        complaint.raisedBy.name || 'Student'
                    },

Your complaint titled "${complaint.title}" has been resolved.

Thank you.`
                );
            } catch (mailError) {
                console.error(
                    'Resolution email failed:',
                    mailError.message
                );
            }
        }

        return res.json({
            message:
                'Complaint status updated successfully.',
            complaint
        });

    } catch (error) {
        console.error(
            'Error updating complaint status:',
            error
        );

        return res.status(500).json({
            message:
                'Server error while updating complaint.',
            error: error.message
        });
    }
};


/*
|--------------------------------------------------------------------------
| STAFF - GET ASSIGNED COMPLAINTS
|--------------------------------------------------------------------------
*/
const getAssignedComplaints = async (req, res) => {
    try {
        if (!req.user || req.user.role !== 'staff') {
            return res.status(403).json({
                message:
                    'Only staff members can view assigned complaints.'
            });
        }

        const staffId = req.user.id || req.user._id;

        if (
            !staffId ||
            !mongoose.Types.ObjectId.isValid(staffId)
        ) {
            return res.status(400).json({
                message: 'Invalid staff account.'
            });
        }

        console.log(
            'Fetching complaints for staff:',
            staffId
        );

        const complaints = await Complaint.find({
            assignedTo: new mongoose.Types.ObjectId(staffId)
        })
            .populate(
                'raisedBy',
                'name email department'
            )
            .populate(
                'assignedTo',
                'name email department'
            )
            .sort({ date: -1 });

        console.log(
            `Found ${complaints.length} complaints for staff ${staffId}`
        );

        return res.json(complaints);

    } catch (error) {
        console.error(
            'Error getting assigned complaints:',
            error
        );

        return res.status(500).json({
            message:
                'Server error while loading assigned complaints.',
            error: error.message
        });
    }
};


/*
|--------------------------------------------------------------------------
| STAFF - UPDATE COMPLAINT
|--------------------------------------------------------------------------
| Staff can:
| - Add remarks
| - Upload progress photo
| - Change status
| - Add resolution notes
|--------------------------------------------------------------------------
*/
const staffUpdateComplaint = async (req, res) => {
    try {
        if (!req.user || req.user.role !== 'staff') {
            return res.status(403).json({
                message:
                    'Only staff members can submit complaint updates.'
            });
        }

        const staffId = req.user.id || req.user._id;

        const complaint = await Complaint.findById(
            req.params.id
        );

        if (!complaint) {
            return res.status(404).json({
                message: 'Complaint not found.'
            });
        }

        /*
        |--------------------------------------------------------------------------
        | IMPORTANT SECURITY CHECK
        |--------------------------------------------------------------------------
        */
        if (
            !complaint.assignedTo ||
            complaint.assignedTo.toString() !==
                staffId.toString()
        ) {
            return res.status(403).json({
                message:
                    'This complaint is not assigned to you.'
            });
        }

        const {
            remarks,
            status,
            resolutionNotes
        } = req.body;

        const allowedStatuses = [
            'pending',
            'in-progress',
            'resolved'
        ];

        /*
        |--------------------------------------------------------------------------
        | Validate status if supplied
        |--------------------------------------------------------------------------
        */
        if (
            status &&
            !allowedStatuses.includes(status)
        ) {
            return res.status(400).json({
                message: 'Invalid complaint status.'
            });
        }

        /*
        |--------------------------------------------------------------------------
        | Add staff update
        |--------------------------------------------------------------------------
        */
        const photoUrl = req.file
            ? `/uploads/${req.file.filename}`
            : '';

        /*
        |--------------------------------------------------------------------------
        | Only create an update when something was actually supplied
        |--------------------------------------------------------------------------
        */
        if (
            remarks ||
            photoUrl
        ) {
            complaint.staffUpdates.push({
                photoUrl,
                remarks: remarks || '',
                updatedAt: new Date()
            });
        }

        /*
        |--------------------------------------------------------------------------
        | Update status
        |--------------------------------------------------------------------------
        */
        if (status) {
            complaint.status = status;
        } else if (
            complaint.status === 'pending' &&
            (remarks || photoUrl)
        ) {
            /*
            Automatically move pending complaint to
            in-progress when technician starts updating it.
            */
            complaint.status = 'in-progress';
        }

        /*
        |--------------------------------------------------------------------------
        | Resolution notes
        |--------------------------------------------------------------------------
        */
        if (
            resolutionNotes !== undefined
        ) {
            complaint.resolutionNotes =
                resolutionNotes;
        }

        complaint.updatedAt = new Date();

        await complaint.save();

        const updatedComplaint =
            await Complaint.findById(
                complaint._id
            )
                .populate(
                    'raisedBy',
                    'name email department'
                )
                .populate(
                    'assignedTo',
                    'name email department'
                );

        /*
        |--------------------------------------------------------------------------
        | Notify student when technician resolves complaint
        |--------------------------------------------------------------------------
        */
        if (
            status === 'resolved' &&
            updatedComplaint.raisedBy?.email &&
            process.env.EMAIL_USER &&
            process.env.EMAIL_PASS
        ) {
            try {
                await sendResolutionEmail(
                    updatedComplaint.raisedBy.email,
                    'Your complaint has been resolved',
                    `Hello ${
                        updatedComplaint.raisedBy.name ||
                        'Student'
                    },

Your complaint titled "${updatedComplaint.title}" has been resolved by the technician.

Thank you.`
                );
            } catch (mailError) {
                console.error(
                    'Staff resolution email failed:',
                    mailError.message
                );
            }
        }

        console.log(
            `Staff ${staffId} updated complaint ${complaint._id}`
        );

        return res.json({
            message:
                'Complaint update submitted successfully.',
            complaint: updatedComplaint
        });

    } catch (error) {
        console.error(
            'Error submitting staff update:',
            error
        );

        return res.status(500).json({
            message:
                'Server error while submitting staff update.',
            error: error.message
        });
    }
};


/*
|--------------------------------------------------------------------------
| COMPLAINT STATISTICS
|--------------------------------------------------------------------------
*/
const getComplaintStats = async (req, res) => {
    try {
        const totalComplaints =
            await Complaint.countDocuments();

        const resolvedComplaints =
            await Complaint.countDocuments({
                status: 'resolved'
            });

        const pendingComplaints =
            await Complaint.countDocuments({
                status: 'pending'
            });

        const inProgressComplaints =
            await Complaint.countDocuments({
                status: 'in-progress'
            });

        const resolvedWithUpdates =
            await Complaint.find({
                status: 'resolved',
                'staffUpdates.0': {
                    $exists: true
                }
            });

        let totalResponseTime = 0;
        let countWithResponseTime = 0;

        resolvedWithUpdates.forEach(
            complaint => {
                if (
                    complaint.staffUpdates?.length
                ) {
                    const firstUpdate =
                        complaint.staffUpdates[0];

                    totalResponseTime +=
                        firstUpdate.updatedAt -
                        complaint.date;

                    countWithResponseTime++;
                }
            }
        );

        const avgResponseTime =
            countWithResponseTime > 0
                ? Math.round(
                      totalResponseTime /
                          countWithResponseTime /
                          (1000 *
                              60 *
                              60)
                  )
                : 24;

        return res.json({
            total: totalComplaints,
            pending: pendingComplaints,
            inProgress: inProgressComplaints,
            resolved: resolvedComplaints,
            avgResponseTime
        });

    } catch (error) {
        console.error(
            'Error in complaint statistics:',
            error
        );

        return res.status(500).json({
            message:
                'Server error while loading complaint statistics.'
        });
    }
};


module.exports = {
    createComplaint,
    getMyComplaints,
    getComplaintById,
    getAllComplaints,
    assignComplaint,
    updateComplaintStatus,
    getAssignedComplaints,
    staffUpdateComplaint,
    getComplaintStats
};