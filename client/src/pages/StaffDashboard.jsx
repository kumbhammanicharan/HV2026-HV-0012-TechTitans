import React, {
    useEffect,
    useMemo,
    useState
} from 'react';
import axios from 'axios';

const API_URL =
    'https://campuscare-backend-jq45.onrender.com';

const statusStyles = {
    pending:
        'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',

    'in-progress':
        'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400',

    resolved:
        'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400'
};

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

const getUpdatePhoto = (update) => {
    return getImageUrl(
        update?.photoUrl ||
            update?.imageUrl ||
            update?.photo ||
            update?.image
    );
};

const StaffDashboard = () => {
    const [complaints, setComplaints] =
        useState([]);

    const [
        selectedComplaint,
        setSelectedComplaint
    ] = useState(null);

    const [remarks, setRemarks] =
        useState('');

    const [
        resolutionNotes,
        setResolutionNotes
    ] = useState('');

    const [status, setStatus] =
        useState('in-progress');

    const [photo, setPhoto] =
        useState(null);

    const [photoPreview, setPhotoPreview] =
        useState('');

    const [filter, setFilter] =
        useState('all');

    const [searchTerm, setSearchTerm] =
        useState('');

    const [sortBy, setSortBy] =
        useState('date');

    const [stats, setStats] =
        useState({
            total: 0,
            pending: 0,
            inProgress: 0,
            resolved: 0
        });

    const [userInfo, setUserInfo] =
        useState(null);

    const [loading, setLoading] =
        useState(true);

    const [saving, setSaving] =
        useState(false);

    const [error, setError] =
        useState('');

    const [success, setSuccess] =
        useState('');

    const token =
        localStorage.getItem('token');

    const authHeaders = {
        Authorization: `Bearer ${token}`
    };

    const fetchAssignedComplaints =
        async () => {
            try {
                const response =
                    await axios.get(
                        `${API_URL}/api/complaints/assigned`,
                        {
                            headers:
                                authHeaders
                        }
                    );

                const data =
                    Array.isArray(
                        response.data
                    )
                        ? response.data
                        : [];

                setComplaints(data);
                calculateStats(data);

            } catch (err) {
                console.error(
                    'Assigned complaints error:',
                    err
                );

                setError(
                    err.response?.data
                        ?.message ||
                        'Failed to fetch assigned complaints.'
                );
            }
        };

    const fetchProfile = async () => {
        try {
            const response =
                await axios.get(
                    `${API_URL}/api/auth/profile`,
                    {
                        headers:
                            authHeaders
                    }
                );

            setUserInfo(
                response.data
            );
        } catch (err) {
            console.error(
                'Profile error:',
                err
            );
        }
    };

    const calculateStats = (
        data
    ) => {
        setStats({
            total: data.length,

            pending: data.filter(
                (c) =>
                    c.status ===
                    'pending'
            ).length,

            inProgress:
                data.filter(
                    (c) =>
                        c.status ===
                        'in-progress'
                ).length,

            resolved:
                data.filter(
                    (c) =>
                        c.status ===
                        'resolved'
                ).length
        });
    };

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            setError('');

            await Promise.all([
                fetchAssignedComplaints(),
                fetchProfile()
            ]);

            setLoading(false);
        };

        load();
    }, []);

    const refreshDashboard =
        async () => {
            setError('');
            setSuccess('');

            await fetchAssignedComplaints();

            setSuccess(
                'Dashboard refreshed successfully.'
            );

            setTimeout(() => {
                setSuccess('');
            }, 2500);
        };

    const clearPhoto = () => {
        setPhoto(null);
        setPhotoPreview('');
    };

    const handlePhotoChange = (
        e
    ) => {
        const file =
            e.target.files?.[0] ||
            null;

        setError('');

        if (!file) {
            clearPhoto();
            return;
        }

        if (
            !file.type.startsWith(
                'image/'
            )
        ) {
            setError(
                'Please select a valid image file.'
            );

            e.target.value = '';
            clearPhoto();
            return;
        }

        if (
            file.size >
            5 * 1024 * 1024
        ) {
            setError(
                'Progress photo must be less than 5 MB.'
            );

            e.target.value = '';
            clearPhoto();
            return;
        }

        setPhoto(file);

        setPhotoPreview(
            URL.createObjectURL(file)
        );
    };

    const handleSelect = (
        complaint
    ) => {
        setSelectedComplaint(
            complaint
        );

        setRemarks('');

        setResolutionNotes(
            complaint.resolutionNotes ||
                ''
        );

        setStatus(
            complaint.status ===
                'pending'
                ? 'in-progress'
                : complaint.status
        );

        clearPhoto();

        setError('');
    };

    const handleUpdate = async (
        e
    ) => {
        e.preventDefault();

        if (!selectedComplaint) {
            return;
        }

        if (
            !remarks.trim() &&
            !photo &&
            !resolutionNotes.trim()
        ) {
            setError(
                'Please add remarks, a photo, or resolution notes.'
            );
            return;
        }

        try {
            setSaving(true);
            setError('');
            setSuccess('');

            const formData =
                new FormData();

            formData.append(
                'remarks',
                remarks.trim()
            );

            formData.append(
                'status',
                status
            );

            formData.append(
                'resolutionNotes',
                resolutionNotes.trim()
            );

            if (photo) {
                formData.append(
                    'photo',
                    photo
                );
            }

            const response =
                await axios.post(
                    `${API_URL}/api/complaints/${selectedComplaint._id}/staff-update`,
                    formData,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

            console.log(
                'Staff update response:',
                response.data
            );

            setSelectedComplaint(
                null
            );

            setRemarks('');
            setResolutionNotes('');
            clearPhoto();

            setSuccess(
                'Complaint updated successfully.'
            );

            await fetchAssignedComplaints();

        } catch (err) {
            console.error(
                'Staff update error:',
                err
            );

            setError(
                err.response?.data?.message ||
                    'Failed to update complaint.'
            );
        } finally {
            setSaving(false);
        }
    };

    const filteredComplaints =
        useMemo(() => {
            const search =
                searchTerm
                    .trim()
                    .toLowerCase();

            return complaints
                .filter(
                    (complaint) => {
                        const matchesFilter =
                            filter ===
                                'all' ||
                            complaint.status ===
                                filter;

                        const searchableText =
                            [
                                complaint.title,
                                complaint.category,
                                complaint.description,
                                complaint
                                    .raisedBy
                                    ?.name,
                                complaint
                                    .raisedBy
                                    ?.email
                            ]
                                .filter(
                                    Boolean
                                )
                                .join(
                                    ' '
                                )
                                .toLowerCase();

                        const matchesSearch =
                            !search ||
                            searchableText.includes(
                                search
                            );

                        return (
                            matchesFilter &&
                            matchesSearch
                        );
                    }
                )
                .sort(
                    (a, b) => {
                        if (
                            sortBy ===
                            'title'
                        ) {
                            return (
                                a.title ||
                                ''
                            ).localeCompare(
                                b.title ||
                                    ''
                            );
                        }

                        if (
                            sortBy ===
                            'priority'
                        ) {
                            return (
                                Number(
                                    a.dueInDays ||
                                        3
                                ) -
                                Number(
                                    b.dueInDays ||
                                        3
                                )
                            );
                        }

                        return (
                            new Date(
                                b.date ||
                                    0
                            ) -
                            new Date(
                                a.date ||
                                    0
                            )
                        );
                    }
                );
        }, [
            complaints,
            filter,
            searchTerm,
            sortBy
        ]);

    if (loading) {
        return (
            <div className="flex min-h-[70vh] items-center justify-center bg-slate-50 dark:bg-slate-950">
                <div className="text-center">

                    <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-indigo-600" />

                    <p className="mt-4 text-sm font-medium text-slate-500 dark:text-slate-400">
                        Loading technician dashboard...
                    </p>

                </div>
            </div>
        );
    }

    return (
        <div className="min-h-[calc(100vh-72px)] bg-slate-50 px-4 py-8 dark:bg-slate-950 sm:px-6 lg:px-8">

            <div className="mx-auto max-w-7xl">

                <div className="mb-8 flex flex-col justify-between gap-5 lg:flex-row lg:items-center">

                    <div>

                        <p className="text-sm font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                            Technician Workspace
                        </p>

                        <h1 className="mt-1 text-3xl font-black text-slate-900 dark:text-white">
                            My Assigned Complaints
                        </h1>

                        {userInfo && (
                            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                                Welcome back,{' '}
                                <strong className="text-slate-700 dark:text-slate-200">
                                    {
                                        userInfo.name
                                    }
                                </strong>

                                {userInfo.department && (
                                    <>
                                        {' '}
                                        •{' '}
                                        {
                                            userInfo.department
                                        }
                                    </>
                                )}
                            </p>
                        )}

                    </div>

                    <button
                        type="button"
                        onClick={
                            refreshDashboard
                        }
                        className="secondary-button"
                    >
                        ↻ Refresh
                    </button>

                </div>

                {error && (
                    <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
                        ⚠️ {error}
                    </div>
                )}

                {success && (
                    <div className="mb-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-medium text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-300">
                        ✓ {success}
                    </div>
                )}

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

                    <div className="modern-card p-5">
                        <p className="text-sm text-slate-500">
                            Total Assigned
                        </p>

                        <p className="mt-2 text-3xl font-black text-slate-900 dark:text-white">
                            {stats.total}
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                            Complaints assigned to you
                        </p>
                    </div>

                    <div className="modern-card p-5">
                        <p className="text-sm text-slate-500">
                            Pending
                        </p>

                        <p className="mt-2 text-3xl font-black text-slate-900 dark:text-white">
                            {stats.pending}
                        </p>
                    </div>

                    <div className="modern-card p-5">
                        <p className="text-sm text-slate-500">
                            In Progress
                        </p>

                        <p className="mt-2 text-3xl font-black text-slate-900 dark:text-white">
                            {stats.inProgress}
                        </p>
                    </div>

                    <div className="modern-card p-5">
                        <p className="text-sm text-slate-500">
                            Resolved
                        </p>

                        <p className="mt-2 text-3xl font-black text-slate-900 dark:text-white">
                            {stats.resolved}
                        </p>
                    </div>

                </div>

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

                                <option value="priority">
                                    Urgency
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
                                value={
                                    searchTerm
                                }
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

                    {filteredComplaints.length ===
                    0 ? (
                        <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center dark:border-slate-700 dark:bg-slate-900">

                            <div className="text-5xl">
                                📭
                            </div>

                            <h2 className="mt-5 text-xl font-bold text-slate-900 dark:text-white">
                                No assigned complaints
                            </h2>

                            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                                New complaints assigned by an administrator will appear here.
                            </p>

                        </div>
                    ) : (
                        <div className="grid gap-5 lg:grid-cols-2">

                            {filteredComplaints.map(
                                (
                                    complaint
                                ) => {

                                    const beforeImage =
                                        getImageUrl(
                                            complaint.imageUrl
                                        );

                                    const updates =
                                        Array.isArray(
                                            complaint.staffUpdates
                                        )
                                            ? complaint.staffUpdates
                                            : [];

                                    const latestAfter =
                                        [...updates]
                                            .reverse()
                                            .map(
                                                getUpdatePhoto
                                            )
                                            .find(
                                                Boolean
                                            );

                                    return (
                                        <div
                                            key={
                                                complaint._id
                                            }
                                            className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900"
                                        >

                                            <div className="p-6">

                                                <div className="flex items-start justify-between gap-4">

                                                    <div className="min-w-0">

                                                        <span
                                                            className={`rounded-full px-3 py-1 text-xs font-bold capitalize ${
                                                                statusStyles[
                                                                    complaint.status
                                                                ] ||
                                                                statusStyles.pending
                                                            }`}
                                                        >
                                                            {(
                                                                complaint.status ||
                                                                'pending'
                                                            ).replace(
                                                                '-',
                                                                ' '
                                                            )}
                                                        </span>

                                                        <h2 className="mt-3 text-xl font-black text-slate-900 dark:text-white">
                                                            {
                                                                complaint.title
                                                            }
                                                        </h2>

                                                    </div>

                                                    <span className="shrink-0 rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400">
                                                        {
                                                            complaint.category
                                                        }
                                                    </span>

                                                </div>

                                                <p className="mt-4 text-sm leading-6 text-slate-600 dark:text-slate-300">
                                                    {
                                                        complaint.description
                                                    }
                                                </p>

                                                <div className="mt-5 grid gap-2 text-xs text-slate-500 dark:text-slate-400">

                                                    <p>
                                                        👤{' '}
                                                        <strong>
                                                            Raised by:
                                                        </strong>{' '}
                                                        {complaint
                                                            .raisedBy
                                                            ?.name ||
                                                            complaint
                                                                .raisedBy
                                                                ?.email ||
                                                            'Unknown'}
                                                    </p>

                                                    <p>
                                                        📅{' '}
                                                        <strong>
                                                            Submitted:
                                                        </strong>{' '}
                                                        {complaint.date
                                                            ? new Date(
                                                                  complaint.date
                                                              ).toLocaleString()
                                                            : '—'}
                                                    </p>

                                                    <p>
                                                        ⏱️{' '}
                                                        <strong>
                                                            Due:
                                                        </strong>{' '}
                                                        {
                                                            complaint.dueInDays
                                                        }{' '}
                                                        day(s)
                                                    </p>

                                                </div>

                                                {(beforeImage ||
                                                    latestAfter) && (
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
                                                                    alt="Complaint evidence"
                                                                    className="h-36 w-full rounded-xl object-cover"
                                                                />
                                                            ) : (
                                                                <div className="flex h-36 items-center justify-center rounded-xl bg-slate-100 text-xs text-slate-400 dark:bg-slate-800">
                                                                    No image
                                                                </div>
                                                            )}
                                                        </div>

                                                        <div>
                                                            <p className="mb-2 text-[10px] font-black uppercase tracking-wider text-emerald-600">
                                                                After
                                                            </p>

                                                            {latestAfter ? (
                                                                <img
                                                                    src={
                                                                        latestAfter
                                                                    }
                                                                    alt="Technician progress"
                                                                    className="h-36 w-full rounded-xl object-cover"
                                                                />
                                                            ) : (
                                                                <div className="flex h-36 items-center justify-center rounded-xl bg-slate-100 text-xs text-slate-400 dark:bg-slate-800">
                                                                    Not uploaded
                                                                </div>
                                                            )}
                                                        </div>

                                                    </div>
                                                )}

                                                {updates.length >
                                                    0 && (
                                                    <div className="mt-5 rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/50">

                                                        <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                                            Progress
                                                        </p>

                                                        <p className="mt-1 text-sm font-semibold text-slate-700 dark:text-slate-200">
                                                            {
                                                                updates.length
                                                            }{' '}
                                                            update(s)
                                                        </p>

                                                    </div>
                                                )}

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleSelect(
                                                            complaint
                                                        )
                                                    }
                                                    className="primary-button mt-5 w-full"
                                                >
                                                    🛠️ Update Complaint
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

            {selectedComplaint && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">

                    <div className="max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-3xl bg-white shadow-2xl dark:bg-slate-900">

                        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-5 dark:border-slate-800 dark:bg-slate-900">

                            <div>
                                <p className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                                    Complaint Update
                                </p>

                                <h2 className="mt-1 text-xl font-black text-slate-900 dark:text-white">
                                    {
                                        selectedComplaint.title
                                    }
                                </h2>
                            </div>

                            <button
                                type="button"
                                onClick={() =>
                                    setSelectedComplaint(
                                        null
                                    )
                                }
                                className="rounded-xl px-3 py-2 text-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                            >
                                ×
                            </button>

                        </div>

                        <form
                            onSubmit={
                                handleUpdate
                            }
                            className="p-6"
                        >

                            <div className="grid gap-6 lg:grid-cols-2">

                                <div>

                                    <h3 className="font-bold text-slate-900 dark:text-white">
                                        Complaint Details
                                    </h3>

                                    <div className="mt-4 rounded-2xl bg-slate-50 p-5 dark:bg-slate-800/50">

                                        <p className="text-sm text-slate-600 dark:text-slate-300">
                                            <strong>
                                                Category:
                                            </strong>{' '}
                                            {
                                                selectedComplaint.category
                                            }
                                        </p>

                                        <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
                                            <strong>
                                                Student:
                                            </strong>{' '}
                                            {selectedComplaint
                                                .raisedBy
                                                ?.name ||
                                                selectedComplaint
                                                    .raisedBy
                                                    ?.email ||
                                                'Unknown'}
                                        </p>

                                        <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
                                            <strong>
                                                Status:
                                            </strong>{' '}
                                            {
                                                selectedComplaint.status
                                            }
                                        </p>

                                        <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
                                            {
                                                selectedComplaint.description
                                            }
                                        </p>

                                    </div>

                                    {selectedComplaint.imageUrl && (
                                        <div className="mt-5">

                                            <p className="mb-2 text-sm font-bold text-slate-900 dark:text-white">
                                                Before / Student Evidence
                                            </p>

                                            <img
                                                src={getImageUrl(
                                                    selectedComplaint.imageUrl
                                                )}
                                                alt="Complaint evidence"
                                                className="max-h-64 w-full rounded-2xl object-contain bg-slate-100 dark:bg-slate-800"
                                            />

                                        </div>
                                    )}

                                    {selectedComplaint.staffUpdates?.length >
                                        0 && (
                                        <div className="mt-5">

                                            <p className="mb-3 text-sm font-bold text-slate-900 dark:text-white">
                                                Previous Technician Photos
                                            </p>

                                            <div className="grid grid-cols-2 gap-3">

                                                {selectedComplaint.staffUpdates
                                                    .map(
                                                        (
                                                            update,
                                                            index
                                                        ) => {
                                                            const updateImage =
                                                                getUpdatePhoto(
                                                                    update
                                                                );

                                                            if (
                                                                !updateImage
                                                            ) {
                                                                return null;
                                                            }

                                                            return (
                                                                <div
                                                                    key={
                                                                        index
                                                                    }
                                                                >
                                                                    <img
                                                                        src={
                                                                            updateImage
                                                                        }
                                                                        alt="Technician update"
                                                                        className="h-36 w-full rounded-xl object-cover"
                                                                    />

                                                                    <p className="mt-1 text-[10px] text-slate-400">
                                                                        Update{' '}
                                                                        {index +
                                                                            1}
                                                                    </p>
                                                                </div>
                                                            );
                                                        }
                                                    )}

                                            </div>

                                        </div>
                                    )}

                                </div>

                                <div>

                                    <label className="mb-2 block text-sm font-bold text-slate-900 dark:text-white">
                                        Update Status
                                    </label>

                                    <select
                                        value={
                                            status
                                        }
                                        onChange={(e) =>
                                            setStatus(
                                                e.target.value
                                            )
                                        }
                                        className="select-field"
                                    >
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

                                    <label className="mb-2 mt-5 block text-sm font-bold text-slate-900 dark:text-white">
                                        Progress Remarks
                                    </label>

                                    <textarea
                                        value={
                                            remarks
                                        }
                                        onChange={(
                                            e
                                        ) =>
                                            setRemarks(
                                                e.target.value
                                            )
                                        }
                                        rows="5"
                                        placeholder="Describe what work was completed..."
                                        className="input-field resize-none"
                                    />

                                    <label className="mb-2 mt-5 block text-sm font-bold text-slate-900 dark:text-white">
                                        Resolution Notes
                                    </label>

                                    <textarea
                                        value={
                                            resolutionNotes
                                        }
                                        onChange={(
                                            e
                                        ) =>
                                            setResolutionNotes(
                                                e.target.value
                                            )
                                        }
                                        rows="3"
                                        placeholder="Add resolution details..."
                                        className="input-field resize-none"
                                    />

                                    <label className="mb-2 mt-5 block text-sm font-bold text-slate-900 dark:text-white">
                                        After / Progress Photo
                                    </label>

                                    {!photoPreview ? (
                                        <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 px-5 py-8 text-center transition hover:border-indigo-400 hover:bg-indigo-50/50 dark:border-slate-700 dark:bg-slate-800/50">

                                            <div className="text-3xl">
                                                📷
                                            </div>

                                            <p className="mt-2 text-sm font-bold text-slate-700 dark:text-slate-300">
                                                Upload work/progress photo
                                            </p>

                                            <p className="mt-1 text-xs text-slate-400">
                                                PNG, JPG or JPEG • Max 5 MB
                                            </p>

                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={
                                                    handlePhotoChange
                                                }
                                                className="hidden"
                                            />

                                        </label>
                                    ) : (
                                        <div className="overflow-hidden rounded-2xl border border-emerald-200 dark:border-emerald-900">

                                            <img
                                                src={
                                                    photoPreview
                                                }
                                                alt="Technician photo preview"
                                                className="max-h-72 w-full object-contain bg-slate-100 dark:bg-slate-800"
                                            />

                                            <div className="flex items-center justify-between bg-white px-4 py-3 dark:bg-slate-900">

                                                <div>
                                                    <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                                                        After Photo
                                                    </p>

                                                    <p className="text-xs text-slate-400">
                                                        {
                                                            photo?.name
                                                        }
                                                    </p>
                                                </div>

                                                <button
                                                    type="button"
                                                    onClick={
                                                        clearPhoto
                                                    }
                                                    className="text-sm font-bold text-red-600 hover:text-red-700"
                                                >
                                                    Remove
                                                </button>

                                            </div>

                                        </div>
                                    )}

                                </div>

                            </div>

                            {selectedComplaint.staffUpdates?.length >
                                0 && (
                                <div className="mt-8">

                                    <h3 className="font-bold text-slate-900 dark:text-white">
                                        Previous Technician Updates
                                    </h3>

                                    <div className="mt-4 space-y-3">

                                        {selectedComplaint.staffUpdates.map(
                                            (
                                                update,
                                                index
                                            ) => (
                                                <div
                                                    key={
                                                        index
                                                    }
                                                    className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800"
                                                >

                                                    <p className="text-xs text-slate-400">
                                                        {update.updatedAt
                                                            ? new Date(
                                                                  update.updatedAt
                                                              ).toLocaleString()
                                                            : ''}
                                                    </p>

                                                    {update.remarks && (
                                                        <p className="mt-2 text-sm text-slate-700 dark:text-slate-300">
                                                            {
                                                                update.remarks
                                                            }
                                                        </p>
                                                    )}

                                                    {getUpdatePhoto(
                                                        update
                                                    ) && (
                                                        <img
                                                            src={getUpdatePhoto(
                                                                update
                                                            )}
                                                            alt="Technician progress"
                                                            className="mt-3 h-40 w-full rounded-xl object-cover"
                                                        />
                                                    )}

                                                </div>
                                            )
                                        )}

                                    </div>

                                </div>
                            )}

                            <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">

                                <button
                                    type="button"
                                    onClick={() =>
                                        setSelectedComplaint(
                                            null
                                        )
                                    }
                                    className="secondary-button"
                                    disabled={
                                        saving
                                    }
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="primary-button"
                                    disabled={
                                        saving
                                    }
                                >
                                    {saving
                                        ? 'Saving...'
                                        : 'Save Update'}
                                </button>

                            </div>

                        </form>

                    </div>

                </div>
            )}

        </div>
    );
};

export default StaffDashboard;