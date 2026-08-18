import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useHistory, useParams } from 'react-router-dom';

const ComplaintDetail = () => {
    const { id } = useParams();
    const history = useHistory();

    const [complaint, setComplaint] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchComplaint = async () => {
            setLoading(true);
            setError('');

            try {
                const token =
                    localStorage.getItem('token');

                const response = await axios.get(
                    `/api/complaints/${id}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                setComplaint(response.data);
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

                    <p className="mt-4 text-sm font-medium text-slate-500">
                        Loading complaint...
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

    const status =
        complaint.status || 'pending';

    return (
        <div className="min-h-[calc(100vh-72px)] bg-slate-50 px-4 py-10 dark:bg-slate-950 sm:px-6">
            <div className="mx-auto max-w-5xl">

                <button
                    type="button"
                    onClick={() =>
                        history.push(
                            '/my-complaints'
                        )
                    }
                    className="mb-6 text-sm font-semibold text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400"
                >
                    ← Back to My Complaints
                </button>

                <div className="rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">

                    {/* Header */}
                    <div className="border-b border-slate-200 p-6 dark:border-slate-800 sm:p-8">
                        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start">

                            <div>
                                <div className="mb-3 flex flex-wrap gap-2">
                                    <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-bold text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400">
                                        {complaint.category}
                                    </span>

                                    <span
                                        className={`rounded-full px-3 py-1 text-xs font-bold capitalize ${getStatusStyle(
                                            status
                                        )}`}
                                    >
                                        {status.replace(
                                            '-',
                                            ' '
                                        )}
                                    </span>
                                </div>

                                <h1 className="text-3xl font-black text-slate-900 dark:text-white">
                                    {complaint.title}
                                </h1>

                                <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
                                    Submitted{' '}
                                    {complaint.date
                                        ? new Date(
                                              complaint.date
                                          ).toLocaleString()
                                        : '—'}
                                </p>
                            </div>

                            <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800">
                                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                                    Due In
                                </p>

                                <p className="mt-1 text-2xl font-black text-slate-900 dark:text-white">
                                    {complaint.dueInDays ??
                                        '—'}
                                    <span className="ml-1 text-sm font-medium text-slate-500">
                                        day(s)
                                    </span>
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="grid gap-8 p-6 sm:p-8 lg:grid-cols-3">

                        {/* Main */}
                        <div className="lg:col-span-2">

                            <div>
                                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                                    Complaint Description
                                </h2>

                                <div className="mt-3 rounded-2xl bg-slate-50 p-5 leading-7 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                                    {complaint.description}
                                </div>
                            </div>

                            {complaint.imageUrl && (
                                <div className="mt-8">
                                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                                        Attached Image
                                    </h2>

                                    <div className="mt-3 overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700">
                                        <img
                                            src={
                                                complaint.imageUrl
                                            }
                                            alt="Complaint evidence"
                                            className="max-h-[500px] w-full object-contain"
                                        />
                                    </div>
                                </div>
                            )}

                            {complaint.resolutionNotes && (
                                <div className="mt-8 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 dark:border-emerald-900/50 dark:bg-emerald-950/20">
                                    <div className="flex gap-3">
                                        <span className="text-xl">
                                            ✓
                                        </span>

                                        <div>
                                            <h3 className="font-bold text-emerald-800 dark:text-emerald-300">
                                                Resolution Notes
                                            </h3>

                                            <p className="mt-2 leading-6 text-emerald-700 dark:text-emerald-400">
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
                        <div>
                            <div className="rounded-2xl border border-slate-200 p-5 dark:border-slate-800">
                                <h2 className="font-bold text-slate-900 dark:text-white">
                                    Complaint Information
                                </h2>

                                <div className="mt-5 space-y-4">

                                    <div>
                                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                                            Category
                                        </p>

                                        <p className="mt-1 font-semibold text-slate-700 dark:text-slate-300">
                                            {complaint.category}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                                            Status
                                        </p>

                                        <p className="mt-1 font-semibold capitalize text-slate-700 dark:text-slate-300">
                                            {status.replace(
                                                '-',
                                                ' '
                                            )}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                                            Assigned Technician
                                        </p>

                                        <p className="mt-1 font-semibold text-slate-700 dark:text-slate-300">
                                            {complaint.assignedTo?.name ||
                                                complaint.assignedTo?.email ||
                                                'Not assigned yet'}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                                            Submitted
                                        </p>

                                        <p className="mt-1 font-semibold text-slate-700 dark:text-slate-300">
                                            {complaint.date
                                                ? new Date(
                                                      complaint.date
                                                  ).toLocaleDateString()
                                                : '—'}
                                        </p>
                                    </div>

                                </div>
                            </div>

                            {/* Timeline */}
                            <div className="mt-5 rounded-2xl border border-slate-200 p-5 dark:border-slate-800">
                                <h2 className="font-bold text-slate-900 dark:text-white">
                                    Complaint Progress
                                </h2>

                                <div className="mt-5 space-y-5">

                                    <div className="flex gap-3">
                                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm dark:bg-indigo-500/10">
                                            ✓
                                        </div>

                                        <div>
                                            <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                                                Complaint submitted
                                            </p>

                                            <p className="text-xs text-slate-500">
                                                Your issue has been recorded.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex gap-3">
                                        <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm ${
                                            status === 'pending'
                                                ? 'bg-slate-100 dark:bg-slate-800'
                                                : 'bg-indigo-100 dark:bg-indigo-500/10'
                                        }`}>
                                            {status === 'pending'
                                                ? '2'
                                                : '✓'}
                                        </div>

                                        <div>
                                            <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                                                Review & assignment
                                            </p>

                                            <p className="text-xs text-slate-500">
                                                {complaint.assignedTo
                                                    ? 'Assigned to a technician.'
                                                    : 'Waiting for assignment.'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex gap-3">
                                        <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm ${
                                            status === 'resolved'
                                                ? 'bg-emerald-100 dark:bg-emerald-500/10'
                                                : 'bg-slate-100 dark:bg-slate-800'
                                        }`}>
                                            {status === 'resolved'
                                                ? '✓'
                                                : '3'}
                                        </div>

                                        <div>
                                            <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                                                Resolution
                                            </p>

                                            <p className="text-xs text-slate-500">
                                                {status ===
                                                'resolved'
                                                    ? 'Complaint resolved.'
                                                    : 'Resolution in progress.'}
                                            </p>
                                        </div>
                                    </div>

                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ComplaintDetail;