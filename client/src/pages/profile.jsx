import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';

const Profile = ({ userRole, onLogout }) => {
    const history = useHistory();

    const [user, setUser] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        try {
            const storedUser = localStorage.getItem('user');
            const token = localStorage.getItem('token');

            /*
            |--------------------------------------------------------------------------
            | Authentication check
            |--------------------------------------------------------------------------
            */

            if (!token) {
                history.replace('/login/student');
                return;
            }

            /*
            |--------------------------------------------------------------------------
            | Load logged-in user from localStorage
            |--------------------------------------------------------------------------
            */

            if (!storedUser) {
                setError(
                    'User information was not found. Please login again.'
                );
                return;
            }

            const parsedUser = JSON.parse(storedUser);

            if (!parsedUser || typeof parsedUser !== 'object') {
                throw new Error('Invalid user information.');
            }

            setUser(parsedUser);

        } catch (error) {
            console.error(
                'Profile loading error:',
                error
            );

            setError(
                'Unable to load profile information. Please login again.'
            );
        }
    }, [history]);

    /*
    |--------------------------------------------------------------------------
    | Loading
    |--------------------------------------------------------------------------
    */

    if (!user && !error) {
        return (
            <div className="flex min-h-[70vh] items-center justify-center bg-slate-50 dark:bg-slate-950">
                <div className="text-center">

                    <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-indigo-600 dark:border-slate-700 dark:border-t-indigo-400" />

                    <p className="mt-4 text-sm font-medium text-slate-500 dark:text-slate-400">
                        Loading profile...
                    </p>

                </div>
            </div>
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Error
    |--------------------------------------------------------------------------
    */

    if (error) {
        return (
            <div className="min-h-[calc(100vh-72px)] bg-slate-50 px-4 py-10 dark:bg-slate-950 sm:px-6 lg:px-8">

                <div className="mx-auto max-w-2xl">

                    <div className="rounded-3xl border border-red-200 bg-red-50 p-8 text-center shadow-sm dark:border-red-900/50 dark:bg-red-950/30">

                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-100 text-3xl dark:bg-red-900/40">
                            ⚠️
                        </div>

                        <h2 className="mt-5 text-2xl font-black text-red-800 dark:text-red-300">
                            Unable to load profile
                        </h2>

                        <p className="mt-3 text-red-700 dark:text-red-400">
                            {error}
                        </p>

                        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">

                            <button
                                type="button"
                                onClick={() => {
                                    localStorage.removeItem('token');
                                    localStorage.removeItem('user');

                                    if (onLogout) {
                                        onLogout();
                                    } else {
                                        history.replace('/login/student');
                                    }
                                }}
                                className="rounded-xl bg-indigo-600 px-6 py-3 font-bold text-white transition hover:bg-indigo-700"
                            >
                                Login Again
                            </button>

                            <button
                                type="button"
                                onClick={() => window.location.reload()}
                                className="rounded-xl border border-slate-300 bg-white px-6 py-3 font-bold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
                            >
                                Try Again
                            </button>

                        </div>

                    </div>

                </div>

            </div>
        );
    }

    /*
    |--------------------------------------------------------------------------
    | No user
    |--------------------------------------------------------------------------
    */

    if (!user) {
        return (
            <div className="flex min-h-[70vh] items-center justify-center bg-slate-50 dark:bg-slate-950">

                <div className="text-center">

                    <div className="text-5xl">
                        👤
                    </div>

                    <h2 className="mt-4 text-xl font-black text-slate-900 dark:text-white">
                        Profile not found
                    </h2>

                    <button
                        type="button"
                        onClick={() => history.replace('/')}
                        className="mt-5 rounded-xl bg-indigo-600 px-5 py-3 font-bold text-white hover:bg-indigo-700"
                    >
                        Go Home
                    </button>

                </div>

            </div>
        );
    }

    /*
    |--------------------------------------------------------------------------
    | User information
    |--------------------------------------------------------------------------
    */

    const role =
        user.role ||
        userRole ||
        'student';

    const roleName =
        role === 'admin'
            ? 'Administrator'
            : role === 'staff'
            ? 'Technician'
            : 'Student';

    const name =
        user.name ||
        user.fullName ||
        user.username ||
        'CampusCare User';

    const email =
        user.email ||
        'Not available';

    const phone =
        user.phone ||
        'Not available';

    const department =
        user.department ||
        'Not specified';

    const studentId =
        user.studentId ||
        'Not specified';

    const year =
        user.year ||
        'Not specified';

    const branch =
        user.branch ||
        'Not specified';

    const hostelBlock =
        user.hostelBlock ||
        'Not specified';

    const roomNumber =
        user.roomNumber ||
        'Not specified';

    const initials =
        name
            .split(' ')
            .filter(Boolean)
            .map(
                word =>
                    word.charAt(0)
            )
            .join('')
            .slice(0, 2)
            .toUpperCase() || 'U';

    /*
    |--------------------------------------------------------------------------
    | Dashboard navigation
    |--------------------------------------------------------------------------
    */

    const goBackToDashboard = () => {

        if (role === 'admin') {
            history.push(
                '/admin/dashboard'
            );

        } else if (role === 'staff') {
            history.push(
                '/staff/dashboard'
            );

        } else {
            history.push('/');
        }
    };

    /*
    |--------------------------------------------------------------------------
    | Logout
    |--------------------------------------------------------------------------
    */

    const handleLogout = () => {

        localStorage.removeItem('token');
        localStorage.removeItem('user');

        if (onLogout) {
            onLogout();
        } else {
            history.replace('/');
        }
    };

    return (
        <div className="min-h-[calc(100vh-72px)] bg-slate-50 px-4 py-10 dark:bg-slate-950 sm:px-6 lg:px-8">

            <div className="mx-auto max-w-5xl">

                {/* =========================================================
                    PAGE HEADER
                ========================================================= */}

                <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                    <div>

                        <p className="text-sm font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
                            Account
                        </p>

                        <h1 className="mt-1 text-3xl font-black text-slate-900 dark:text-white sm:text-4xl">
                            My Profile
                        </h1>

                        <p className="mt-2 text-slate-500 dark:text-slate-400">
                            View your CampusCare account information
                        </p>

                    </div>

                    <button
                        type="button"
                        onClick={goBackToDashboard}
                        className="rounded-xl border border-slate-300 bg-white px-5 py-3 font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
                    >
                        ← Back
                    </button>

                </div>


                {/* =========================================================
                    PROFILE CARD
                ========================================================= */}

                <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-900">

                    {/* =====================================================
                        PROFILE BANNER
                    ===================================================== */}

                    <div className="bg-gradient-to-r from-indigo-600 via-indigo-600 to-violet-600 px-6 py-10 sm:px-10">

                        <div className="flex flex-col items-center gap-6 sm:flex-row">

                            {/* Avatar */}

                            <div className="flex h-28 w-28 shrink-0 items-center justify-center rounded-3xl bg-white/20 text-4xl font-black text-white shadow-lg backdrop-blur-sm ring-4 ring-white/10">
                                {initials}
                            </div>

                            {/* Name */}

                            <div className="text-center sm:text-left">

                                <h2 className="text-3xl font-black text-white sm:text-4xl">
                                    {name}
                                </h2>

                                <p className="mt-2 text-indigo-100">
                                    {email}
                                </p>

                                <div className="mt-4 flex flex-wrap justify-center gap-2 sm:justify-start">

                                    <span className="rounded-full bg-white/20 px-4 py-1.5 text-sm font-bold text-white backdrop-blur">
                                        {roleName}
                                    </span>

                                    {department &&
                                        department !==
                                            'Not specified' && (
                                            <span className="rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium text-indigo-100">
                                                {department}
                                            </span>
                                        )}

                                </div>

                            </div>

                        </div>

                    </div>


                    {/* =====================================================
                        PERSONAL INFORMATION
                    ===================================================== */}

                    <div className="p-6 sm:p-10">

                        <div className="mb-6">

                            <h3 className="text-xl font-black text-slate-900 dark:text-white">
                                Personal Information
                            </h3>

                            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                Your registered account details
                            </p>

                        </div>

                        <div className="grid gap-5 sm:grid-cols-2">

                            {/* Full Name */}

                            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-800">

                                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                    Full Name
                                </p>

                                <p className="mt-2 break-words text-base font-bold text-slate-900 dark:text-white">
                                    {name}
                                </p>

                            </div>


                            {/* Email */}

                            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-800">

                                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                    Email Address
                                </p>

                                <p className="mt-2 break-all text-base font-bold text-slate-900 dark:text-white">
                                    {email}
                                </p>

                            </div>


                            {/* Phone */}

                            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-800">

                                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                    Phone Number
                                </p>

                                <p className="mt-2 text-base font-bold text-slate-900 dark:text-white">
                                    {phone}
                                </p>

                            </div>


                            {/* Department */}

                            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-800">

                                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                    Department
                                </p>

                                <p className="mt-2 text-base font-bold text-slate-900 dark:text-white">
                                    {department}
                                </p>

                            </div>


                            {/* Role */}

                            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-800">

                                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                    Account Type
                                </p>

                                <p className="mt-2 text-base font-bold text-slate-900 dark:text-white">
                                    {roleName}
                                </p>

                            </div>

                        </div>


                        {/* =================================================
                            STUDENT INFORMATION
                        ================================================= */}

                        {role === 'student' && (
                            <div className="mt-10">

                                <div className="mb-6">

                                    <h3 className="text-xl font-black text-slate-900 dark:text-white">
                                        Student Information
                                    </h3>

                                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                        Academic and hostel information
                                    </p>

                                </div>

                                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">

                                    {/* Student ID */}

                                    <div className="rounded-2xl border border-slate-200 p-5 dark:border-slate-700">

                                        <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                            Student ID
                                        </p>

                                        <p className="mt-2 break-words font-bold text-slate-900 dark:text-white">
                                            {studentId}
                                        </p>

                                    </div>


                                    {/* Year */}

                                    <div className="rounded-2xl border border-slate-200 p-5 dark:border-slate-700">

                                        <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                            Year
                                        </p>

                                        <p className="mt-2 font-bold text-slate-900 dark:text-white">
                                            {year}
                                        </p>

                                    </div>


                                    {/* Branch */}

                                    <div className="rounded-2xl border border-slate-200 p-5 dark:border-slate-700">

                                        <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                            Branch
                                        </p>

                                        <p className="mt-2 break-words font-bold text-slate-900 dark:text-white">
                                            {branch}
                                        </p>

                                    </div>


                                    {/* Hostel Block */}

                                    <div className="rounded-2xl border border-slate-200 p-5 dark:border-slate-700">

                                        <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                            Hostel Block
                                        </p>

                                        <p className="mt-2 break-words font-bold text-slate-900 dark:text-white">
                                            {hostelBlock}
                                        </p>

                                    </div>


                                    {/* Room */}

                                    <div className="rounded-2xl border border-slate-200 p-5 dark:border-slate-700">

                                        <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                            Room Number
                                        </p>

                                        <p className="mt-2 font-bold text-slate-900 dark:text-white">
                                            {roomNumber}
                                        </p>

                                    </div>

                                </div>

                            </div>
                        )}


                        {/* =================================================
                            STAFF INFORMATION
                        ================================================= */}

                        {role === 'staff' && (
                            <div className="mt-10">

                                <div className="mb-6">

                                    <h3 className="text-xl font-black text-slate-900 dark:text-white">
                                        Technician Information
                                    </h3>

                                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                        Your technician account details
                                    </p>

                                </div>

                                <div className="grid gap-5 sm:grid-cols-2">

                                    <div className="rounded-2xl border border-slate-200 p-5 dark:border-slate-700">

                                        <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                            Department
                                        </p>

                                        <p className="mt-2 font-bold text-slate-900 dark:text-white">
                                            {department}
                                        </p>

                                    </div>

                                    <div className="rounded-2xl border border-slate-200 p-5 dark:border-slate-700">

                                        <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                            Account Type
                                        </p>

                                        <p className="mt-2 font-bold text-slate-900 dark:text-white">
                                            Technician
                                        </p>

                                    </div>

                                </div>

                            </div>
                        )}


                        {/* =================================================
                            ADMIN INFORMATION
                        ================================================= */}

                        {role === 'admin' && (
                            <div className="mt-10">

                                <div className="mb-6">

                                    <h3 className="text-xl font-black text-slate-900 dark:text-white">
                                        Administrator Information
                                    </h3>

                                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                        CampusCare administrator account
                                    </p>

                                </div>

                                <div className="grid gap-5 sm:grid-cols-2">

                                    <div className="rounded-2xl border border-indigo-100 bg-indigo-50 p-5 dark:border-indigo-900/40 dark:bg-indigo-950/30">

                                        <p className="text-xs font-bold uppercase tracking-wider text-indigo-500">
                                            Account Type
                                        </p>

                                        <p className="mt-2 font-bold text-slate-900 dark:text-white">
                                            Administrator
                                        </p>

                                    </div>

                                    <div className="rounded-2xl border border-indigo-100 bg-indigo-50 p-5 dark:border-indigo-900/40 dark:bg-indigo-950/30">

                                        <p className="text-xs font-bold uppercase tracking-wider text-indigo-500">
                                            Access Level
                                        </p>

                                        <p className="mt-2 font-bold text-slate-900 dark:text-white">
                                            Full Administrative Access
                                        </p>

                                    </div>

                                </div>

                            </div>
                        )}


                        {/* =================================================
                            ACTIONS
                        ================================================= */}

                        <div className="mt-10 flex flex-col gap-3 border-t border-slate-200 pt-8 dark:border-slate-800 sm:flex-row sm:justify-end">

                            <button
                                type="button"
                                onClick={goBackToDashboard}
                                className="rounded-xl border border-slate-300 bg-white px-6 py-3 font-bold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
                            >
                                ← Back to Dashboard
                            </button>

                            <button
                                type="button"
                                onClick={handleLogout}
                                className="rounded-xl border border-red-200 px-6 py-3 font-bold text-red-600 transition hover:bg-red-50 dark:border-red-900/50 dark:text-red-400 dark:hover:bg-red-950/30"
                            >
                                Logout
                            </button>

                        </div>

                    </div>

                </div>

            </div>

        </div>
    );
};

export default Profile;