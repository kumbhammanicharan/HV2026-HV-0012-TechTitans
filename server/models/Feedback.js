const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema(
    {
        // ------------------------------------------------------------
        // Complaint being reviewed
        // ------------------------------------------------------------
        complaintId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Complaint',
            required: true,
            index: true,
        },

        // ------------------------------------------------------------
        // Student who submitted feedback
        // ------------------------------------------------------------
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },

        // ------------------------------------------------------------
        // Technician who handled the complaint
        // ------------------------------------------------------------
        staffId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: null,
            index: true,
        },

        // ------------------------------------------------------------
        // Rating
        // ------------------------------------------------------------
        rating: {
            type: Number,
            min: 1,
            max: 5,
            required: true,
        },

        // ------------------------------------------------------------
        // Student comment
        // ------------------------------------------------------------
        comment: {
            type: String,
            trim: true,
            default: '',
        },

        // ------------------------------------------------------------
        // Submission time
        // ------------------------------------------------------------
        submittedAt: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true,
    }
);

// ------------------------------------------------------------
// Prevent duplicate feedback for the same complaint/student
// ------------------------------------------------------------
feedbackSchema.index(
    {
        complaintId: 1,
        userId: 1,
    },
    {
        unique: true,
    }
);

// ------------------------------------------------------------
// Fast technician analytics
// ------------------------------------------------------------
feedbackSchema.index({
    staffId: 1,
    rating: 1,
});

feedbackSchema.index({
    staffId: 1,
    submittedAt: -1,
});

module.exports = mongoose.model(
    'Feedback',
    feedbackSchema
);