import React, { useState } from 'react';
import {
    Link,
    useHistory,
    useLocation
} from 'react-router-dom';

const Navbar = ({
    isLoggedIn,
    onLogout,
    userRole,
    userEmail,
    userInfo,
    theme,
    onToggleTheme
}) => {
    const history = useHistory();
    const location = useLocation();

    const [mobileOpen, setMobileOpen] =
        useState(false);

    const isActive = (path) => {
        return location.pathname === path;
    };

    const navigate = (path) => {
        setMobileOpen(false);
        history.push(path);
    };

    const roleLabel = {
        admin: 'Administrator',
        staff: 'Technician',
        student: 'Student'
    };

    const currentRole =
        roleLabel[userRole] || 'Guest';

    const initials = userInfo?.name
        ? userInfo.name
              .split(' ')
              .map(word => word[0])
              .join('')
              .slice(0, 2)
              .toUpperCase()
        : userRole === 'admin'
        ? 'AD'
        : 'U';

    return (
        <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 shadow-sm backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/90">

            <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">

                {/* Brand */}
                <Link
                    to="/"
                    onClick={() => setMobileOpen(false)}
                    className="group flex items-center gap-3"
                >
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 text-lg font-black text-white shadow-lg shadow-indigo-600/25 transition-transform group-hover:scale-105">
                        C
                    </div>

                    <div className="hidden sm:block">
                        <div className="text-lg font-extrabold tracking-tight text-slate-900 dark:text-white">
                            Campus
                            <span className="text-indigo-600 dark:text-indigo-400">
                                Care
                            </span>
                        </div>

                        <div className="text-[10px] font-medium uppercase tracking-[0.18em] text-slate-500 dark:text-slate-500">
                            Smart Campus Platform
                        </div>
                    </div>
                </Link>

                {/* Desktop Navigation */}
                <nav className="hidden items-center gap-1 md:flex">

                    {isLoggedIn && (
                        <Link
                            to="/"
                            className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                                isActive('/')
                                    ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400'
                                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white'
                            }`}
                        >
                            Home
                        </Link>
                    )}

                    {userRole === 'student' && (
                        <>
                            <Link
                                to="/my-complaints"
                                className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                                    isActive('/my-complaints')
                                        ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400'
                                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white'
                                }`}
                            >
                                My Complaints
                            </Link>

                            <Link
                                to="/complaints/new"
                                className="ml-1 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-bold text-white shadow-md shadow-indigo-600/20 transition hover:bg-indigo-700"
                            >
                                + Submit Complaint
                            </Link>
                        </>
                    )}

                    {userRole === 'admin' && (
                        <Link
                            to="/admin/dashboard"
                            className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                                isActive('/admin/dashboard')
                                    ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400'
                                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white'
                            }`}
                        >
                            Dashboard
                        </Link>
                    )}

                    {userRole === 'staff' && (
                        <Link
                            to="/staff/dashboard"
                            className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                                isActive('/staff/dashboard')
                                    ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400'
                                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white'
                            }`}
                        >
                            Dashboard
                        </Link>
                    )}

                </nav>

                {/* Right Controls */}
                <div className="hidden items-center gap-3 md:flex">

                    {/* Theme */}
                    <button
                        type="button"
                        onClick={onToggleTheme}
                        aria-label="Toggle theme"
                        className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-lg transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800"
                    >
                        {theme === 'dark'
                            ? '☀️'
                            : '🌙'}
                    </button>

                    {isLoggedIn ? (
                        <>
                            {/* User */}
                            <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-900">

                                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-xs font-bold text-white">
                                    {initials}
                                </div>

                                <div className="max-w-[150px]">
                                    <div className="truncate text-xs font-bold text-slate-900 dark:text-white">
                                        {userInfo?.name ||
                                            currentRole}
                                    </div>

                                    <div className="truncate text-[11px] text-slate-500 dark:text-slate-400">
                                        {currentRole}
                                    </div>
                                </div>

                            </div>

                            <button
                                type="button"
                                onClick={onLogout}
                                className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 dark:border-slate-700 dark:text-slate-300 dark:hover:border-red-900 dark:hover:bg-red-950/30 dark:hover:text-red-400"
                            >
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <button
                                type="button"
                                onClick={() =>
                                    navigate(
                                        '/login/student'
                                    )
                                }
                                className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                            >
                                Login
                            </button>

                            <button
                                type="button"
                                onClick={() =>
                                    navigate(
                                        '/register/student'
                                    )
                                }
                                className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-700"
                            >
                                Get Started
                            </button>
                        </>
                    )}

                </div>

                {/* Mobile Controls */}
                <div className="flex items-center gap-2 md:hidden">

                    <button
                        type="button"
                        onClick={onToggleTheme}
                        className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-900"
                    >
                        {theme === 'dark'
                            ? '☀️'
                            : '🌙'}
                    </button>

                    <button
                        type="button"
                        onClick={() =>
                            setMobileOpen(
                                !mobileOpen
                            )
                        }
                        className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-xl dark:border-slate-700 dark:bg-slate-900"
                        aria-label="Open navigation"
                    >
                        {mobileOpen ? '×' : '☰'}
                    </button>

                </div>
            </div>

            {/* Mobile Menu */}
            {mobileOpen && (
                <div className="border-t border-slate-200 bg-white px-4 pb-5 pt-3 shadow-xl dark:border-slate-800 dark:bg-slate-950 md:hidden">

                    <div className="space-y-2">

                        {isLoggedIn && (
                            <Link
                                to="/"
                                onClick={() =>
                                    setMobileOpen(false)
                                }
                                className="block rounded-xl px-4 py-3 font-semibold text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                            >
                                Home
                            </Link>
                        )}

                        {userRole === 'student' && (
                            <>
                                <Link
                                    to="/my-complaints"
                                    onClick={() =>
                                        setMobileOpen(false)
                                    }
                                    className="block rounded-xl px-4 py-3 font-semibold text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                                >
                                    My Complaints
                                </Link>

                                <Link
                                    to="/complaints/new"
                                    onClick={() =>
                                        setMobileOpen(false)
                                    }
                                    className="block rounded-xl bg-indigo-600 px-4 py-3 font-bold text-white"
                                >
                                    + Submit Complaint
                                </Link>
                            </>
                        )}

                        {userRole === 'admin' && (
                            <Link
                                to="/admin/dashboard"
                                onClick={() =>
                                    setMobileOpen(false)
                                }
                                className="block rounded-xl px-4 py-3 font-semibold text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                            >
                                Admin Dashboard
                            </Link>
                        )}

                        {userRole === 'staff' && (
                            <Link
                                to="/staff/dashboard"
                                onClick={() =>
                                    setMobileOpen(false)
                                }
                                className="block rounded-xl px-4 py-3 font-semibold text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                            >
                                Technician Dashboard
                            </Link>
                        )}

                        {!isLoggedIn && (
                            <>
                                <button
                                    type="button"
                                    onClick={() =>
                                        navigate(
                                            '/login/student'
                                        )
                                    }
                                    className="block w-full rounded-xl px-4 py-3 text-left font-semibold text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                                >
                                    Login
                                </button>

                                <button
                                    type="button"
                                    onClick={() =>
                                        navigate(
                                            '/register/student'
                                        )
                                    }
                                    className="block w-full rounded-xl bg-indigo-600 px-4 py-3 text-left font-bold text-white"
                                >
                                    Get Started
                                </button>
                            </>
                        )}

                        {isLoggedIn && (
                            <button
                                type="button"
                                onClick={onLogout}
                                className="block w-full rounded-xl border border-red-200 px-4 py-3 text-left font-semibold text-red-600 dark:border-red-900/50 dark:text-red-400"
                            >
                                Logout
                            </button>
                        )}

                    </div>

                    {isLoggedIn && (
                        <div className="mt-4 rounded-2xl bg-slate-50 p-4 dark:bg-slate-900">

                            <div className="text-sm font-bold text-slate-900 dark:text-white">
                                {userInfo?.name ||
                                    currentRole}
                            </div>

                            <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                {userEmail}
                            </div>

                            {userInfo?.department && (
                                <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                    {userInfo.department}
                                </div>
                            )}

                        </div>
                    )}

                </div>
            )}

        </header>
    );
};

export default Navbar;