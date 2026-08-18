import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useHistory, useParams } from 'react-router-dom';

const Login = ({ setIsLoggedIn, onLoginSuccess }) => {
    const history = useHistory();
    const { role: routeRole } = useParams();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState(routeRole || 'student');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // Keep role synchronized with /login/student, /login/staff, /login/admin
    useEffect(() => {
        if (routeRole && ['student', 'staff', 'admin'].includes(routeRole)) {
            setRole(routeRole);
        }
    }, [routeRole]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (loading) return;

        setError('');
        setLoading(true);

        try {
            const response = await axios.post(
                '/api/auth/login',
                {
                    email: email.trim(),
                    password,
                    role
                }
            );

            const { token, user } = response.data;

            if (!token || !user) {
                throw new Error('Invalid login response from server.');
            }

            // Save authentication data
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));

            // Update parent authentication state
            setIsLoggedIn(true);

            if (onLoginSuccess) {
                onLoginSuccess(response, history);
                return;
            }

            // Fallback routing
            if (user.role === 'admin') {
                history.replace('/admin/dashboard');
            } else if (user.role === 'staff') {
                history.replace('/staff/dashboard');
            } else {
                history.replace('/');
            }

        } catch (err) {
            console.error('Login error:', err);

            const message =
                err.response?.data?.message ||
                err.message ||
                'Login failed. Please check your credentials.';

            setError(message);
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 px-4 py-10">
            <div className="w-full max-w-md">

                {/* Header */}
                <div className="text-center mb-8">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-600 text-3xl font-bold text-white shadow-lg">
                        C
                    </div>

                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                        Welcome back
                    </h1>

                    <p className="mt-2 text-slate-500 dark:text-slate-400">
                        Sign in to your CampusCare account
                    </p>
                </div>

                {/* Card */}
                <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-xl dark:border-slate-800 dark:bg-slate-900">

                    <h2 className="mb-6 text-xl font-semibold text-slate-900 dark:text-white">
                        {role === 'admin'
                            ? 'Admin Login'
                            : role === 'staff'
                            ? 'Staff Login'
                            : 'Student Login'}
                    </h2>

                    {/* Error */}
                    {error && (
                        <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>

                        {/* Email */}
                        <div className="mb-5">
                            <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                                Email address
                            </label>

                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter your email"
                                autoComplete="email"
                                required
                                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                            />
                        </div>

                        {/* Password */}
                        <div className="mb-5">
                            <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                                Password
                            </label>

                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter your password"
                                autoComplete="current-password"
                                required
                                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                            />
                        </div>

                        {/* Role */}
                        <div className="mb-6">
                            <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                                Login as
                            </label>

                            <select
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                            >
                                <option value="student">Student</option>
                                <option value="staff">Staff</option>
                                <option value="admin">Administrator</option>
                            </select>
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full rounded-xl bg-indigo-600 px-4 py-3.5 font-semibold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {loading ? 'Signing in...' : 'Sign in'}
                        </button>
                    </form>

                    {/* Register */}
                    {role !== 'admin' && (
                        <button
                            type="button"
                            onClick={() => history.push('/register/student')}
                            className="mt-5 w-full text-sm font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
                        >
                            Don't have an account? Create one
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Login;