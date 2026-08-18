import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import axios from 'axios';

const API_URL =
    'https://campuscare-backend-jq45.onrender.com';

const Home = ({ userEmail, userRole }) => {
    const history = useHistory();

    const [feedbacks, setFeedbacks] = useState([]);

    const [stats, setStats] = useState({
        resolved: 0,
        users: 0,
        responseTime: 0,
    });

    const [loadingStats, setLoadingStats] = useState(true);

    useEffect(() => {
        let isMounted = true;

        const fetchData = async () => {
            try {
                const [
                    feedbackResponse,
                    complaintsResponse,
                    usersResponse,
                ] = await Promise.allSettled([
                    axios.get(
                        `${API_URL}/api/feedback`
                    ),
                    axios.get(
                        `${API_URL}/api/stats/complaints`
                    ),
                    axios.get(
                        `${API_URL}/api/stats/users`
                    ),
                ]);

                if (!isMounted) return;

                if (
                    feedbackResponse.status ===
                    'fulfilled'
                ) {
                    const data =
                        feedbackResponse.value.data;

                    setFeedbacks(
                        Array.isArray(data)
                            ? data
                                  .slice(-6)
                                  .reverse()
                            : []
                    );
                }

                if (
                    complaintsResponse.status ===
                    'fulfilled'
                ) {
                    const complaintStats =
                        complaintsResponse.value.data;

                    const userStats =
                        usersResponse.status ===
                        'fulfilled'
                            ? usersResponse.value.data
                            : {};

                    setStats({
                        resolved:
                            complaintStats.resolved ||
                            0,

                        users:
                            userStats.total ||
                            0,

                        responseTime:
                            complaintStats.avgResponseTime ||
                            24,
                    });
                }
            } catch (error) {
                console.error(
                    'Error loading home page data:',
                    error
                );
            } finally {
                if (isMounted) {
                    setLoadingStats(false);
                }
            }
        };

        fetchData();

        return () => {
            isMounted = false;
        };
    }, []);

    return (
        <div className="overflow-hidden">

            {/* HERO */}
            <section className="relative isolate bg-slate-950 text-white">

                <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_right,_rgba(99,102,241,0.30),_transparent_40%),radial-gradient(circle_at_bottom_left,_rgba(124,58,237,0.20),_transparent_40%)]" />

                <div className="mx-auto grid min-h-[650px] max-w-7xl items-center gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:px-8">

                    <div>
                        <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-indigo-400/20 bg-indigo-500/10 px-4 py-2 text-sm font-semibold text-indigo-300">
                            ✦ Smart Campus Resolution Platform
                        </div>

                        <h1 className="text-5xl font-black leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
                            Report issues.
                            <br />
                            <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
                                Get them resolved.
                            </span>
                        </h1>

                        <p className="mt-7 max-w-xl text-lg leading-8 text-slate-300">
                            CampusCare connects students,
                            technicians and administrators through
                            one transparent complaint management
                            platform.
                        </p>

                        {!userEmail ? (
                            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                                <button
                                    type="button"
                                    onClick={() =>
                                        history.push(
                                            '/login/student'
                                        )
                                    }
                                    className="rounded-xl bg-indigo-600 px-6 py-3.5 font-bold text-white shadow-xl shadow-indigo-600/20 transition hover:-translate-y-0.5 hover:bg-indigo-500"
                                >
                                    Get Started →
                                </button>

                                <button
                                    type="button"
                                    onClick={() =>
                                        history.push(
                                            '/register/student'
                                        )
                                    }
                                    className="rounded-xl border border-slate-700 bg-slate-900/50 px-6 py-3.5 font-bold text-white transition hover:bg-slate-800"
                                >
                                    Create Account
                                </button>
                            </div>
                        ) : (
                            <div className="mt-9 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 p-5">
                                <p className="text-sm text-emerald-300">
                                    Welcome back
                                </p>

                                <p className="mt-1 text-xl font-bold text-white">
                                    {userEmail}
                                </p>

                                <p className="mt-1 text-sm capitalize text-slate-400">
                                    {userRole} account
                                </p>
                            </div>
                        )}

                        <div className="mt-10 flex flex-wrap gap-6 text-sm text-slate-400">
                            <span>✓ Easy reporting</span>
                            <span>✓ Real-time tracking</span>
                            <span>✓ Transparent workflow</span>
                        </div>
                    </div>

                    {/* Hero visual */}
                    <div className="relative hidden lg:block">
                        <div className="absolute -inset-10 rounded-full bg-indigo-600/10 blur-3xl" />

                        <div className="relative mx-auto max-w-md rounded-[2rem] border border-white/10 bg-white/5 p-5 shadow-2xl backdrop-blur-xl">

                            <div className="rounded-2xl bg-slate-900 p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs text-slate-500">
                                            Complaint Status
                                        </p>

                                        <p className="mt-1 text-lg font-bold">
                                            Live Tracking
                                        </p>
                                    </div>

                                    <div className="rounded-xl bg-emerald-500/10 px-3 py-2 text-xs font-bold text-emerald-400">
                                        ACTIVE
                                    </div>
                                </div>

                                <div className="mt-8 space-y-4">

                                    <div className="flex items-center gap-4 rounded-xl bg-slate-800 p-4">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10">
                                            📝
                                        </div>

                                        <div className="flex-1">
                                            <p className="text-sm font-bold">
                                                Complaint submitted
                                            </p>

                                            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-700">
                                                <div className="h-full w-full rounded-full bg-indigo-500" />
                                            </div>
                                        </div>

                                        <span className="text-xs text-emerald-400">
                                            ✓
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-4 rounded-xl bg-slate-800 p-4">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10">
                                            🛠️
                                        </div>

                                        <div className="flex-1">
                                            <p className="text-sm font-bold">
                                                Assigned to technician
                                            </p>

                                            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-700">
                                                <div className="h-full w-2/3 rounded-full bg-violet-500" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 rounded-xl bg-slate-800 p-4">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10">
                                            ✓
                                        </div>

                                        <div>
                                            <p className="text-sm font-bold">
                                                Resolution
                                            </p>

                                            <p className="mt-1 text-xs text-slate-500">
                                                Track every step
                                            </p>
                                        </div>
                                    </div>

                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </section>

            {/* QUICK ACTIONS */}
            {userEmail && (
                <section className="border-b border-slate-200 bg-white py-8 dark:border-slate-800 dark:bg-slate-900">
                    <div className="page-container">
                        <div className="flex flex-col items-start justify-between gap-5 sm:flex-row sm:items-center">

                            <div>
                                <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                                    Quick actions
                                </p>

                                <h2 className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">
                                    What would you like to do?
                                </h2>
                            </div>

                            <div className="flex flex-wrap gap-3">

                                {userRole === 'student' && (
                                    <>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                history.push(
                                                    '/complaints/new'
                                                )
                                            }
                                            className="primary-button"
                                        >
                                            + Submit Complaint
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                history.push(
                                                    '/my-complaints'
                                                )
                                            }
                                            className="secondary-button"
                                        >
                                            View My Complaints
                                        </button>
                                    </>
                                )}

                                {userRole === 'staff' && (
                                    <button
                                        type="button"
                                        onClick={() =>
                                            history.push(
                                                '/staff/dashboard'
                                            )
                                        }
                                        className="primary-button"
                                    >
                                        Open Technician Dashboard
                                    </button>
                                )}

                                {userRole === 'admin' && (
                                    <button
                                        type="button"
                                        onClick={() =>
                                            history.push(
                                                '/admin/dashboard'
                                            )
                                        }
                                        className="primary-button"
                                    >
                                        Open Admin Dashboard
                                    </button>
                                )}

                            </div>
                        </div>
                    </div>
                </section>
            )}

            {/* FEATURES */}
            <section className="bg-slate-50 py-20 dark:bg-slate-950">
                <div className="page-container">

                    <div className="mx-auto max-w-2xl text-center">
                        <div className="mb-4 text-sm font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
                            Why CampusCare?
                        </div>

                        <h2 className="section-title">
                            A better way to manage campus issues
                        </h2>

                        <p className="section-subtitle mx-auto">
                            Designed around transparency, accountability
                            and a simple user experience.
                        </p>
                    </div>

                    <div className="mt-12 grid gap-6 md:grid-cols-3">

                        <div className="modern-card p-7">
                            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-2xl dark:bg-amber-500/10">
                                ⚡
                            </div>

                            <h3 className="mt-6 text-xl font-bold text-slate-900 dark:text-white">
                                Quick Resolution
                            </h3>

                            <p className="mt-3 leading-7 text-slate-600 dark:text-slate-400">
                                Streamlined workflows help route issues
                                to the right people and reduce unnecessary
                                delays.
                            </p>
                        </div>

                        <div className="modern-card p-7">
                            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-2xl dark:bg-emerald-500/10">
                                🔒
                            </div>

                            <h3 className="mt-6 text-xl font-bold text-slate-900 dark:text-white">
                                Transparent Process
                            </h3>

                            <p className="mt-3 leading-7 text-slate-600 dark:text-slate-400">
                                Follow complaints from submission through
                                assignment, progress updates and resolution.
                            </p>
                        </div>

                        <div className="modern-card p-7">
                            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-100 text-2xl dark:bg-indigo-500/10">
                                📱
                            </div>

                            <h3 className="mt-6 text-xl font-bold text-slate-900 dark:text-white">
                                Easy Access
                            </h3>

                            <p className="mt-3 leading-7 text-slate-600 dark:text-slate-400">
                                A responsive interface that works smoothly
                                across desktops, tablets and mobile devices.
                            </p>
                        </div>

                    </div>
                </div>
            </section>

            {/* STATISTICS */}
            <section className="border-y border-slate-200 bg-white py-20 dark:border-slate-800 dark:bg-slate-900">
                <div className="page-container">

                    <div className="text-center">
                        <div className="mb-4 text-sm font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
                            Platform Overview
                        </div>

                        <h2 className="section-title">
                            CampusCare in numbers
                        </h2>
                    </div>

                    <div className="mt-12 grid gap-5 sm:grid-cols-3">

                        <div className="rounded-3xl bg-gradient-to-br from-indigo-600 to-violet-600 p-7 text-white shadow-xl shadow-indigo-600/20">
                            <div className="text-3xl">
                                ✓
                            </div>

                            <div className="mt-5 text-4xl font-black">
                                {loadingStats
                                    ? '—'
                                    : `${stats.resolved}+`}
                            </div>

                            <p className="mt-2 text-indigo-100">
                                Complaints Resolved
                            </p>
                        </div>

                        <div className="rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-600 p-7 text-white shadow-xl shadow-emerald-500/20">
                            <div className="text-3xl">
                                👥
                            </div>

                            <div className="mt-5 text-4xl font-black">
                                {loadingStats
                                    ? '—'
                                    : `${stats.users}+`}
                            </div>

                            <p className="mt-2 text-emerald-100">
                                Registered Users
                            </p>
                        </div>

                        <div className="rounded-3xl bg-gradient-to-br from-amber-500 to-orange-600 p-7 text-white shadow-xl shadow-amber-500/20">
                            <div className="text-3xl">
                                ⏱️
                            </div>

                            <div className="mt-5 text-4xl font-black">
                                {loadingStats
                                    ? '—'
                                    : `${stats.responseTime}h`}
                            </div>

                            <p className="mt-2 text-amber-100">
                                Average Response Time
                            </p>
                        </div>

                    </div>
                </div>
            </section>

            {/* REVIEWS */}
            <section
                id="feedback"
                className="bg-slate-50 py-20 dark:bg-slate-950"
            >
                <div className="page-container">

                    <div className="mx-auto max-w-2xl text-center">
                        <div className="mb-4 text-sm font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
                            Community Feedback
                        </div>

                        <h2 className="section-title">
                            What users say
                        </h2>

                        <p className="section-subtitle mx-auto">
                            Feedback from people using the platform.
                        </p>
                    </div>

                    <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">

                        {feedbacks.length > 0 ? (
                            feedbacks.map(
                                (feedback) => (
                                    <div
                                        key={feedback._id}
                                        className="modern-card p-6"
                                    >
                                        <div className="flex items-center gap-4">

                                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 font-bold text-white">
                                                {(
                                                    feedback
                                                        .userId
                                                        ?.name ||
                                                    'A'
                                                )
                                                    .charAt(0)
                                                    .toUpperCase()}
                                            </div>

                                            <div className="min-w-0">
                                                <h3 className="truncate font-bold text-slate-900 dark:text-white">
                                                    {feedback
                                                        .userId
                                                        ?.name ||
                                                        'Anonymous'}
                                                </h3>

                                                <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                                                    CampusCare User
                                                </p>
                                            </div>

                                        </div>

                                        <div className="mt-5">
                                            <span className="text-amber-400">
                                                {'★'.repeat(
                                                    Math.max(
                                                        0,
                                                        Math.min(
                                                            5,
                                                            feedback.rating ||
                                                                0
                                                        )
                                                    )
                                                )}
                                            </span>

                                            <span className="text-slate-300 dark:text-slate-700">
                                                {'★'.repeat(
                                                    5 -
                                                        Math.max(
                                                            0,
                                                            Math.min(
                                                                5,
                                                                feedback.rating ||
                                                                    0
                                                            )
                                                        )
                                                )}
                                            </span>
                                        </div>

                                        <p className="mt-4 leading-7 text-slate-600 dark:text-slate-400">
                                            "
                                            {feedback.comment ||
                                                'Great service and quick resolution.'}
                                            "
                                        </p>

                                        {feedback.submittedAt && (
                                            <p className="mt-5 text-xs text-slate-400">
                                                {new Date(
                                                    feedback.submittedAt
                                                ).toLocaleDateString()}
                                            </p>
                                        )}
                                    </div>
                                )
                            )
                        ) : (
                            <div className="col-span-full rounded-3xl border border-dashed border-slate-300 p-10 text-center dark:border-slate-700">
                                <div className="text-4xl">
                                    💬
                                </div>

                                <h3 className="mt-4 font-bold text-slate-900 dark:text-white">
                                    No reviews yet
                                </h3>

                                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                                    Be among the first to share your
                                    CampusCare experience.
                                </p>
                            </div>
                        )}

                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="bg-slate-950 py-20 text-white">
                <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">

                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-600 text-3xl shadow-xl shadow-indigo-600/20">
                        C
                    </div>

                    <h2 className="mt-7 text-3xl font-black sm:text-4xl">
                        Make your campus better, one complaint at a time.
                    </h2>

                    <p className="mx-auto mt-4 max-w-2xl text-slate-400">
                        CampusCare makes it easier to report problems,
                        communicate with support teams and follow
                        resolutions.
                    </p>

                    {!userEmail && (
                        <button
                            type="button"
                            onClick={() =>
                                history.push(
                                    '/register/student'
                                )
                            }
                            className="mt-8 rounded-xl bg-indigo-600 px-7 py-3.5 font-bold text-white shadow-xl shadow-indigo-600/20 transition hover:bg-indigo-500"
                        >
                            Create Your Account →
                        </button>
                    )}

                </div>
            </section>

            {/* FOOTER */}
            <footer className="border-t border-slate-800 bg-slate-950 text-slate-400">
                <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">

                    <div className="grid gap-10 md:grid-cols-4">

                        <div className="md:col-span-2">
                            <div className="flex items-center gap-3">

                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 font-black text-white">
                                    C
                                </div>

                                <span className="text-xl font-black text-white">
                                    Campus
                                    <span className="text-indigo-400">
                                        Care
                                    </span>
                                </span>

                            </div>

                            <p className="mt-5 max-w-md text-sm leading-7">
                                A smart campus complaint and resolution
                                platform built to improve communication,
                                accountability and campus experiences.
                            </p>
                        </div>

                        <div>
                            <h3 className="font-bold text-white">
                                Platform
                            </h3>

                            <ul className="mt-4 space-y-3 text-sm">
                                <li>Complaint Management</li>
                                <li>Real-time Tracking</li>
                                <li>Technician Assignment</li>
                                <li>Admin Analytics</li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="font-bold text-white">
                                Access
                            </h3>

                            <ul className="mt-4 space-y-3 text-sm">

                                <li>
                                    <button
                                        onClick={() =>
                                            history.push(
                                                '/login/student'
                                            )
                                        }
                                        className="transition hover:text-white"
                                    >
                                        Student Login
                                    </button>
                                </li>

                                <li>
                                    <button
                                        onClick={() =>
                                            history.push(
                                                '/login/staff'
                                            )
                                        }
                                        className="transition hover:text-white"
                                    >
                                        Technician Login
                                    </button>
                                </li>

                                <li>
                                    <button
                                        onClick={() =>
                                            history.push(
                                                '/login/admin'
                                            )
                                        }
                                        className="transition hover:text-white"
                                    >
                                        Administrator Login
                                    </button>
                                </li>

                            </ul>
                        </div>

                    </div>

                    <div className="mt-10 flex flex-col gap-3 border-t border-slate-800 pt-6 text-xs sm:flex-row sm:items-center sm:justify-between">

                        <p>
                            © {new Date().getFullYear()} CampusCare.
                            All rights reserved.
                        </p>

                        <p>
                            Smart Campus Complaint & Resolution Platform
                        </p>

                    </div>
                </div>
            </footer>

        </div>
    );
};

export default Home;