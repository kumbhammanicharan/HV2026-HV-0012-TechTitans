import React, { useRef, useState } from 'react';
import axios from 'axios';
import { useHistory } from 'react-router-dom';

const ComplaintForm = () => {
    const history = useHistory();
    const fileInputRef = useRef(null);

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('');
    const [dueInDays, setDueInDays] = useState(1);
    const [image, setImage] = useState(null);

    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const categories = [
        'Hostel',
        'Transport',
        'Mess',
        'Maintenance',
        'Classroom',
        'Lab',
        'Canteen',
        'Electrical',
        'Plumbing',
        'Other',
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();

        setSuccess('');
        setError('');

        const token = localStorage.getItem('token');

        if (!token) {
            setError(
                'Your session has expired. Please login again.'
            );
            return;
        }

        if (!title.trim() || !description.trim() || !category) {
            setError(
                'Please complete all required fields.'
            );
            return;
        }

        setLoading(true);

        try {
            const formData = new FormData();

            formData.append('title', title.trim());
            formData.append(
                'description',
                description.trim()
            );
            formData.append('category', category);
            formData.append('dueInDays', dueInDays);

            if (image) {
                formData.append('image', image);
            }

            /*
             * IMPORTANT:
             * Do not use the old Render URL here.
             * The package.json proxy sends /api requests
             * to http://localhost:5000.
             */
            const response = await axios.post(
                '/api/complaints',
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            console.log(
                'Complaint created:',
                response.data
            );

            setSuccess(
                'Complaint submitted successfully!'
            );

            setTitle('');
            setDescription('');
            setCategory('');
            setDueInDays(1);
            setImage(null);

            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }

            /*
             * Give the user a moment to see success,
             * then show My Complaints.
             */
            setTimeout(() => {
                history.push('/my-complaints');
            }, 1200);
        } catch (err) {
            console.error(
                'Complaint submission error:',
                err
            );

            setError(
                err.response?.data?.message ||
                'Failed to submit complaint. Please try again.'
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[calc(100vh-72px)] bg-slate-50 px-4 py-10 dark:bg-slate-950 sm:px-6">
            <div className="mx-auto max-w-5xl">

                {/* Header */}
                <div className="mb-8">
                    <button
                        type="button"
                        onClick={() =>
                            history.push('/')
                        }
                        className="mb-5 text-sm font-semibold text-slate-500 transition hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400"
                    >
                        ← Back to Home
                    </button>

                    <div className="flex items-center gap-4">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600 text-2xl text-white shadow-lg shadow-indigo-600/20">
                            📝
                        </div>

                        <div>
                            <h1 className="text-3xl font-black text-slate-900 dark:text-white">
                                Submit a Complaint
                            </h1>

                            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                Tell us what needs attention and
                                we'll route it to the appropriate team.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Alerts */}
                {error && (
                    <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
                        <div className="flex gap-3">
                            <span>⚠️</span>
                            <span>{error}</span>
                        </div>
                    </div>
                )}

                {success && (
                    <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-medium text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-300">
                        <div className="flex gap-3">
                            <span>✓</span>
                            <span>{success}</span>
                        </div>
                    </div>
                )}

                <div className="grid gap-6 lg:grid-cols-3">

                    {/* Form */}
                    <div className="lg:col-span-2">
                        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-8">

                            <form onSubmit={handleSubmit}>

                                {/* Title */}
                                <div className="mb-6">
                                    <label className="mb-2 block text-sm font-bold text-slate-700 dark:text-slate-300">
                                        Complaint Title
                                    </label>

                                    <input
                                        type="text"
                                        value={title}
                                        onChange={(e) =>
                                            setTitle(
                                                e.target.value
                                            )
                                        }
                                        placeholder="Example: Water leakage in hostel room"
                                        className="input-field"
                                        maxLength={150}
                                        required
                                    />

                                    <p className="mt-1 text-right text-xs text-slate-400">
                                        {title.length}/150
                                    </p>
                                </div>

                                {/* Description */}
                                <div className="mb-6">
                                    <label className="mb-2 block text-sm font-bold text-slate-700 dark:text-slate-300">
                                        Description
                                    </label>

                                    <textarea
                                        value={description}
                                        onChange={(e) =>
                                            setDescription(
                                                e.target.value
                                            )
                                        }
                                        placeholder="Describe the issue clearly. Include the location and any useful details."
                                        rows={6}
                                        className="input-field resize-none"
                                        maxLength={1500}
                                        required
                                    />

                                    <p className="mt-1 text-right text-xs text-slate-400">
                                        {description.length}/1500
                                    </p>
                                </div>

                                <div className="grid gap-6 sm:grid-cols-2">

                                    {/* Category */}
                                    <div>
                                        <label className="mb-2 block text-sm font-bold text-slate-700 dark:text-slate-300">
                                            Category
                                        </label>

                                        <select
                                            value={category}
                                            onChange={(e) =>
                                                setCategory(
                                                    e.target.value
                                                )
                                            }
                                            className="select-field"
                                            required
                                        >
                                            <option value="">
                                                Select category
                                            </option>

                                            {categories.map(
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

                                    {/* Due */}
                                    <div>
                                        <label className="mb-2 block text-sm font-bold text-slate-700 dark:text-slate-300">
                                            Expected Resolution
                                        </label>

                                        <select
                                            value={dueInDays}
                                            onChange={(e) =>
                                                setDueInDays(
                                                    Number(
                                                        e.target.value
                                                    )
                                                )
                                            }
                                            className="select-field"
                                        >
                                            <option value={1}>
                                                Within 1 day
                                            </option>

                                            <option value={2}>
                                                Within 2 days
                                            </option>

                                            <option value={3}>
                                                More than 2 days
                                            </option>
                                        </select>
                                    </div>
                                </div>

                                {/* Image */}
                                <div className="mt-6">
                                    <label className="mb-2 block text-sm font-bold text-slate-700 dark:text-slate-300">
                                        Attach Image
                                        <span className="ml-2 font-normal text-slate-400">
                                            (optional)
                                        </span>
                                    </label>

                                    <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 px-6 py-8 transition hover:border-indigo-400 hover:bg-indigo-50/50 dark:border-slate-700 dark:bg-slate-800/50 dark:hover:border-indigo-500 dark:hover:bg-indigo-500/5">
                                        <div className="text-3xl">
                                            📷
                                        </div>

                                        <p className="mt-3 text-sm font-semibold text-slate-700 dark:text-slate-300">
                                            {image
                                                ? image.name
                                                : 'Click to upload an image'}
                                        </p>

                                        <p className="mt-1 text-xs text-slate-400">
                                            PNG, JPG or JPEG
                                        </p>

                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept="image/png,image/jpeg,image/jpg"
                                            className="hidden"
                                            onChange={(e) =>
                                                setImage(
                                                    e.target
                                                        .files?.[0] ||
                                                    null
                                                )
                                            }
                                        />
                                    </label>
                                </div>

                                {/* Submit */}
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="mt-7 w-full rounded-xl bg-indigo-600 px-5 py-3.5 font-bold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {loading
                                        ? 'Submitting Complaint...'
                                        : 'Submit Complaint'}
                                </button>

                            </form>
                        </div>
                    </div>

                    {/* Side information */}
                    <div className="space-y-5">

                        <div className="rounded-3xl border border-indigo-100 bg-indigo-50 p-6 dark:border-indigo-500/20 dark:bg-indigo-500/10">
                            <div className="text-2xl">
                                💡
                            </div>

                            <h3 className="mt-4 font-bold text-slate-900 dark:text-white">
                                Helpful Tips
                            </h3>

                            <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-600 dark:text-slate-400">
                                <li>
                                    ✓ Use a clear complaint title.
                                </li>
                                <li>
                                    ✓ Mention the exact location.
                                </li>
                                <li>
                                    ✓ Explain the problem clearly.
                                </li>
                                <li>
                                    ✓ Attach a photo when useful.
                                </li>
                            </ul>
                        </div>

                        <div className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
                            <div className="text-2xl">
                                🔄
                            </div>

                            <h3 className="mt-4 font-bold text-slate-900 dark:text-white">
                                What happens next?
                            </h3>

                            <div className="mt-5 space-y-4">
                                <div className="flex gap-3">
                                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400">
                                        1
                                    </div>

                                    <p className="text-sm text-slate-500 dark:text-slate-400">
                                        Your complaint is submitted.
                                    </p>
                                </div>

                                <div className="flex gap-3">
                                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400">
                                        2
                                    </div>

                                    <p className="text-sm text-slate-500 dark:text-slate-400">
                                        An administrator reviews it.
                                    </p>
                                </div>

                                <div className="flex gap-3">
                                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400">
                                        3
                                    </div>

                                    <p className="text-sm text-slate-500 dark:text-slate-400">
                                        It can be assigned to a technician.
                                    </p>
                                </div>

                                <div className="flex gap-3">
                                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
                                        ✓
                                    </div>

                                    <p className="text-sm text-slate-500 dark:text-slate-400">
                                        You can track the resolution.
                                    </p>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default ComplaintForm;