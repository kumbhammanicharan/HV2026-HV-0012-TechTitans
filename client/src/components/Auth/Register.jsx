import React, { useState } from 'react';
import axios from 'axios';
import { Link, useHistory, useParams } from 'react-router-dom';

const departments = [
    'Computer Science',
    'Information Technology',
    'Artificial Intelligence & Data Science',
    'Electronics & Communication',
    'Electrical Engineering',
    'Mechanical Engineering',
    'Civil Engineering',
    'Other',
];

const staffDepartments = [
    'Hostel',
    'Transport',
    'Mess',
    'Maintenance',
    'Electrical',
    'Plumbing',
    'Housekeeping',
    'Other',
];

const Register = () => {
    const history = useHistory();
    const { role: routeRole } = useParams();

    const initialRole =
        routeRole === 'staff'
            ? 'staff'
            : 'student';

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [role, setRole] = useState(initialRole);
    const [department, setDepartment] = useState('');

    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError('');
        setSuccess('');

        if (
            !name.trim() ||
            !email.trim() ||
            !password.trim() ||
            !department.trim()
        ) {
            setError(
                'Please complete all required fields.'
            );
            return;
        }

        if (password.length < 6) {
            setError(
                'Password must contain at least 6 characters.'
            );
            return;
        }

        setLoading(true);

        try {
            await axios.post(
                'https://campuscare-backend-jq45.onrender.com/api/auth/register',
                {
                    email: email.trim(),
                    password,
                    name: name.trim(),
                    role,
                    department: department.trim(),
                }
            );

            setSuccess(
                'Account created successfully! Redirecting to login...'
            );

            setTimeout(() => {
                history.push(`/login/${role}`);
            }, 1000);
        } catch (err) {
            console.error(
                'Registration error:',
                err
            );

            setError(
                err.response?.data?.message ||
                'Registration failed. Please try again.'
            );
        } finally {
            setLoading(false);
        }
    };

    const currentDepartments =
        role === 'student'
            ? departments
            : staffDepartments;

    return (
        <div className="min-h-[calc(100vh-72px)] bg-slate-50 px-4 py-10 dark:bg-slate-950 sm:px-6">
            <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-2">

                {/* Information */}
                <div className="hidden lg:block">
                    <div className="max-w-xl">
                        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-700 dark:border-indigo-500/20 dark:bg-indigo-500/10 dark:text-indigo-400">
                            ✦ Join CampusCare
                        </div>

                        <h1 className="text-5xl font-black leading-tight tracking-tight text-slate-900 dark:text-white">
                            Create your{' '}
                            <span className="text-indigo-600 dark:text-indigo-400">
                                CampusCare
                            </span>{' '}
                            account.
                        </h1>

                        <p className="mt-6 text-lg leading-8 text-slate-600 dark:text-slate-400">
                            Join a transparent campus complaint
                            management platform where issues can
                            be reported, assigned, tracked and
                            resolved efficiently.
                        </p>

                        <div className="mt-8 space-y-4">
                            <div className="flex items-start gap-4">
                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-500/10">
                                    📝
                                </div>

                                <div>
                                    <h3 className="font-bold text-slate-900 dark:text-white">
                                        Submit issues easily
                                    </h3>

                                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                        Report campus problems in
                                        just a few steps.
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-500/10">
                                    📍
                                </div>

                                <div>
                                    <h3 className="font-bold text-slate-900 dark:text-white">
                                        Track progress
                                    </h3>

                                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                        Stay informed about every
                                        update.
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-100 dark:bg-violet-500/10">
                                    🤝
                                </div>

                                <div>
                                    <h3 className="font-bold text-slate-900 dark:text-white">
                                        Better communication
                                    </h3>

                                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                        Connect students, technicians
                                        and administrators.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Registration Card */}
                <div className="mx-auto w-full max-w-lg">
                    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/50 dark:border-slate-800 dark:bg-slate-900 dark:shadow-black/20 sm:p-8">

                        <div className="mb-7 text-center">
                            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 text-3xl shadow-lg shadow-indigo-600/20">
                                {role === 'student'
                                    ? '🎓'
                                    : '🛠️'}
                            </div>

                            <h2 className="mt-5 text-2xl font-black text-slate-900 dark:text-white">
                                Create Account
                            </h2>

                            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                                Get started with CampusCare
                            </p>
                        </div>

                        {error && (
                            <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
                                {error}
                            </div>
                        )}

                        {success && (
                            <div className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-300">
                                {success}
                            </div>
                        )}

                        <form
                            onSubmit={handleSubmit}
                            autoComplete="off"
                        >
                            <div className="mb-4">
                                <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                                    Full Name
                                </label>

                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) =>
                                        setName(
                                            e.target.value
                                        )
                                    }
                                    placeholder="Enter your full name"
                                    className="input-field"
                                    autoComplete="name"
                                    required
                                />
                            </div>

                            <div className="mb-4">
                                <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                                    Email Address
                                </label>

                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) =>
                                        setEmail(
                                            e.target.value
                                        )
                                    }
                                    placeholder="you@example.com"
                                    className="input-field"
                                    autoComplete="email"
                                    required
                                />
                            </div>

                            <div className="mb-4">
                                <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                                    Password
                                </label>

                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) =>
                                        setPassword(
                                            e.target.value
                                        )
                                    }
                                    placeholder="Minimum 6 characters"
                                    className="input-field"
                                    autoComplete="new-password"
                                    minLength={6}
                                    required
                                />
                            </div>

                            <div className="mb-4">
                                <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                                    Account Type
                                </label>

                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setRole(
                                                'student'
                                            )
                                        }
                                        className={`rounded-xl border px-4 py-3 text-sm font-bold transition ${
                                            role === 'student'
                                                ? 'border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400'
                                                : 'border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800'
                                        }`}
                                    >
                                        🎓 Student
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setRole(
                                                'staff'
                                            )
                                        }
                                        className={`rounded-xl border px-4 py-3 text-sm font-bold transition ${
                                            role === 'staff'
                                                ? 'border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400'
                                                : 'border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800'
                                        }`}
                                    >
                                        🛠️ Technician
                                    </button>
                                </div>
                            </div>

                            <div className="mb-6">
                                <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                                    {role === 'student'
                                        ? 'Department'
                                        : 'Department / Service Area'}
                                </label>

                                <select
                                    value={department}
                                    onChange={(e) =>
                                        setDepartment(
                                            e.target.value
                                        )
                                    }
                                    className="select-field"
                                    required
                                >
                                    <option value="">
                                        Select an option
                                    </option>

                                    {currentDepartments.map(
                                        (item) => (
                                            <option
                                                key={item}
                                                value={item}
                                            >
                                                {item}
                                            </option>
                                        )
                                    )}
                                </select>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full rounded-xl bg-indigo-600 px-5 py-3.5 font-bold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {loading
                                    ? 'Creating Account...'
                                    : 'Create Account'}
                            </button>
                        </form>

                        <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
                            Already have an account?{' '}
                            <Link
                                to={`/login/${role}`}
                                className="font-bold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
                            >
                                Sign in
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;