import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useHistory } from 'react-router-dom';

const API_URL = 'https://campuscare-backend-jq45.onrender.com';

const getImageUrl = (value) => {
    if (!value || typeof value !== 'string') {
        return '';
    }

    const trimmed = value.trim();

    if (!trimmed) {
        return '';
    }

    if (
        trimmed.startsWith('http://') ||
        trimmed.startsWith('https://') ||
        trimmed.startsWith('data:')
    ) {
        return trimmed;
    }

    if (trimmed.startsWith('//')) {
        return `https:${trimmed}`;
    }

    return `${API_URL}${trimmed.startsWith('/') ? '' : '/'}${trimmed}`;
};

const getLatestStaffPhoto = (complaint) => {
    const updates = Array.isArray(complaint?.staffUpdates)
        ? complaint.staffUpdates
        : [];

    for (let i = updates.length - 1; i >= 0; i -= 1) {
        const update = updates[i];

        const photo =
            update?.photoUrl ||
            update?.imageUrl ||
            update?.photo ||
            update?.image;

        if (photo) {
            return getImageUrl(photo);
        }
    }

    return '';
};

const MyComplaints = () => {
    const history = useHistory();

    const [complaints, setComplaints] = useState([]);
    const [feedbacks, setFeedbacks] = useState([]);
    const [feedbackState, setFeedbackState] = useState({});

    const [filter, setFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('date');

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState('');
    const [userInfo, setUserInfo] = useState(null);

    const fetchComplaints = async () => {
        try {
            const token = localStorage.getItem('token');

            const response = await axios.get(
                `${API_URL}/api/complaints/my`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const data = Array.isArray(response.data)
                ? response.data
                : [];

            setComplaints(data);
        } catch (err) {
            console.error('Fetch complaints error:', err);

            setError(
                err.response?.data?.message ||
                    'Failed to fetch your complaints.'
            );
        }
    };

    const fetchFeedbacks = async () => {
        try {
            const token = localStorage.getItem('token');

            const response = await axios.get(
                `${API_URL}/api/feedback`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            setFeedbacks(
                Array.isArray(response.data)
                    ? response.data
                    : []
            );
        } catch (err) {
            console.error('Fetch feedback error:', err);
        }
    };

    const fetchProfile = async () => {
        try {
            const token = localStorage.getItem('token');

            const response = await axios.get(
                `${API_URL}/api/auth/profile`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            setUserInfo(response.data);
        } catch (err) {
            console.error('Fetch profile error:', err);
        }
    };

    const refreshAll = async () => {
        setRefreshing(true);
        setError('');

        await Promise.all([
            fetchComplaints(),
            fetchFeedbacks(),
            fetchProfile(),
        ]);

        setRefreshing(false);
    };

    useEffect(() => {
        const load = async () => {
            setLoading(true);

            await Promise.all([
                fetchComplaints(),
                fetchFeedbacks(),
                fetchProfile(),
            ]);

            setLoading(false);
        };

        load();
    }, []);

    const stats = useMemo(() => {
        return {
            total: complaints.length,

            pending: complaints.filter(
                (c) => c.status === 'pending'
            ).length,

            inProgress: complaints.filter(
                (c) => c.status === 'in-progress'
            ).length,

            resolved: complaints.filter(
                (c) => c.status === 'resolved'
            ).length,
        };
    }, [complaints]);

    const handleFeedbackChange = (
        complaintId,
        field,
        value
    ) => {
        setFeedbackState((prev) => ({
            ...prev,
            [complaintId]: {
                ...prev[complaintId],
                [field]: value,
            },
        }));
    };

    const submitFeedback = async (complaintId) => {
        const current = feedbackState[complaintId];

        if (!current?.rating) {
            setError(
                'Please select a rating before submitting feedback.'
            );
            return;
        }

        try {
            setError('');

            await axios.post(
                `${API_URL}/api/feedback`,
                {
                    complaintId,
                    rating: Number(current.rating),
                    comment: current.comment || '',
                },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem(
                            'token'
                        )}`,
                    },
                }
            );

            setFeedbackState((prev) => ({
                ...prev,
                [complaintId]: {
                    ...prev[complaintId],
                    submitted: true,
                },
            }));

            await fetchFeedbacks();
        } catch (err) {
            console.error(
                'Submit feedback error:',
                err
            );

            setError(
                err.response?.data?.message ||
                    'Failed to submit feedback.'
            );
        }
    };

    const hasFeedback = (complaintId) => {
        return feedbacks.some((feedback) => {
            const feedbackComplaint =
                feedback.complaintId;

            return (
                feedbackComplaint?._id === complaintId ||
                feedbackComplaint === complaintId
            );
        });
    };

    const filteredComplaints = useMemo(() => {
        const search = searchTerm.toLowerCase().trim();

        return [...complaints]
            .filter((complaint) => {
                const matchesFilter =
                    filter === 'all' ||
                    complaint.status === filter;

                const matchesSearch =
                    complaint.title
                        ?.toLowerCase()
                        .includes(search) ||
                    complaint.category
                        ?.toLowerCase()
                        .includes(search) ||
                    complaint.description
                        ?.toLowerCase()
                        .includes(search);

                return (
                    matchesFilter &&
                    matchesSearch
                );
            })
            .sort((a, b) => {
                if (sortBy === 'title') {
                    return (
                        a.title || ''
                    ).localeCompare(
                        b.title || ''
                    );
                }

                return (
                    new Date(b.date || 0) -
                    new Date(a.date || 0)
                );
            });
    }, [
        complaints,
        filter,
        searchTerm,
        sortBy,
    ]);

    const getStatusStyle = (status) => {
        switch (status) {
            case 'resolved':
                return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400';

            case 'in-progress':
                return 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400';

            default:
                return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-[70vh] items-center justify-center bg-slate-50 dark:bg-slate-950">
                <div className="text-center">
                    <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-indigo-600" />

                    <p className="mt-4 text-sm text-slate-500">
                        Loading your complaints...
                    </p>
                </div>
            </div>
        );
    }

    const resolutionPercentage =
        stats.total > 0
            ? Math.round(
                  (stats.resolved /
                      stats.total) *
                      100
              )
            : 0;

    return (
        <div className="min-h-[calc(100vh-72px)] bg-slate-50 px-4 py-10 dark:bg-slate-950 sm:px-6">
            <div className="mx-auto max-w-7xl">

                <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
                    <div>
                        <p className="text-sm font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                            Student Portal
                        </p>

                        <h1 className="mt-1 text-3xl font-black text-slate-900 dark:text-white">
                            My Complaints
                        </h1>

                        {userInfo?.name && (
                            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                                Welcome,{' '}
                                <span className="font-semibold">
                                    {userInfo.name}
                                </span>
                            </p>
                        )}
                    </div>

                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={refreshAll}
                            disabled={refreshing}
                            className="secondary-button"
                        >
                            {refreshing
                                ? 'Refreshing...'
                                : '↻ Refresh'}
                        </button>

                        <button
                            type="button"
                            onClick={() =>
                                history.push(
                                    '/complaints/new'
                                )
                            }
                            className="primary-button"
                        >
                            + New Complaint
                        </button>
                    </div>
                </div>

                {error && (
                    <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
                        {error}
                    </div>
                )}

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

                    <div className="modern-card p-5">
                        <p className="text-sm text-slate-500">
                            Total
                        </p>

                        <p className="mt-1 text-3xl font-black text-slate-900 dark:text-white">
                            {stats.total}
                        </p>
                    </div>

                    <div className="modern-card p-5">
                        <p className="text-sm text-slate-500">
                            Pending
                        </p>

                        <p className="mt-1 text-3xl font-black text-slate-900 dark:text-white">
                            {stats.pending}
                        </p>
                    </div>

                    <div className="modern-card p-5">
                        <p className="text-sm text-slate-500">
                            In Progress
                        </p>

                        <p className="mt-1 text-3xl font-black text-slate-900 dark:text-white">
                            {stats.inProgress}
                        </p>
                    </div>

                    <div className="modern-card p-5">
                        <p className="text-sm text-slate-500">
                            Resolved
                        </p>

                        <p className="mt-1 text-3xl font-black text-slate-900 dark:text-white">
                            {stats.resolved}
                        </p>
                    </div>

                </div>

                {stats.total > 0 && (
                    <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="font-bold text-slate-900 dark:text-white">
                                    Resolution Progress
                                </h2>

                                <p className="mt-1 text-sm text-slate-500">
                                    {resolutionPercentage}% of your complaints are resolved.
                                </p>
                            </div>

                            <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
                                {resolutionPercentage}%
                            </span>
                        </div>

                        <div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                            <div
                                className="h-full rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 transition-all"
                                style={{
                                    width: `${resolutionPercentage}%`,
                                }}
                            />
                        </div>
                    </div>
                )}

                <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                    <div className="grid gap-4 md:grid-cols-3">

                        <div>
                            <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-400">
                                Status
                            </label>

                            <select
                                value={filter}
                                onChange={(e) =>
                                    setFilter(
                                        e.target.value
                                    )
                                }
                                className="select-field"
                            >
                                <option value="all">
                                    All Complaints
                                </option>

                                <option value="pending">
                                    Pending
                                </option>

                                <option value="in-progress">
                                    In Progress
                                </option>

                                <option value="resolved">
                                    Resolved
                                </option>
                            </select>
                        </div>

                        <div>
                            <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-400">
                                Sort
                            </label>

                            <select
                                value={sortBy}
                                onChange={(e) =>
                                    setSortBy(
                                        e.target.value
                                    )
                                }
                                className="select-field"
                            >
                                <option value="date">
                                    Newest First
                                </option>

                                <option value="title">
                                    Title
                                </option>
                            </select>
                        </div>

                        <div>
                            <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-400">
                                Search
                            </label>

                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) =>
                                    setSearchTerm(
                                        e.target.value
                                    )
                                }
                                placeholder="Search complaints..."
                                className="input-field"
                            />
                        </div>

                    </div>
                </div>

                <div className="mt-6">

                    {filteredComplaints.length === 0 ? (
                        <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center dark:border-slate-700 dark:bg-slate-900">
                            <div className="text-5xl">
                                📭
                            </div>

                            <h2 className="mt-5 text-xl font-bold text-slate-900 dark:text-white">
                                No complaints found
                            </h2>

                            <p className="mx-auto mt-2 max-w-md text-sm text-slate-500 dark:text-slate-400">
                                {complaints.length === 0
                                    ? "You haven't submitted a complaint yet."
                                    : 'Try changing your search or filters.'}
                            </p>

                            {complaints.length === 0 && (
                                <button
                                    type="button"
                                    onClick={() =>
                                        history.push(
                                            '/complaints/new'
                                        )
                                    }
                                    className="primary-button mt-6"
                                >
                                    Submit Your First Complaint
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">

                            {filteredComplaints.map(
                                (complaint) => {

                                    const beforeImage =
                                        getImageUrl(
                                            complaint.imageUrl
                                        );

                                    const afterImage =
                                        getLatestStaffPhoto(
                                            complaint
                                        );

                                    return (
                                        <div
                                            key={
                                                complaint._id
                                            }
                                            className="modern-card flex flex-col overflow-hidden"
                                        >
                                            <div className="p-5">

                                                <div className="flex items-start justify-between gap-3">

                                                    <h2 className="line-clamp-2 font-bold text-slate-900 dark:text-white">
                                                        {
                                                            complaint.title
                                                        }
                                                    </h2>

                                                    <span
                                                        className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold capitalize ${getStatusStyle(
                                                            complaint.status
                                                        )}`}
                                                    >
                                                        {(
                                                            complaint.status ||
                                                            'pending'
                                                        ).replace(
                                                            '-',
                                                            ' '
                                                        )}
                                                    </span>

                                                </div>

                                                <div className="mt-4 flex flex-wrap gap-2">
                                                    <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400">
                                                        {
                                                            complaint.category
                                                        }
                                                    </span>

                                                    <span className="text-xs text-slate-400">
                                                        {complaint.date
                                                            ? new Date(
                                                                  complaint.date
                                                              ).toLocaleDateString()
                                                            : '—'}
                                                    </span>
                                                </div>

                                                <p className="mt-4 line-clamp-3 text-sm leading-6 text-slate-500 dark:text-slate-400">
                                                    {
                                                        complaint.description
                                                    }
                                                </p>

                                                {(beforeImage ||
                                                    afterImage) && (
                                                    <div className="mt-5 grid grid-cols-2 gap-3">

                                                        <div>
                                                            <p className="mb-2 text-[10px] font-black uppercase tracking-wider text-slate-400">
                                                                Before
                                                            </p>

                                                            {beforeImage ? (
                                                                <img
                                                                    src={
                                                                        beforeImage
                                                                    }
                                                                    alt="Before complaint"
                                                                    className="h-28 w-full rounded-xl border border-slate-200 object-cover dark:border-slate-700"
                                                                />
                                                            ) : (
                                                                <div className="flex h-28 items-center justify-center rounded-xl bg-slate-100 text-xs text-slate-400 dark:bg-slate-800">
                                                                    No image
                                                                </div>
                                                            )}
                                                        </div>

                                                        <div>
                                                            <p className="mb-2 text-[10px] font-black uppercase tracking-wider text-emerald-600">
                                                                After
                                                            </p>

                                                            {afterImage ? (
                                                                <img
                                                                    src={
                                                                        afterImage
                                                                    }
                                                                    alt="After technician work"
                                                                    className="h-28 w-full rounded-xl border border-emerald-200 object-cover dark:border-emerald-900"
                                                                />
                                                            ) : (
                                                                <div className="flex h-28 items-center justify-center rounded-xl bg-slate-100 text-xs text-slate-400 dark:bg-slate-800">
                                                                    Not available
                                                                </div>
                                                            )}
                                                        </div>

                                                    </div>
                                                )}

                                                {complaint.resolutionNotes && (
                                                    <div className="mt-4 rounded-xl bg-emerald-50 p-3 text-xs text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
                                                        <strong>
                                                            Resolution:
                                                        </strong>{' '}
                                                        {
                                                            complaint.resolutionNotes
                                                        }
                                                    </div>
                                                )}

                                                {complaint.staffUpdates?.length > 0 && (
                                                    <p className="mt-4 text-xs font-medium text-slate-400">
                                                        🕘{' '}
                                                        {
                                                            complaint
                                                                .staffUpdates
                                                                .length
                                                        }{' '}
                                                        staff update
                                                        {complaint
                                                            .staffUpdates
                                                            .length > 1
                                                            ? 's'
                                                            : ''}
                                                    </p>
                                                )}

                                            </div>

                                            {complaint.status ===
                                                'resolved' &&
                                                !hasFeedback(
                                                    complaint._id
                                                ) &&
                                                !feedbackState[
                                                    complaint._id
                                                ]?.submitted && (
                                                    <div className="border-t border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-800/50">

                                                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                                                            ⭐ Rate the resolution
                                                        </h3>

                                                        <select
                                                            value={
                                                                feedbackState[
                                                                    complaint
                                                                        ._id
                                                                ]?.rating ||
                                                                ''
                                                            }
                                                            onChange={(
                                                                e
                                                            ) =>
                                                                handleFeedbackChange(
                                                                    complaint._id,
                                                                    'rating',
                                                                    e.target.value
                                                                )
                                                            }
                                                            className="select-field mt-3"
                                                        >
                                                            <option value="">
                                                                Select rating
                                                            </option>
                                                            <option value="1">
                                                                1 - Poor
                                                            </option>
                                                            <option value="2">
                                                                2 - Fair
                                                            </option>
                                                            <option value="3">
                                                                3 - Good
                                                            </option>
                                                            <option value="4">
                                                                4 - Very Good
                                                            </option>
                                                            <option value="5">
                                                                5 - Excellent
                                                            </option>
                                                        </select>

                                                        <textarea
                                                            value={
                                                                feedbackState[
                                                                    complaint
                                                                        ._id
                                                                ]?.comment ||
                                                                ''
                                                            }
                                                            onChange={(
                                                                e
                                                            ) =>
                                                                handleFeedbackChange(
                                                                    complaint._id,
                                                                    'comment',
                                                                    e.target.value
                                                                )
                                                            }
                                                            placeholder="Share your experience..."
                                                            rows={3}
                                                            className="input-field mt-3 resize-none"
                                                        />

                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                submitFeedback(
                                                                    complaint._id
                                                                )
                                                            }
                                                            className="mt-3 w-full rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-emerald-700"
                                                        >
                                                            Submit Feedback
                                                        </button>

                                                    </div>
                                                )}

                                            {(hasFeedback(
                                                complaint._id
                                            ) ||
                                                feedbackState[
                                                    complaint._id
                                                ]?.submitted) && (
                                                <div className="border-t border-emerald-200 bg-emerald-50 px-5 py-3 text-xs font-semibold text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-500/10 dark:text-emerald-400">
                                                    ✓ Feedback submitted
                                                </div>
                                            )}

                                            <div className="mt-auto flex items-center justify-between border-t border-slate-200 p-4 dark:border-slate-800">

                                                <span className="max-w-[55%] truncate text-xs text-slate-400">
                                                    {complaint.assignedTo
                                                        ? `Assigned: ${
                                                              complaint
                                                                  .assignedTo
                                                                  .name ||
                                                              complaint
                                                                  .assignedTo
                                                                  .email
                                                          }`
                                                        : 'Not assigned yet'}
                                                </span>

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        history.push(
                                                            `/complaints/${complaint._id}`
                                                        )
                                                    }
                                                    className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-indigo-700"
                                                >
                                                    Track Complaint →
                                                </button>

                                            </div>
                                        </div>
                                    );
                                }
                            )}

                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};

export default MyComplaints;