const mongoose = require('mongoose');

const staffUpdateSchema = new mongoose.Schema(
    {
        photoUrl: {
            type: String,
            default: '',
        },

        remarks: {
            type: String,
            default: '',
            trim: true,
        },

        status: {
            type: String,
            enum: ['pending', 'in-progress', 'resolved'],
            default: 'in-progress',
        },

        updatedAt: {
            type: Date,
            default: Date.now,
        },
    },
    {
        _id: true,
    }
);

const complaintSchema = new mongoose.Schema(
    {
        // ------------------------------------------------------------
        // Complaint information
        // ------------------------------------------------------------
        title: {
            type: String,
            required: true,
            trim: true,
        },

        description: {
            type: String,
            required: true,
            trim: true,
        },

        category: {
            type: String,
            required: true,
            trim: true,
            index: true,
        },

        // ------------------------------------------------------------
        // Evidence
        // ------------------------------------------------------------
        imageUrl: {
            type: String,
            default: '',
        },

        // ------------------------------------------------------------
        // Status
        // ------------------------------------------------------------
        status: {
            type: String,
            enum: ['pending', 'in-progress', 'resolved'],
            default: 'pending',
            index: true,
        },

        // ------------------------------------------------------------
        // Urgency
        // ------------------------------------------------------------
        dueInDays: {
            type: Number,
            required: true,
            enum: [1, 2, 3],
            default: 3,
            index: true,
        },

        // ------------------------------------------------------------
        // Student who raised complaint
        // ------------------------------------------------------------
        raisedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },

        // ------------------------------------------------------------
        // Technician assigned by admin
        // ------------------------------------------------------------
        assignedTo: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: null,
            index: true,
        },

        // ------------------------------------------------------------
        // Assignment tracking
        // ------------------------------------------------------------
        assignedAt: {
            type: Date,
            default: null,
        },

        // ------------------------------------------------------------
        // Resolution
        // ------------------------------------------------------------
        resolutionNotes: {
            type: String,
            default: '',
            trim: true,
        },

        resolvedAt: {
            type: Date,
            default: null,
        },

        // ------------------------------------------------------------
        // Dates
        // ------------------------------------------------------------
        date: {
            type: Date,
            default: Date.now,
            index: true,
        },

        updatedAt: {
            type: Date,
            default: Date.now,
        },

        // ------------------------------------------------------------
        // Technician progress history
        // ------------------------------------------------------------
        staffUpdates: {
            type: [staffUpdateSchema],
            default: [],
        },
    },
    {
        timestamps: true,
    }
);

// ------------------------------------------------------------
// Automatically maintain resolvedAt
// ------------------------------------------------------------
complaintSchema.pre('save', function (next) {
    if (
        this.status === 'resolved' &&
        !this.resolvedAt
    ) {
        this.resolvedAt = new Date();
    }

    if (this.status !== 'resolved') {
        this.resolvedAt = null;
    }

    this.updatedAt = new Date();

    next();
});

// ------------------------------------------------------------
// Useful indexes for dashboards
// ------------------------------------------------------------
complaintSchema.index({
    assignedTo: 1,
    status: 1,
});

complaintSchema.index({
    raisedBy: 1,
    date: -1,
});

complaintSchema.index({
    category: 1,
    status: 1,
});

complaintSchema.index({
    status: 1,
    date: -1,
});

module.exports = mongoose.model(
    'Complaint',
    complaintSchema
);