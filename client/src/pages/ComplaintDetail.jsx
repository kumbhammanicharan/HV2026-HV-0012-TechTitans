import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useHistory, useParams } from 'react-router-dom';

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

const getUpdatePhoto = (update) => {
    return getImageUrl(
        update?.photoUrl ||
            update?.imageUrl ||
            update?.photo ||
            update?.image
    );
};

const formatDate = (value) => {
    if (!value) {
        return '—';
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return '—';
    }

    return date.toLocaleString([], {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};

const formatStatus = (status) => {
    return String(status || 'pending')
        .replace(/-/g, ' ')
        .replace(/\b\w/g, (letter) =>
            letter.toUpperCase()
        );
};

const ComplaintDetail = () => {
    const { id } = useParams();
    const history = useHistory();

    const [complaint, setComplaint] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [previewImage, setPreviewImage] = useState('');

    useEffect(() => {
        const fetchComplaint = async () => {
            setLoading(true);
            setError('');

            try {
                const token =
                    localStorage.getItem('token');

                const response = await axios.get(
                    `${API_URL}/api/complaints/${id}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                const data =
                    response.data?.data ||
                    response.data?.complaint ||
                    response.data;

                setComplaint(data);
            } catch (err) {
                console.error(
                    'Complaint detail error:',
                    err
                );

                setError(
                    err.response?.data?.message ||
                        'Failed to load complaint details.'
                );
            } finally {
                setLoading(false);
            }
        };

        fetchComplaint();
    }, [id]);

    const status =
        complaint?.status || 'pending';

    const staffUpdates = useMemo(() => {
        if (!Array.isArray(complaint?.staffUpdates)) {
            return [];
        }

        return [...complaint.staffUpdates].sort(
            (a, b) =>
                new Date(
                    a.updatedAt ||
                        a.createdAt ||
                        0
                ) -
                new Date(
                    b.updatedAt ||
                        b.createdAt ||
                        0
                )
        );
    }, [complaint]);

    const beforeImage = getImageUrl(
        complaint?.imageUrl ||
            complaint?.evidenceImage ||
            complaint?.image
    );

    const afterImages = staffUpdates
        .map((update) => ({
            ...update,
            resolvedImage:
                getUpdatePhoto(update),
        }))
        .filter(
            (update) => update.resolvedImage
        );

    const latestAfterImage =
        afterImages.length > 0
            ? afterImages[
                  afterImages.length - 1
              ].resolvedImage
            : '';

    const hasAssignment =
        Boolean(complaint?.assignedTo);

    const hasStartedWork =
        status === 'in-progress' ||
        status === 'resolved' ||
        staffUpdates.length > 0;

    const isResolved =
        status === 'resolved';

    const timelineSteps = [
        {
            key: 'submitted',
            title: 'Complaint submitted',
            description:
                'Your complaint has been successfully registered.',
            done: true,
            date: complaint?.date,
            icon: '✓',
        },
        {
            key: 'assigned',
            title: 'Technician assigned',
            description: hasAssignment
                ? `Assigned to ${
                      complaint?.assignedTo?.name ||
                      complaint?.assignedTo?.email ||
                      'a technician'
                  }.`
                : 'Waiting for the administrator to assign a technician.',
            done: hasAssignment,
            active:
                !hasAssignment &&
                status === 'pending',
            date:
                complaint?.assignedAt ||
                complaint?.assignedTo?.assignedAt,
            icon: '👨‍🔧',
        },
        {
            key: 'progress',
            title: 'Work in progress',
            description: hasStartedWork
                ? 'The technician has started working on your complaint.'
                : 'Work will begin after technician assignment.',
            done: hasStartedWork,
            active:
                hasAssignment &&
                !hasStartedWork,
            date:
                staffUpdates.length > 0
                    ? staffUpdates[
                          staffUpdates.length - 1
                      ].updatedAt
                    : null,
            icon: '🔧',
        },
        {
            key: 'resolved',
            title: 'Complaint resolved',
            description: isResolved
                ? 'The technician has marked this complaint as resolved.'
                : 'The complaint will appear here once the work is completed.',
            done: isResolved,
            active:
                hasStartedWork &&
                !isResolved,
            date:
                complaint?.resolvedAt ||
                (isResolved
                    ? complaint?.updatedAt
                    : null),
            icon: '✓',
        },
    ];

    if (loading) {
        return (
            <div className="flex min-h-[70vh] items-center justify-center bg-slate-50 dark:bg-slate-950">
                <div className="text-center">
                    <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-indigo-600" />

                    <p className="mt-4 text-sm font-medium text-slate-500 dark:text-slate-400">
                        Loading complaint tracking...
                    </p>
                </div>
            </div>
        );
    }

    if (error || !complaint) {
        return (
            <div className="flex min-h-[70vh] items-center justify-center bg-slate-50 px-4 dark:bg-slate-950">
                <div className="max-w-md rounded-3xl border border-red-200 bg-white p-8 text-center shadow-sm dark:border-red-900/50 dark:bg-slate-900">
                    <div className="text-4xl">
                        ⚠️
                    </div>

                    <h2 className="mt-4 text-xl font-bold text-slate-900 dark:text-white">
                        Complaint not found
                    </h2>

                    <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                        {error ||
                            'The complaint could not be loaded.'}
                    </p>

                    <button
                        type="button"
                        onClick={() =>
                            history.push(
                                '/my-complaints'
                            )
                        }
                        className="mt-6 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white"
                    >
                        Back to My Complaints
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-[calc(100vh-72px)] bg-slate-50 px-4 py-8 dark:bg-slate-950 sm:px-6 lg:px-8">

            <div className="mx-auto max-w-6xl">

                <button
                    type="button"
                    onClick={() =>
                        history.push(
                            '/my-complaints'
                        )
                    }
                    className="mb-6 flex items-center gap-2 text-sm font-bold text-slate-500 transition hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400"
                >
                    ← Back to My Complaints
                </button>

                {/* Header */}
                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-8">

                    <div className="flex flex-col justify-between gap-5 md:flex-row md:items-start">

                        <div className="min-w-0">

                            <div className="flex flex-wrap items-center gap-2">

                                <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-black text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400">
                                    {complaint.category ||
                                        'Complaint'}
                                </span>

                                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black capitalize text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                                    {formatStatus(
                                        status
                                    )}
                                </span>

                            </div>

                            <h1 className="mt-4 text-2xl font-black text-slate-900 dark:text-white sm:text-3xl">
                                {complaint.title}
                            </h1>

                            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                                Complaint ID:{' '}
                                <span className="font-bold text-slate-700 dark:text-slate-300">
                                    #{String(
                                        complaint._id ||
                                            id
                                    ).slice(-8)}
                                </span>
                            </p>

                            <p className="mt-1 text-xs text-slate-400">
                                Submitted{' '}
                                {formatDate(
                                    complaint.date
                                )}
                            </p>

                        </div>

                        <div className="rounded-2xl bg-indigo-50 px-5 py-4 dark:bg-indigo-500/10">

                            <p className="text-xs font-black uppercase tracking-wider text-indigo-500">
                                Current Status
                            </p>

                            <p className="mt-1 text-lg font-black capitalize text-indigo-700 dark:text-indigo-300">
                                {formatStatus(
                                    status
                                )}
                            </p>

                        </div>

                    </div>

                </div>

                {/* Amazon / Flipkart style tracking */}
                <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-8">

                    <div className="flex items-center justify-between">

                        <div>
                            <p className="text-xs font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                                Live Tracking
                            </p>

                            <h2 className="mt-1 text-xl font-black text-slate-900 dark:text-white">
                                Complaint progress
                            </h2>
                        </div>

                        {isResolved && (
                            <div className="hidden rounded-full bg-emerald-100 px-4 py-2 text-sm font-black text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 sm:block">
                                ✓ Resolved
                            </div>
                        )}

                    </div>

                    <div className="relative mt-8">

                        {/* Desktop connecting line */}
                        <div className="absolute left-[23px] top-7 hidden h-[calc(100%-55px)] w-1 bg-slate-200 dark:bg-slate-800 sm:block" />

                        <div className="space-y-8">

                            {timelineSteps.map(
                                (step, index) => (
                                    <div
                                        key={
                                            step.key
                                        }
                                        className="relative flex gap-4"
                                    >

                                        <div
                                            className={`relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-lg shadow-sm ${
                                                step.done
                                                    ? 'bg-indigo-600 text-white'
                                                    : step.active
                                                    ? 'bg-indigo-100 text-indigo-700 ring-4 ring-indigo-50 dark:bg-indigo-500/20 dark:text-indigo-300 dark:ring-indigo-500/10'
                                                    : 'bg-slate-100 text-slate-400 dark:bg-slate-800'
                                            }`}
                                        >
                                            {step.done
                                                ? '✓'
                                                : step.icon}
                                        </div>

                                        <div className="flex-1 pb-1">

                                            <div className="flex flex-col justify-between gap-1 sm:flex-row">

                                                <h3
                                                    className={`font-black ${
                                                        step.done ||
                                                        step.active
                                                            ? 'text-slate-900 dark:text-white'
                                                            : 'text-slate-400'
                                                    }`}
                                                >
                                                    {
                                                        step.title
                                                    }
                                                </h3>

                                                {step.date && (
                                                    <span className="text-xs text-slate-400">
                                                        {formatDate(
                                                            step.date
                                                        )}
                                                    </span>
                                                )}

                                            </div>

                                            <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">
                                                {
                                                    step.description
                                                }
                                            </p>

                                            {step.key ===
                                                'progress' &&
                                                staffUpdates.length >
                                                    0 && (
                                                    <div className="mt-3 rounded-xl bg-slate-50 p-3 dark:bg-slate-800/60">
                                                        <p className="text-xs font-bold text-slate-400">
                                                            {
                                                                staffUpdates.length
                                                            } technician update
                                                            {staffUpdates.length >
                                                            1
                                                                ? 's'
                                                                : ''}
                                                        </p>
                                                    </div>
                                                )}

                                        </div>

                                    </div>
                                )
                            )}

                        </div>
                    </div>
                </div>

                <div className="mt-6 grid gap-6 lg:grid-cols-3">

                    {/* Main */}
                    <div className="space-y-6 lg:col-span-2">

                        {/* Complaint */}
                        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">

                            <h2 className="text-xl font-black text-slate-900 dark:text-white">
                                Complaint Details
                            </h2>

                            <div className="mt-5 rounded-2xl bg-slate-50 p-5 leading-7 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                                {complaint.description}
                            </div>

                        </div>

                        {/* Before / After */}
                        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-8">

                            <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">

                                <div>
                                    <p className="text-xs font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                                        Evidence Gallery
                                    </p>

                                    <h2 className="mt-1 text-xl font-black text-slate-900 dark:text-white">
                                        Before & After
                                    </h2>
                                </div>

                                {isResolved && (
                                    <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                                        ✓ Work completed
                                    </span>
                                )}

                            </div>

                            <div className="mt-6 grid gap-6 md:grid-cols-2">

                                {/* Before */}
                                <div>

                                    <div className="mb-3 flex items-center justify-between">
                                        <h3 className="font-black text-slate-900 dark:text-white">
                                            Before
                                        </h3>

                                        <span className="rounded-full bg-amber-100 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-amber-700 dark:bg-amber-500/10 dark:text-amber-400">
                                            Student Evidence
                                        </span>
                                    </div>

                                    {beforeImage ? (
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setPreviewImage(
                                                    beforeImage
                                                )
                                            }
                                            className="group relative block w-full overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 dark:border-slate-700 dark:bg-slate-800"
                                        >
                                            <img
                                                src={
                                                    beforeImage
                                                }
                                                alt="Before complaint"
                                                className="h-72 w-full object-cover transition duration-300 group-hover:scale-105"
                                                onError={(e) => {
                                                    e.currentTarget.style.display =
                                                        'none';
                                                }}
                                            />

                                            <div className="absolute inset-0 flex items-end bg-gradient-to-t from-slate-950/60 via-transparent to-transparent p-4 opacity-0 transition group-hover:opacity-100">
                                                <span className="text-sm font-bold text-white">
                                                    Click to view
                                                    full image
                                                </span>
                                            </div>
                                        </button>
                                    ) : (
                                        <div className="flex h-72 items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800">
                                            <div className="text-center">
                                                <div className="text-4xl">
                                                    📷
                                                </div>

                                                <p className="mt-2 text-sm font-bold text-slate-500">
                                                    No before image
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                </div>

                                {/* After */}
                                <div>

                                    <div className="mb-3 flex items-center justify-between">
                                        <h3 className="font-black text-slate-900 dark:text-white">
                                            After
                                        </h3>

                                        <span className="rounded-full bg-emerald-100 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
                                            Technician Evidence
                                        </span>
                                    </div>

                                    {latestAfterImage ? (
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setPreviewImage(
                                                    latestAfterImage
                                                )
                                            }
                                            className="group relative block w-full overflow-hidden rounded-2xl border border-emerald-200 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950/20"
                                        >
                                            <img
                                                src={
                                                    latestAfterImage
                                                }
                                                alt="After technician work"
                                                className="h-72 w-full object-cover transition duration-300 group-hover:scale-105"
                                                onError={(e) => {
                                                    e.currentTarget.style.display =
                                                        'none';
                                                }}
                                            />

                                            <div className="absolute inset-0 flex items-end bg-gradient-to-t from-slate-950/60 via-transparent to-transparent p-4 opacity-0 transition group-hover:opacity-100">
                                                <span className="text-sm font-bold text-white">
                                                    Click to view
                                                    full image
                                                </span>
                                            </div>
                                        </button>
                                    ) : (
                                        <div className="flex h-72 items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800">
                                            <div className="text-center">
                                                <div className="text-4xl">
                                                    🔧
                                                </div>

                                                <p className="mt-2 text-sm font-bold text-slate-500">
                                                    Technician photo
                                                    will appear here
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                </div>

                            </div>

                            {/* All technician photos */}
                            {afterImages.length > 1 && (
                                <div className="mt-8">

                                    <h3 className="font-black text-slate-900 dark:text-white">
                                        Technician Progress Photos
                                    </h3>

                                    <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">

                                        {afterImages.map(
                                            (
                                                update,
                                                index
                                            ) => (
                                                <button
                                                    type="button"
                                                    key={
                                                        `${update.updatedAt || index}-${index}`
                                                    }
                                                    onClick={() =>
                                                        setPreviewImage(
                                                            update.resolvedImage
                                                        )
                                                    }
                                                    className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700"
                                                >
                                                    <img
                                                        src={
                                                            update.resolvedImage
                                                        }
                                                        alt={`Technician update ${
                                                            index +
                                                            1
                                                        }`}
                                                        className="h-32 w-full object-cover transition hover:scale-105"
                                                    />
                                                </button>
                                            )
                                        )}

                                    </div>

                                </div>
                            )}

                        </div>

                        {/* Technician Updates */}
                        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">

                            <div className="flex items-center justify-between">

                                <div>
                                    <p className="text-xs font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                                        Activity
                                    </p>

                                    <h2 className="mt-1 text-xl font-black text-slate-900 dark:text-white">
                                        Technician Updates
                                    </h2>
                                </div>

                                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                                    {staffUpdates.length}
                                </span>

                            </div>

                            {staffUpdates.length === 0 ? (
                                <div className="mt-5 rounded-2xl bg-slate-50 p-6 text-center dark:bg-slate-800/50">

                                    <div className="text-3xl">
                                        🕐
                                    </div>

                                    <p className="mt-2 text-sm font-bold text-slate-600 dark:text-slate-300">
                                        No technician updates yet
                                    </p>

                                    <p className="mt-1 text-xs text-slate-400">
                                        Updates will appear here once work begins.
                                    </p>

                                </div>
                            ) : (
                                <div className="mt-6 space-y-5">

                                    {staffUpdates.map(
                                        (
                                            update,
                                            index
                                        ) => {

                                            const updateImage =
                                                getUpdatePhoto(
                                                    update
                                                );

                                            return (
                                                <div
                                                    key={
                                                        index
                                                    }
                                                    className="relative rounded-2xl border border-slate-200 p-5 dark:border-slate-800"
                                                >

                                                    <div className="flex gap-4">

                                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm dark:bg-indigo-500/10">
                                                            🔧
                                                        </div>

                                                        <div className="min-w-0 flex-1">

                                                            <div className="flex flex-col justify-between gap-1 sm:flex-row">
                                                                <h3 className="font-black text-slate-900 dark:text-white">
                                                                    Technician update
                                                                </h3>

                                                                <span className="text-xs text-slate-400">
                                                                    {formatDate(
                                                                        update.updatedAt ||
                                                                            update.createdAt
                                                                    )}
                                                                </span>
                                                            </div>

                                                            {update.remarks && (
                                                                <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
                                                                    {
                                                                        update.remarks
                                                                    }
                                                                </p>
                                                            )}

                                                            {updateImage && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        setPreviewImage(
                                                                            updateImage
                                                                        )
                                                                    }
                                                                    className="mt-4 block overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700"
                                                                >
                                                                    <img
                                                                        src={
                                                                            updateImage
                                                                        }
                                                                        alt="Technician update"
                                                                        className="max-h-72 w-full object-cover"
                                                                    />
                                                                </button>
                                                            )}

                                                        </div>

                                                    </div>

                                                </div>
                                            );
                                        }
                                    )}

                                </div>
                            )}

                        </div>

                        {/* Resolution */}
                        {complaint.resolutionNotes && (
                            <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-6 dark:border-emerald-900/50 dark:bg-emerald-950/20">

                                <div className="flex gap-4">

                                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-xl text-white">
                                        ✓
                                    </div>

                                    <div>
                                        <h2 className="text-lg font-black text-emerald-800 dark:text-emerald-300">
                                            Resolution Notes
                                        </h2>

                                        <p className="mt-2 leading-7 text-emerald-700 dark:text-emerald-400">
                                            {
                                                complaint.resolutionNotes
                                            }
                                        </p>
                                    </div>

                                </div>

                            </div>
                        )}

                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">

                        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">

                            <h2 className="font-black text-slate-900 dark:text-white">
                                Complaint Information
                            </h2>

                            <div className="mt-5 space-y-5">

                                <div>
                                    <p className="text-xs font-black uppercase tracking-wider text-slate-400">
                                        Category
                                    </p>

                                    <p className="mt-1 font-bold text-slate-700 dark:text-slate-300">
                                        {complaint.category ||
                                            '—'}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs font-black uppercase tracking-wider text-slate-400">
                                        Status
                                    </p>

                                    <p className="mt-1 font-bold capitalize text-slate-700 dark:text-slate-300">
                                        {formatStatus(
                                            status
                                        )}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs font-black uppercase tracking-wider text-slate-400">
                                        Technician
                                    </p>

                                    <p className="mt-1 font-bold text-slate-700 dark:text-slate-300">
                                        {complaint
                                            .assignedTo
                                            ?.name ||
                                            complaint
                                                .assignedTo
                                                ?.email ||
                                            'Not assigned yet'}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs font-black uppercase tracking-wider text-slate-400">
                                        Submitted
                                    </p>

                                    <p className="mt-1 font-bold text-slate-700 dark:text-slate-300">
                                        {formatDate(
                                            complaint.date
                                        )}
                                    </p>
                                </div>

                                {complaint.dueInDays !==
                                    undefined && (
                                    <div>
                                        <p className="text-xs font-black uppercase tracking-wider text-slate-400">
                                            Expected Resolution
                                        </p>

                                        <p className="mt-1 font-bold text-slate-700 dark:text-slate-300">
                                            {
                                                complaint.dueInDays
                                            }{' '}
                                            day(s)
                                        </p>
                                    </div>
                                )}

                            </div>

                        </div>

                        <div className="rounded-3xl border border-indigo-100 bg-indigo-50 p-6 dark:border-indigo-500/20 dark:bg-indigo-500/10">

                            <div className="text-3xl">
                                📦
                            </div>

                            <h2 className="mt-4 font-black text-slate-900 dark:text-white">
                                Track your complaint
                            </h2>

                            <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
                                Just like tracking an online
                                order, every important step of
                                your complaint is shown here.
                            </p>

                            <div className="mt-5 space-y-3 text-sm text-slate-600 dark:text-slate-400">
                                <p>✓ Submission confirmed</p>
                                <p>✓ Technician assignment</p>
                                <p>✓ Work progress</p>
                                <p>✓ Resolution confirmation</p>
                            </div>

                        </div>

                    </div>

                </div>

            </div>

            {/* Image Lightbox */}
            {previewImage && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/90 p-4 backdrop-blur-sm"
                    onClick={() =>
                        setPreviewImage('')
                    }
                >

                    <button
                        type="button"
                        onClick={() =>
                            setPreviewImage('')
                        }
                        className="absolute right-5 top-5 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-2xl text-white hover:bg-white/20"
                    >
                        ×
                    </button>

                    <img
                        src={previewImage}
                        alt="Complaint evidence preview"
                        className="max-h-[90vh] max-w-[95vw] rounded-2xl object-contain shadow-2xl"
                        onClick={(e) =>
                            e.stopPropagation()
                        }
                    />

                </div>
            )}

        </div>
    );
};

export default ComplaintDetail;