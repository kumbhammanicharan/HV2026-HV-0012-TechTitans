import React from 'react';
import { useHistory } from 'react-router-dom';

const roles = [
    {
        key: 'student',
        title: 'Student',
        description:
            'Submit complaints and track their progress.',
        icon: '🎓',
        login: '/login/student',
        register: '/register/student',
    },
    {
        key: 'staff',
        title: 'Technician',
        description:
            'Manage assigned complaints and update progress.',
        icon: '🛠️',
        login: '/login/staff',
        register: '/register/staff',
    },
    {
        key: 'admin',
        title: 'Administrator',
        description:
            'Manage complaints, staff assignments and analytics.',
        icon: '📊',
        login: '/login/admin',
    },
];

const CenterPage = () => {
    const history = useHistory();

    return (
        <div className="min-h-[calc(100vh-72px)] bg-slate-50 px-4 py-12 dark:bg-slate-950 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-6xl">

                <div className="mx-auto max-w-3xl text-center">
                    <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-700 dark:border-indigo-500/20 dark:bg-indigo-500/10 dark:text-indigo-400">
                        ✦ CampusCare Platform
                    </div>

                    <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white sm:text-5xl">
                        Welcome to{' '}
                        <span className="text-indigo-600 dark:text-indigo-400">
                            CampusCare
                        </span>
                    </h1>

                    <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-slate-600 dark:text-slate-400">
                        A modern campus complaint and resolution platform
                        designed to connect students, technicians and
                        administrators.
                    </p>
                </div>

                <div className="mt-12 grid gap-6 md:grid-cols-3">
                    {roles.map((role) => (
                        <div
                            key={role.key}
                            className="group rounded-3xl border border-slate-200 bg-white p-7 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl dark:border-slate-800 dark:bg-slate-900"
                        >
                            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-3xl transition-transform duration-300 group-hover:scale-110 dark:bg-indigo-500/10">
                                {role.icon}
                            </div>

                            <h2 className="mt-6 text-2xl font-bold text-slate-900 dark:text-white">
                                {role.title}
                            </h2>

                            <p className="mt-3 min-h-[56px] text-sm leading-6 text-slate-600 dark:text-slate-400">
                                {role.description}
                            </p>

                            <div className="mt-7 space-y-3">
                                <button
                                    type="button"
                                    onClick={() =>
                                        history.push(role.login)
                                    }
                                    className="w-full rounded-xl bg-indigo-600 px-5 py-3 font-bold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-700"
                                >
                                    {role.title} Login
                                </button>

                                {role.register && (
                                    <button
                                        type="button"
                                        onClick={() =>
                                            history.push(
                                                role.register
                                            )
                                        }
                                        className="w-full rounded-xl border border-slate-300 px-5 py-3 font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                                    >
                                        Create Account
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-12 rounded-3xl border border-indigo-100 bg-gradient-to-r from-indigo-600 to-violet-600 p-8 text-center text-white shadow-xl sm:p-10">
                    <h2 className="text-2xl font-bold sm:text-3xl">
                        One platform. One transparent workflow.
                    </h2>

                    <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-indigo-100 sm:text-base">
                        Report an issue, follow its progress, and help create
                        a better campus experience.
                    </p>
                </div>

            </div>
        </div>
    );
};

export default CenterPage;