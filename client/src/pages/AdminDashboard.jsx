import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import {
    Search,
    RefreshCw,
    Users,
    GraduationCap,
    Wrench,
    ClipboardList,
    Clock,
    CheckCircle2,
    AlertCircle,
    UserCheck,
    UserX,
    Ban,
    Unlock,
    Power,
    PowerOff,
    Trash2,
    UserPlus,
    Star,
    TrendingUp,
    BarChart3,
    MessageSquare,
    Filter,
    X,
    ChevronDown,
    ChevronUp,
    Activity,
    ShieldCheck,
    CalendarDays,
    Mail,
    Building2,
    Eye,
    Edit3,
    Save,
    XCircle
} from 'lucide-react';

import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    PieChart,
    Pie,
    Cell
} from 'recharts';


/*
|--------------------------------------------------------------------------
| API
|--------------------------------------------------------------------------
*/

const API_URL = 'http://localhost:5000/api';


/*
|--------------------------------------------------------------------------
| Axios helper
|--------------------------------------------------------------------------
*/

const getAuthHeaders = () => {
    const token = localStorage.getItem('token');

    return {
        headers: {
            Authorization: `Bearer ${token}`
        }
    };
};


/*
|--------------------------------------------------------------------------
| Small reusable components
|--------------------------------------------------------------------------
*/

const StatCard = ({
    title,
    value,
    subtitle,
    icon: Icon,
    iconClass = 'bg-blue-100 text-blue-600',
    darkIconClass = 'dark:bg-blue-900/30 dark:text-blue-400'
}) => {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-700 dark:bg-slate-800">

            <div className="flex items-start justify-between">

                <div>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                        {title}
                    </p>

                    <h3 className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">
                        {value}
                    </h3>

                    {subtitle && (
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                            {subtitle}
                        </p>
                    )}
                </div>

                <div
                    className={`rounded-xl p-3 ${iconClass} ${darkIconClass}`}
                >
                    <Icon size={22} />
                </div>

            </div>
        </div>
    );
};


const StatusBadge = ({ status }) => {

    const config = {
        pending: {
            text: 'Pending',
            className:
                'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
        },

        'in-progress': {
            text: 'In Progress',
            className:
                'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
        },

        resolved: {
            text: 'Resolved',
            className:
                'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
        }
    };

    const item =
        config[status] || {
            text: status || 'Unknown',
            className:
                'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
        };

    return (
        <span
            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${item.className}`}
        >
            {item.text}
        </span>
    );
};


const RatingStars = ({ rating = 0 }) => {

    const rounded = Math.round(Number(rating));

    return (
        <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
                <Star
                    key={star}
                    size={15}
                    className={
                        star <= rounded
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-slate-300 dark:text-slate-600'
                    }
                />
            ))}
        </div>
    );
};


const Modal = ({
    title,
    children,
    onClose,
    width = 'max-w-2xl'
}) => {

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">

            <div
                className={`max-h-[90vh] w-full ${width} overflow-y-auto rounded-2xl bg-white shadow-2xl dark:bg-slate-800`}
            >

                <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4 dark:border-slate-700 dark:bg-slate-800">

                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                        {title}
                    </h2>

                    <button
                        onClick={onClose}
                        className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700"
                    >
                        <X size={20} />
                    </button>

                </div>

                <div className="p-6">
                    {children}
                </div>

            </div>
        </div>
    );
};


/*
|--------------------------------------------------------------------------
| Main Dashboard
|--------------------------------------------------------------------------
*/

const AdminDashboard = () => {

    /*
    |--------------------------------------------------------------------------
    | Theme
    |--------------------------------------------------------------------------
    */

    const [darkMode, setDarkMode] = useState(
        localStorage.getItem('adminDarkMode') === 'true'
    );


    useEffect(() => {

        if (darkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }

        localStorage.setItem(
            'adminDarkMode',
            darkMode
        );

    }, [darkMode]);


    /*
    |--------------------------------------------------------------------------
    | State
    |--------------------------------------------------------------------------
    */

    const [activeTab, setActiveTab] =
        useState('overview');

    const [complaints, setComplaints] =
        useState([]);

    const [students, setStudents] =
        useState([]);

    const [staff, setStaff] =
        useState([]);

    const [performance, setPerformance] =
        useState([]);

    const [performanceSummary, setPerformanceSummary] =
        useState({});

    const [complaintStats, setComplaintStats] =
        useState({
            total: 0,
            pending: 0,
            inProgress: 0,
            resolved: 0,
            avgResponseTime: 0
        });

    const [userStats, setUserStats] =
        useState({
            total: 0,
            students: 0,
            staff: 0,
            blocked: 0,
            active: 0,
            inactive: 0
        });

    const [loading, setLoading] =
        useState(true);

    const [refreshing, setRefreshing] =
        useState(false);

    const [error, setError] =
        useState('');

    const [success, setSuccess] =
        useState('');

    const [searchTerm, setSearchTerm] =
        useState('');

    const [statusFilter, setStatusFilter] =
        useState('all');

    const [categoryFilter, setCategoryFilter] =
        useState('all');

    const [selectedComplaint, setSelectedComplaint] =
        useState(null);

    const [selectedTechnician, setSelectedTechnician] =
        useState(null);

    const [showAssignModal, setShowAssignModal] =
        useState(false);

    const [showComplaintModal, setShowComplaintModal] =
        useState(false);

    const [showTechnicianModal, setShowTechnicianModal] =
        useState(false);

    const [showUserModal, setShowUserModal] =
        useState(false);

    const [selectedUser, setSelectedUser] =
        useState(null);

    const [assigning, setAssigning] =
        useState(false);

    const [selectedStaffId, setSelectedStaffId] =
        useState('');

    const [newStatus, setNewStatus] =
        useState('');

    const [resolutionNotes, setResolutionNotes] =
        useState('');

    const [userSearch, setUserSearch] =
        useState('');

    const [userRoleFilter, setUserRoleFilter] =
        useState('all');

    const [expandedTechnician, setExpandedTechnician] =
        useState(null);


    /*
    |--------------------------------------------------------------------------
    | Fetch complaints
    |--------------------------------------------------------------------------
    */

    const fetchComplaints = async () => {

        try {

            const response =
                await axios.get(
                    `${API_URL}/complaints`,
                    getAuthHeaders()
                );

            const data = response.data || {};

            const allComplaints = [
                ...(data.pending || []),
                ...(data.inProgress || []),
                ...(data.resolved || [])
            ];

            setComplaints(
                allComplaints
            );

        } catch (err) {

            console.error(
                'Complaint loading error:',
                err
            );

            throw err;
        }
    };


    /*
    |--------------------------------------------------------------------------
    | Fetch staff
    |--------------------------------------------------------------------------
    */

    const fetchStaff = async () => {

        try {

            const response =
                await axios.get(
                    `${API_URL}/auth/staff`,
                    getAuthHeaders()
                );

            setStaff(
                Array.isArray(response.data)
                    ? response.data
                    : []
            );

        } catch (err) {

            console.error(
                'Staff loading error:',
                err
            );

            throw err;
        }
    };


    /*
    |--------------------------------------------------------------------------
    | Fetch users
    |--------------------------------------------------------------------------
    */

    const fetchUsers = async () => {

        try {

            const response =
                await axios.get(
                    `${API_URL}/admin/users`,
                    getAuthHeaders()
                );

            const users =
                response.data?.users || [];

            setStudents(
                users.filter(
                    (user) =>
                        user.role === 'student'
                )
            );

        } catch (err) {

            console.error(
                'User loading error:',
                err
            );

            throw err;
        }
    };


    /*
    |--------------------------------------------------------------------------
    | Fetch technician performance
    |--------------------------------------------------------------------------
    */

    const fetchPerformance = async () => {

        try {

            const response =
                await axios.get(
                    `${API_URL}/admin/technicians/performance`,
                    getAuthHeaders()
                );

            setPerformance(
                response.data?.technicians || []
            );

            setPerformanceSummary(
                response.data?.summary || {}
            );

        } catch (err) {

            console.error(
                'Performance loading error:',
                err
            );

            throw err;
        }
    };


    /*
    |--------------------------------------------------------------------------
    | Fetch complaint stats
    |--------------------------------------------------------------------------
    */

    const fetchComplaintStats = async () => {

        try {

            const response =
                await axios.get(
                    `${API_URL}/stats/complaints`
                );

            setComplaintStats(
                response.data || {}
            );

        } catch (err) {

            console.error(
                'Complaint stats error:',
                err
            );
        }
    };


    /*
    |--------------------------------------------------------------------------
    | Fetch user stats
    |--------------------------------------------------------------------------
    */

    const fetchUserStats = async () => {

        try {

            const response =
                await axios.get(
                    `${API_URL}/auth/stats`
                );

            setUserStats(
                response.data || {}
            );

        } catch (err) {

            console.error(
                'User stats error:',
                err
            );
        }
    };


    /*
    |--------------------------------------------------------------------------
    | Load dashboard
    |--------------------------------------------------------------------------
    */

    const loadDashboard = async (
        showSpinner = true
    ) => {

        try {

            if (showSpinner) {
                setLoading(true);
            } else {
                setRefreshing(true);
            }

            setError('');

            await Promise.all([
                fetchComplaints(),
                fetchStaff(),
                fetchUsers(),
                fetchPerformance(),
                fetchComplaintStats(),
                fetchUserStats()
            ]);

        } catch (err) {

            console.error(
                'Dashboard loading error:',
                err
            );

            const message =
                err.response?.data?.message ||
                'Unable to load admin dashboard.';

            setError(message);

        } finally {

            setLoading(false);
            setRefreshing(false);
        }
    };


    useEffect(() => {
        loadDashboard();
    }, []);


    /*
    |--------------------------------------------------------------------------
    | Success message helper
    |--------------------------------------------------------------------------
    */

    const showSuccess = (message) => {

        setSuccess(message);

        setTimeout(() => {
            setSuccess('');
        }, 4000);
    };


    /*
    |--------------------------------------------------------------------------
    | Complaint filtering
    |--------------------------------------------------------------------------
    */

    const categories = useMemo(() => {

        const values =
            complaints
                .map(
                    (complaint) =>
                        complaint.category
                )
                .filter(Boolean);

        return [
            ...new Set(values)
        ];

    }, [complaints]);


    const filteredComplaints =
        useMemo(() => {

            return complaints.filter(
                (complaint) => {

                    const search =
                        searchTerm
                            .toLowerCase()
                            .trim();

                    const matchesSearch =
                        !search ||
                        complaint.title
                            ?.toLowerCase()
                            .includes(search) ||
                        complaint.description
                            ?.toLowerCase()
                            .includes(search) ||
                        complaint.raisedBy?.name
                            ?.toLowerCase()
                            .includes(search) ||
                        complaint.raisedBy?.email
                            ?.toLowerCase()
                            .includes(search) ||
                        complaint.assignedTo?.name
                            ?.toLowerCase()
                            .includes(search);

                    const matchesStatus =
                        statusFilter === 'all' ||
                        complaint.status ===
                            statusFilter;

                    const matchesCategory =
                        categoryFilter === 'all' ||
                        complaint.category ===
                            categoryFilter;

                    return (
                        matchesSearch &&
                        matchesStatus &&
                        matchesCategory
                    );
                }
            );

        }, [
            complaints,
            searchTerm,
            statusFilter,
            categoryFilter
        ]);


    /*
    |--------------------------------------------------------------------------
    | Assign complaint
    |--------------------------------------------------------------------------
    */

    const openAssignModal = (
        complaint
    ) => {

        setSelectedComplaint(
            complaint
        );

        setSelectedStaffId(
            complaint.assignedTo?._id ||
            complaint.assignedTo ||
            ''
        );

        setShowAssignModal(true);
    };


    const assignComplaint = async () => {

        if (!selectedComplaint) {
            return;
        }

        if (!selectedStaffId) {

            setError(
                'Please select a technician.'
            );

            return;
        }

        try {

            setAssigning(true);
            setError('');

            await axios.put(
                `${API_URL}/complaints/${selectedComplaint._id}/assign`,
                {
                    staffId:
                        selectedStaffId
                },
                getAuthHeaders()
            );

            setShowAssignModal(false);

            setSelectedComplaint(null);

            setSelectedStaffId('');

            showSuccess(
                'Complaint assigned successfully.'
            );

            await loadDashboard(false);

        } catch (err) {

            console.error(
                'Assignment error:',
                err
            );

            setError(
                err.response?.data?.message ||
                'Failed to assign complaint.'
            );

        } finally {

            setAssigning(false);
        }
    };


    /*
    |--------------------------------------------------------------------------
    | Update complaint status
    |--------------------------------------------------------------------------
    */

    const openComplaintModal = (
        complaint
    ) => {

        setSelectedComplaint(
            complaint
        );

        setNewStatus(
            complaint.status
        );

        setResolutionNotes(
            complaint.resolutionNotes ||
                ''
        );

        setShowComplaintModal(true);
    };


    const updateComplaintStatus =
        async () => {

            if (!selectedComplaint) {
                return;
            }

            try {

                setError('');

                await axios.put(
                    `${API_URL}/complaints/${selectedComplaint._id}/status`,
                    {
                        status: newStatus,
                        resolutionNotes
                    },
                    getAuthHeaders()
                );

                setShowComplaintModal(
                    false
                );

                showSuccess(
                    'Complaint status updated successfully.'
                );

                await loadDashboard(false);

            } catch (err) {

                console.error(
                    'Status update error:',
                    err
                );

                setError(
                    err.response?.data?.message ||
                    'Failed to update complaint.'
                );
            }
        };


    /*
    |--------------------------------------------------------------------------
    | Block / unblock user
    |--------------------------------------------------------------------------
    */

    const blockUser = async (
        user
    ) => {

        const reason =
            window.prompt(
                `Why are you blocking ${user.name}?`,
                'Blocked by administrator.'
            );

        if (reason === null) {
            return;
        }

        try {

            await axios.put(
                `${API_URL}/admin/users/${user._id}/block`,
                {
                    reason
                },
                getAuthHeaders()
            );

            showSuccess(
                `${user.name} has been blocked.`
            );

            await loadDashboard(false);

        } catch (err) {

            console.error(
                'Block error:',
                err
            );

            setError(
                err.response?.data?.message ||
                'Unable to block user.'
            );
        }
    };


    const unblockUser = async (
        user
    ) => {

        if (
            !window.confirm(
                `Unblock ${user.name}?`
            )
        ) {
            return;
        }

        try {

            await axios.put(
                `${API_URL}/admin/users/${user._id}/unblock`,
                {},
                getAuthHeaders()
            );

            showSuccess(
                `${user.name} has been unblocked.`
            );

            await loadDashboard(false);

        } catch (err) {

            console.error(
                'Unblock error:',
                err
            );

            setError(
                err.response?.data?.message ||
                'Unable to unblock user.'
            );
        }
    };


    /*
    |--------------------------------------------------------------------------
    | Activate / deactivate
    |--------------------------------------------------------------------------
    */

    const toggleActive = async (
        user
    ) => {

        const action =
            user.isActive
                ? 'deactivate'
                : 'activate';

        if (
            !window.confirm(
                `Are you sure you want to ${action} ${user.name}?`
            )
        ) {
            return;
        }

        try {

            await axios.put(
                `${API_URL}/admin/users/${user._id}/${action}`,
                {},
                getAuthHeaders()
            );

            showSuccess(
                `${user.name} has been ${action}d.`
            );

            await loadDashboard(false);

        } catch (err) {

            console.error(
                'Account status error:',
                err
            );

            setError(
                err.response?.data?.message ||
                'Unable to update account.'
            );
        }
    };


    /*
    |--------------------------------------------------------------------------
    | Delete user
    |--------------------------------------------------------------------------
    */

    const deleteUser = async (
        user
    ) => {

        if (
            !window.confirm(
                `Delete ${user.name}'s account permanently?\n\nThis action cannot be undone.`
            )
        ) {
            return;
        }

        try {

            await axios.delete(
                `${API_URL}/admin/users/${user._id}`,
                getAuthHeaders()
            );

            showSuccess(
                `${user.name} has been deleted.`
            );

            setShowUserModal(
                false
            );

            await loadDashboard(false);

        } catch (err) {

            console.error(
                'Delete user error:',
                err
            );

            setError(
                err.response?.data?.message ||
                'Unable to delete user.'
            );
        }
    };


    /*
    |--------------------------------------------------------------------------
    | User list
    |--------------------------------------------------------------------------
    */

    const allManagedUsers =
        useMemo(() => {

            const users = [
                ...students,
                ...staff
            ];

            return users.filter(
                (user) => {

                    const search =
                        userSearch
                            .toLowerCase()
                            .trim();

                    const matchesSearch =
                        !search ||
                        user.name
                            ?.toLowerCase()
                            .includes(search) ||
                        user.email
                            ?.toLowerCase()
                            .includes(search) ||
                        user.department
                            ?.toLowerCase()
                            .includes(search);

                    const matchesRole =
                        userRoleFilter ===
                            'all' ||
                        user.role ===
                            userRoleFilter;

                    return (
                        matchesSearch &&
                        matchesRole
                    );
                }
            );

        }, [
            students,
            staff,
            userSearch,
            userRoleFilter
        ]);


    /*
    |--------------------------------------------------------------------------
    | Charts
    |--------------------------------------------------------------------------
    */

    const complaintChartData = [
        {
            name: 'Pending',
            value:
                Number(
                    complaintStats.pending || 0
                )
        },
        {
            name: 'In Progress',
            value:
                Number(
                    complaintStats.inProgress ||
                        0
                )
        },
        {
            name: 'Resolved',
            value:
                Number(
                    complaintStats.resolved || 0
                )
        }
    ];


    const technicianChartData =
        performance
            .slice(0, 8)
            .map((item) => ({
                name:
                    item.technician.name
                        ?.split(' ')
                        .slice(0, 2)
                        .join(' ') ||
                    'Technician',

                resolved:
                    item.complaints.resolved,

                assigned:
                    item.complaints.total
            }));


    /*
    |--------------------------------------------------------------------------
    | Loading
    |--------------------------------------------------------------------------
    */

    if (loading) {

        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">

                <div className="text-center">

                    <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />

                    <p className="font-medium text-slate-600 dark:text-slate-300">
                        Loading admin dashboard...
                    </p>

                </div>

            </div>
        );
    }


    /*
    |--------------------------------------------------------------------------
    | Render
    |--------------------------------------------------------------------------
    */

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 transition-colors dark:bg-slate-950 dark:text-white">

            {/* Header */}

            <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur dark:border-slate-800 dark:bg-slate-900/95">

                <div className="mx-auto flex max-w-[1600px] items-center justify-between px-4 py-4 sm:px-6 lg:px-8">

                    <div>

                        <div className="flex items-center gap-3">

                            <div className="rounded-xl bg-blue-600 p-2.5 text-white shadow-lg shadow-blue-600/20">
                                <ShieldCheck size={24} />
                            </div>

                            <div>
                                <h1 className="text-xl font-bold sm:text-2xl">
                                    Admin Control Center
                                </h1>

                                <p className="text-xs text-slate-500 dark:text-slate-400 sm:text-sm">
                                    Complaint management & technician performance
                                </p>
                            </div>

                        </div>

                    </div>


                    <div className="flex items-center gap-2">

                        <button
                            onClick={() =>
                                loadDashboard(false)
                            }
                            disabled={refreshing}
                            className="rounded-xl border border-slate-200 bg-white p-2.5 text-slate-600 shadow-sm hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                            title="Refresh"
                        >
                            <RefreshCw
                                size={19}
                                className={
                                    refreshing
                                        ? 'animate-spin'
                                        : ''
                                }
                            />
                        </button>


                        <button
                            onClick={() =>
                                setDarkMode(
                                    !darkMode
                                )
                            }
                            className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium shadow-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700"
                        >
                            {darkMode
                                ? '☀️ Light'
                                : '🌙 Dark'}
                        </button>

                    </div>

                </div>

            </header>


            <main className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8">


                {/* Alerts */}

                {error && (
                    <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">

                        <AlertCircle
                            size={20}
                            className="mt-0.5 shrink-0"
                        />

                        <div className="flex-1">
                            <p className="font-medium">
                                {error}
                            </p>
                        </div>

                        <button
                            onClick={() =>
                                setError('')
                            }
                        >
                            <X size={18} />
                        </button>

                    </div>
                )}


                {success && (
                    <div className="mb-5 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-300">

                        <CheckCircle2
                            size={20}
                        />

                        <p className="font-medium">
                            {success}
                        </p>

                    </div>
                )}


                {/* Navigation */}

                <div className="mb-6 overflow-x-auto">

                    <div className="inline-flex min-w-full gap-1 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-sm dark:border-slate-700 dark:bg-slate-800 sm:min-w-0">

                        {[
                            {
                                id: 'overview',
                                label: 'Overview',
                                icon: BarChart3
                            },
                            {
                                id: 'complaints',
                                label: 'Complaints',
                                icon: ClipboardList
                            },
                            {
                                id: 'technicians',
                                label: 'Technicians',
                                icon: Wrench
                            },
                            {
                                id: 'users',
                                label: 'Users',
                                icon: Users
                            }
                        ].map(
                            ({
                                id,
                                label,
                                icon: Icon
                            }) => (

                                <button
                                    key={id}
                                    onClick={() =>
                                        setActiveTab(
                                            id
                                        )
                                    }
                                    className={`flex items-center gap-2 whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                                        activeTab ===
                                        id
                                            ? 'bg-blue-600 text-white shadow-md'
                                            : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700'
                                    }`}
                                >
                                    <Icon
                                        size={17}
                                    />
                                    {label}
                                </button>

                            )
                        )}

                    </div>

                </div>


                {/* ======================================================
                    OVERVIEW
                ====================================================== */}

                {activeTab === 'overview' && (

                    <div className="space-y-6">

                        {/* Stats */}

                        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

                            <StatCard
                                title="Total Complaints"
                                value={
                                    complaintStats.total ||
                                    0
                                }
                                subtitle="All submitted complaints"
                                icon={
                                    ClipboardList
                                }
                                iconClass="bg-blue-100 text-blue-600"
                            />

                            <StatCard
                                title="Pending"
                                value={
                                    complaintStats.pending ||
                                    0
                                }
                                subtitle="Waiting for action"
                                icon={
                                    Clock
                                }
                                iconClass="bg-amber-100 text-amber-600"
                            />

                            <StatCard
                                title="In Progress"
                                value={
                                    complaintStats.inProgress ||
                                    0
                                }
                                subtitle="Currently being handled"
                                icon={
                                    Activity
                                }
                                iconClass="bg-indigo-100 text-indigo-600"
                            />

                            <StatCard
                                title="Resolved"
                                value={
                                    complaintStats.resolved ||
                                    0
                                }
                                subtitle="Successfully completed"
                                icon={
                                    CheckCircle2
                                }
                                iconClass="bg-emerald-100 text-emerald-600"
                            />

                        </div>


                        {/* User stats */}

                        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

                            <StatCard
                                title="Total Users"
                                value={
                                    userStats.total ||
                                    0
                                }
                                subtitle="Students + technicians"
                                icon={
                                    Users
                                }
                                iconClass="bg-violet-100 text-violet-600"
                            />

                            <StatCard
                                title="Students"
                                value={
                                    userStats.students ||
                                    students.length
                                }
                                subtitle="Registered students"
                                icon={
                                    GraduationCap
                                }
                                iconClass="bg-cyan-100 text-cyan-600"
                            />

                            <StatCard
                                title="Technicians"
                                value={
                                    userStats.staff ||
                                    staff.length
                                }
                                subtitle="Staff accounts"
                                icon={
                                    Wrench
                                }
                                iconClass="bg-orange-100 text-orange-600"
                            />

                            <StatCard
                                title="Average Rating"
                                value={`${performanceSummary.averageTechnicianRating || 0}/5`}
                                subtitle={`${performanceSummary.totalReviews || 0} student reviews`}
                                icon={
                                    Star
                                }
                                iconClass="bg-yellow-100 text-yellow-600"
                            />

                        </div>


                        {/* Charts */}

                        <div className="grid gap-6 lg:grid-cols-2">


                            {/* Complaint chart */}

                            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">

                                <div className="mb-5">

                                    <h2 className="font-bold">
                                        Complaint Status
                                    </h2>

                                    <p className="text-sm text-slate-500 dark:text-slate-400">
                                        Current complaint distribution
                                    </p>

                                </div>

                                <div className="h-[320px]">

                                    <ResponsiveContainer
                                        width="100%"
                                        height="100%"
                                    >

                                        <PieChart>

                                            <Pie
                                                data={
                                                    complaintChartData
                                                }
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={
                                                    75
                                                }
                                                outerRadius={
                                                    110
                                                }
                                                paddingAngle={
                                                    4
                                                }
                                                dataKey="value"
                                                label
                                            >

                                                <Cell fill="#f59e0b" />
                                                <Cell fill="#3b82f6" />
                                                <Cell fill="#10b981" />

                                            </Pie>

                                            <Tooltip />

                                            <Legend />

                                        </PieChart>

                                    </ResponsiveContainer>

                                </div>

                            </div>


                            {/* Technician chart */}

                            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">

                                <div className="mb-5">

                                    <h2 className="font-bold">
                                        Technician Workload
                                    </h2>

                                    <p className="text-sm text-slate-500 dark:text-slate-400">
                                        Assigned vs resolved complaints
                                    </p>

                                </div>

                                <div className="h-[320px]">

                                    <ResponsiveContainer
                                        width="100%"
                                        height="100%"
                                    >

                                        <BarChart
                                            data={
                                                technicianChartData
                                            }
                                        >

                                            <CartesianGrid
                                                strokeDasharray="3 3"
                                                className="opacity-30"
                                            />

                                            <XAxis
                                                dataKey="name"
                                                tick={{
                                                    fontSize: 11
                                                }}
                                            />

                                            <YAxis />

                                            <Tooltip />

                                            <Legend />

                                            <Bar
                                                dataKey="assigned"
                                                name="Assigned"
                                                fill="#6366f1"
                                                radius={[
                                                    6,
                                                    6,
                                                    0,
                                                    0
                                                ]}
                                            />

                                            <Bar
                                                dataKey="resolved"
                                                name="Resolved"
                                                fill="#10b981"
                                                radius={[
                                                    6,
                                                    6,
                                                    0,
                                                    0
                                                ]}
                                            />

                                        </BarChart>

                                    </ResponsiveContainer>

                                </div>

                            </div>

                        </div>


                        {/* Performance summary */}

                        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

                            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">

                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    Resolution Rate
                                </p>

                                <p className="mt-2 text-3xl font-bold">
                                    {performanceSummary.overallResolutionPercentage ||
                                        0}
                                    %
                                </p>

                                <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700">

                                    <div
                                        className="h-full rounded-full bg-emerald-500"
                                        style={{
                                            width: `${Math.min(
                                                100,
                                                performanceSummary.overallResolutionPercentage ||
                                                    0
                                            )}%`
                                        }}
                                    />

                                </div>

                            </div>


                            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">

                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    Avg Response
                                </p>

                                <p className="mt-2 text-3xl font-bold">
                                    {complaintStats.avgResponseTime ||
                                        0}
                                    h
                                </p>

                                <p className="mt-1 text-xs text-slate-500">
                                    Average first response
                                </p>

                            </div>


                            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">

                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    Active Technicians
                                </p>

                                <p className="mt-2 text-3xl font-bold">
                                    {performanceSummary.activeTechnicians ||
                                        0}
                                </p>

                                <p className="mt-1 text-xs text-slate-500">
                                    Available accounts
                                </p>

                            </div>


                            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">

                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    Blocked Accounts
                                </p>

                                <p className="mt-2 text-3xl font-bold text-red-600">
                                    {userStats.blocked ||
                                        performanceSummary.blockedTechnicians ||
                                        0}
                                </p>

                                <p className="mt-1 text-xs text-slate-500">
                                    Require admin attention
                                </p>

                            </div>

                        </div>

                    </div>
                )}


                {/* ======================================================
                    COMPLAINTS
                ====================================================== */}

                {activeTab === 'complaints' && (

                    <div className="space-y-5">

                        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">

                            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

                                <div>
                                    <h2 className="text-lg font-bold">
                                        Complaint Management
                                    </h2>

                                    <p className="text-sm text-slate-500 dark:text-slate-400">
                                        Assign, track and resolve complaints
                                    </p>
                                </div>


                                <div className="flex flex-wrap gap-2">

                                    <div className="relative">

                                        <Search
                                            size={17}
                                            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                                        />

                                        <input
                                            value={
                                                searchTerm
                                            }
                                            onChange={(
                                                e
                                            ) =>
                                                setSearchTerm(
                                                    e
                                                        .target
                                                        .value
                                                )
                                            }
                                            placeholder="Search complaints..."
                                            className="w-64 rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-blue-500 dark:border-slate-600 dark:bg-slate-900"
                                        />

                                    </div>


                                    <select
                                        value={
                                            statusFilter
                                        }
                                        onChange={(
                                            e
                                        ) =>
                                            setStatusFilter(
                                                e
                                                    .target
                                                    .value
                                            )
                                        }
                                        className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none dark:border-slate-600 dark:bg-slate-900"
                                    >

                                        <option value="all">
                                            All Status
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


                                    <select
                                        value={
                                            categoryFilter
                                        }
                                        onChange={(
                                            e
                                        ) =>
                                            setCategoryFilter(
                                                e
                                                    .target
                                                    .value
                                            )
                                        }
                                        className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none dark:border-slate-600 dark:bg-slate-900"
                                    >

                                        <option value="all">
                                            All Categories
                                        </option>

                                        {categories.map(
                                            (
                                                category
                                            ) => (
                                                <option
                                                    key={
                                                        category
                                                    }
                                                    value={
                                                        category
                                                    }
                                                >
                                                    {
                                                        category
                                                    }
                                                </option>
                                            )
                                        )}

                                    </select>

                                </div>

                            </div>

                        </div>


                        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">

                            <div className="overflow-x-auto">

                                <table className="w-full min-w-[1100px] text-left text-sm">

                                    <thead className="border-b border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-900">

                                        <tr>

                                            <th className="px-5 py-4 font-semibold">
                                                Complaint
                                            </th>

                                            <th className="px-5 py-4 font-semibold">
                                                Student
                                            </th>

                                            <th className="px-5 py-4 font-semibold">
                                                Category
                                            </th>

                                            <th className="px-5 py-4 font-semibold">
                                                Status
                                            </th>

                                            <th className="px-5 py-4 font-semibold">
                                                Technician
                                            </th>

                                            <th className="px-5 py-4 font-semibold">
                                                Date
                                            </th>

                                            <th className="px-5 py-4 text-right font-semibold">
                                                Actions
                                            </th>

                                        </tr>

                                    </thead>


                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700">

                                        {filteredComplaints.length ===
                                        0 ? (

                                            <tr>

                                                <td
                                                    colSpan="7"
                                                    className="px-5 py-12 text-center text-slate-500"
                                                >
                                                    <ClipboardList
                                                        size={
                                                            38
                                                        }
                                                        className="mx-auto mb-3 opacity-40"
                                                    />

                                                    No complaints found.
                                                </td>

                                            </tr>

                                        ) : (

                                            filteredComplaints.map(
                                                (
                                                    complaint
                                                ) => (

                                                    <tr
                                                        key={
                                                            complaint._id
                                                        }
                                                        className="hover:bg-slate-50 dark:hover:bg-slate-900/50"
                                                    >

                                                        <td className="px-5 py-4">

                                                            <button
                                                                onClick={() =>
                                                                    openComplaintModal(
                                                                        complaint
                                                                    )
                                                                }
                                                                className="max-w-[260px] text-left"
                                                            >

                                                                <p className="truncate font-semibold text-blue-600 dark:text-blue-400">
                                                                    {
                                                                        complaint.title
                                                                    }
                                                                </p>

                                                                <p className="mt-1 line-clamp-2 text-xs text-slate-500">
                                                                    {
                                                                        complaint.description
                                                                    }
                                                                </p>

                                                            </button>

                                                        </td>


                                                        <td className="px-5 py-4">

                                                            <p className="font-medium">
                                                                {
                                                                    complaint
                                                                        .raisedBy
                                                                        ?.name ||
                                                                    'Unknown'
                                                                }
                                                            </p>

                                                            <p className="text-xs text-slate-500">
                                                                {
                                                                    complaint
                                                                        .raisedBy
                                                                        ?.email
                                                                }
                                                            </p>

                                                        </td>


                                                        <td className="px-5 py-4">

                                                            <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium dark:bg-slate-700">
                                                                {
                                                                    complaint.category
                                                                }
                                                            </span>

                                                        </td>


                                                        <td className="px-5 py-4">

                                                            <StatusBadge
                                                                status={
                                                                    complaint.status
                                                                }
                                                            />

                                                        </td>


                                                        <td className="px-5 py-4">

                                                            {complaint.assignedTo ? (

                                                                <div>

                                                                    <p className="font-medium">
                                                                        {
                                                                            complaint
                                                                                .assignedTo
                                                                                .name
                                                                        }
                                                                    </p>

                                                                    <p className="text-xs text-slate-500">
                                                                        {
                                                                            complaint
                                                                                .assignedTo
                                                                                .department
                                                                        }
                                                                    </p>

                                                                </div>

                                                            ) : (

                                                                <span className="text-xs font-medium text-amber-600">
                                                                    Not assigned
                                                                </span>

                                                            )}

                                                        </td>


                                                        <td className="px-5 py-4 text-xs text-slate-500">

                                                            {complaint.date
                                                                ? new Date(
                                                                      complaint.date
                                                                  ).toLocaleDateString()
                                                                : '-'}

                                                        </td>


                                                        <td className="px-5 py-4">

                                                            <div className="flex justify-end gap-2">

                                                                <button
                                                                    onClick={() =>
                                                                        openAssignModal(
                                                                            complaint
                                                                        )
                                                                    }
                                                                    className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-700"
                                                                >
                                                                    <UserPlus
                                                                        size={
                                                                            14
                                                                        }
                                                                    />

                                                                    {complaint.assignedTo
                                                                        ? 'Reassign'
                                                                        : 'Assign'}
                                                                </button>


                                                                <button
                                                                    onClick={() =>
                                                                        openComplaintModal(
                                                                            complaint
                                                                        )
                                                                    }
                                                                    className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
                                                                    title="View / update"
                                                                >
                                                                    <Eye
                                                                        size={
                                                                            16
                                                                        }
                                                                    />
                                                                </button>

                                                            </div>

                                                        </td>

                                                    </tr>

                                                )
                                            )

                                        )}

                                    </tbody>

                                </table>

                            </div>

                        </div>

                    </div>
                )}


                {/* ======================================================
                    TECHNICIANS
                ====================================================== */}

                {activeTab === 'technicians' && (

                    <div className="space-y-6">

                        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">

                            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">

                                <div>

                                    <h2 className="text-lg font-bold">
                                        Technician Performance
                                    </h2>

                                    <p className="text-sm text-slate-500 dark:text-slate-400">
                                        Monitor workload, resolution rate and student ratings
                                    </p>

                                </div>

                                <div className="rounded-xl bg-blue-50 px-4 py-2 text-sm text-blue-700 dark:bg-blue-950/30 dark:text-blue-300">
                                    {performance.length}{' '}
                                    technicians
                                </div>

                            </div>

                        </div>


                        {/* Technician cards */}

                        <div className="grid gap-5 lg:grid-cols-2">

                            {performance.map(
                                (
                                    item,
                                    index
                                ) => {

                                    const technician =
                                        item.technician;

                                    const isExpanded =
                                        expandedTechnician ===
                                        technician.id;

                                    return (

                                        <div
                                            key={
                                                technician.id
                                            }
                                            className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800"
                                        >

                                            {/* Main */}

                                            <div className="p-5">

                                                <div className="flex items-start justify-between gap-4">

                                                    <div className="flex items-center gap-3">

                                                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-lg font-bold text-white">
                                                            {technician.name
                                                                ?.charAt(
                                                                    0
                                                                )
                                                                ?.toUpperCase() ||
                                                                'T'}
                                                        </div>

                                                        <div>

                                                            <div className="flex items-center gap-2">

                                                                <h3 className="font-bold">
                                                                    {
                                                                        technician.name
                                                                    }
                                                                </h3>

                                                                {index ===
                                                                    0 &&
                                                                    item.performanceScore >
                                                                        0 && (
                                                                        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
                                                                            TOP
                                                                        </span>
                                                                    )}

                                                            </div>

                                                            <p className="text-xs text-slate-500">
                                                                {
                                                                    technician.email
                                                                }
                                                            </p>

                                                            <p className="mt-1 text-xs text-slate-500">
                                                                {
                                                                    technician.department
                                                                }
                                                            </p>

                                                        </div>

                                                    </div>


                                                    <div className="text-right">

                                                        <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                                            {
                                                                item.performanceScore
                                                            }
                                                        </p>

                                                        <p className="text-[10px] uppercase tracking-wide text-slate-400">
                                                            Score
                                                        </p>

                                                    </div>

                                                </div>


                                                {/* Status */}

                                                <div className="mt-4 flex flex-wrap gap-2">

                                                    <span
                                                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                                                            technician.isBlocked
                                                                ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                                                                : technician.isActive
                                                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                                                                : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
                                                        }`}
                                                    >
                                                        {technician.isBlocked
                                                            ? 'Blocked'
                                                            : technician.isActive
                                                            ? 'Active'
                                                            : 'Inactive'}
                                                    </span>

                                                </div>


                                                {/* Metrics */}

                                                <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">

                                                    <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-900">

                                                        <p className="text-xs text-slate-500">
                                                            Assigned
                                                        </p>

                                                        <p className="mt-1 text-lg font-bold">
                                                            {
                                                                item.complaints
                                                                    .total
                                                            }
                                                        </p>

                                                    </div>


                                                    <div className="rounded-xl bg-amber-50 p-3 dark:bg-amber-900/10">

                                                        <p className="text-xs text-amber-600">
                                                            Pending
                                                        </p>

                                                        <p className="mt-1 text-lg font-bold">
                                                            {
                                                                item.complaints
                                                                    .pending
                                                            }
                                                        </p>

                                                    </div>


                                                    <div className="rounded-xl bg-blue-50 p-3 dark:bg-blue-900/10">

                                                        <p className="text-xs text-blue-600">
                                                            Active
                                                        </p>

                                                        <p className="mt-1 text-lg font-bold">
                                                            {
                                                                item.complaints
                                                                    .inProgress
                                                            }
                                                        </p>

                                                    </div>


                                                    <div className="rounded-xl bg-emerald-50 p-3 dark:bg-emerald-900/10">

                                                        <p className="text-xs text-emerald-600">
                                                            Resolved
                                                        </p>

                                                        <p className="mt-1 text-lg font-bold">
                                                            {
                                                                item.complaints
                                                                    .resolved
                                                            }
                                                        </p>

                                                    </div>

                                                </div>


                                                {/* Rating */}

                                                <div className="mt-4 flex items-center justify-between rounded-xl border border-slate-100 p-3 dark:border-slate-700">

                                                    <div>

                                                        <p className="text-xs text-slate-500">
                                                            Student Rating
                                                        </p>

                                                        <div className="mt-1 flex items-center gap-2">

                                                            <RatingStars
                                                                rating={
                                                                    item
                                                                        .reviews
                                                                        .averageRating
                                                                }
                                                            />

                                                            <span className="font-bold">
                                                                {
                                                                    item
                                                                        .reviews
                                                                        .averageRating
                                                                }
                                                            </span>

                                                            <span className="text-xs text-slate-500">
                                                                (
                                                                {
                                                                    item
                                                                        .reviews
                                                                        .total
                                                                }{' '}
                                                                reviews)
                                                            </span>

                                                        </div>

                                                    </div>


                                                    <button
                                                        onClick={() => {
                                                            setSelectedTechnician(
                                                                item
                                                            );
                                                            setShowTechnicianModal(
                                                                true
                                                            );
                                                        }}
                                                        className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold hover:bg-slate-50 dark:border-slate-600 dark:hover:bg-slate-700"
                                                    >
                                                        View Reviews
                                                    </button>

                                                </div>


                                                {/* Resolution */}

                                                <div className="mt-4">

                                                    <div className="mb-1 flex justify-between text-xs">

                                                        <span className="text-slate-500">
                                                            Resolution Rate
                                                        </span>

                                                        <span className="font-bold">
                                                            {
                                                                item.resolutionPercentage
                                                            }
                                                            %
                                                        </span>

                                                    </div>

                                                    <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700">

                                                        <div
                                                            className="h-full rounded-full bg-emerald-500 transition-all"
                                                            style={{
                                                                width: `${Math.min(
                                                                    100,
                                                                    item.resolutionPercentage
                                                                )}%`
                                                            }}
                                                        />

                                                    </div>

                                                </div>


                                                {/* Actions */}

                                                <div className="mt-5 flex flex-wrap gap-2">

                                                    <button
                                                        onClick={() => {
                                                            setSelectedTechnician(
                                                                item
                                                            );
                                                            setShowTechnicianModal(
                                                                true
                                                            );
                                                        }}
                                                        className="flex-1 rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-semibold hover:bg-slate-50 dark:border-slate-600 dark:hover:bg-slate-700"
                                                    >
                                                        <span className="inline-flex items-center gap-2">
                                                            <BarChart3
                                                                size={
                                                                    16
                                                                }
                                                            />
                                                            Performance
                                                        </span>
                                                    </button>


                                                    <button
                                                        onClick={() => {
                                                            const user =
                                                                staff.find(
                                                                    (
                                                                        s
                                                                    ) =>
                                                                        s._id ===
                                                                        technician.id
                                                                );

                                                            if (
                                                                user
                                                            ) {
                                                                if (
                                                                    user.isBlocked
                                                                ) {
                                                                    unblockUser(
                                                                        user
                                                                    );
                                                                } else {
                                                                    blockUser(
                                                                        user
                                                                    );
                                                                }
                                                            }
                                                        }}
                                                        className={`rounded-xl px-3 py-2.5 text-sm font-semibold ${
                                                            technician.isBlocked
                                                                ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                                                                : 'bg-red-600 text-white hover:bg-red-700'
                                                        }`}
                                                    >
                                                        {technician.isBlocked ? (
                                                            <span className="inline-flex items-center gap-2">
                                                                <Unlock
                                                                    size={
                                                                        16
                                                                    }
                                                                />
                                                                Unblock
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center gap-2">
                                                                <Ban
                                                                    size={
                                                                        16
                                                                    }
                                                                />
                                                                Block
                                                            </span>
                                                        )}
                                                    </button>

                                                </div>


                                                {/* Expand reviews */}

                                                <button
                                                    onClick={() =>
                                                        setExpandedTechnician(
                                                            isExpanded
                                                                ? null
                                                                : technician.id
                                                        )
                                                    }
                                                    className="mt-4 flex w-full items-center justify-center gap-2 border-t border-slate-100 pt-4 text-xs font-semibold text-slate-500 dark:border-slate-700 dark:text-slate-400"
                                                >
                                                    {isExpanded
                                                        ? 'Hide recent reviews'
                                                        : 'Show recent reviews'}

                                                    {isExpanded ? (
                                                        <ChevronUp
                                                            size={
                                                                15
                                                            }
                                                        />
                                                    ) : (
                                                        <ChevronDown
                                                            size={
                                                                15
                                                            }
                                                        />
                                                    )}
                                                </button>


                                                {isExpanded && (

                                                    <div className="mt-3 space-y-3">

                                                        {item.reviews
                                                            .recent
                                                            ?.length >
                                                        0 ? (

                                                            item.reviews.recent.map(
                                                                (
                                                                    review
                                                                ) => (

                                                                    <div
                                                                        key={
                                                                            review.id
                                                                        }
                                                                        className="rounded-xl bg-slate-50 p-3 dark:bg-slate-900"
                                                                    >

                                                                        <div className="flex items-center justify-between gap-3">

                                                                            <div>

                                                                                <p className="text-xs font-bold">
                                                                                    {
                                                                                        review.student
                                                                                    }
                                                                                </p>

                                                                                <p className="text-[10px] text-slate-500">
                                                                                    {
                                                                                        review.complaint
                                                                                    }
                                                                                </p>

                                                                            </div>

                                                                            <RatingStars
                                                                                rating={
                                                                                    review.rating
                                                                                }
                                                                            />

                                                                        </div>

                                                                        {review.comment && (
                                                                            <p className="mt-2 text-xs text-slate-600 dark:text-slate-300">
                                                                                "
                                                                                {
                                                                                    review.comment
                                                                                }
                                                                                "
                                                                            </p>
                                                                        )}

                                                                    </div>

                                                                )
                                                            )

                                                        ) : (

                                                            <p className="py-3 text-center text-xs text-slate-500">
                                                                No reviews yet.
                                                            </p>

                                                        )}

                                                    </div>

                                                )}

                                            </div>

                                        </div>

                                    );
                                }
                            )}

                        </div>

                    </div>
                )}


                {/* ======================================================
                    USERS
                ====================================================== */}

                {activeTab === 'users' && (

                    <div className="space-y-5">

                        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">

                            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

                                <div>

                                    <h2 className="text-lg font-bold">
                                        User Management
                                    </h2>

                                    <p className="text-sm text-slate-500 dark:text-slate-400">
                                        Manage student and technician accounts
                                    </p>

                                </div>


                                <div className="flex flex-wrap gap-2">

                                    <div className="relative">

                                        <Search
                                            size={17}
                                            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                                        />

                                        <input
                                            value={
                                                userSearch
                                            }
                                            onChange={(
                                                e
                                            ) =>
                                                setUserSearch(
                                                    e
                                                        .target
                                                        .value
                                                )
                                            }
                                            placeholder="Search users..."
                                            className="w-64 rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-blue-500 dark:border-slate-600 dark:bg-slate-900"
                                        />

                                    </div>


                                    <select
                                        value={
                                            userRoleFilter
                                        }
                                        onChange={(
                                            e
                                        ) =>
                                            setUserRoleFilter(
                                                e
                                                    .target
                                                    .value
                                            )
                                        }
                                        className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm dark:border-slate-600 dark:bg-slate-900"
                                    >

                                        <option value="all">
                                            All Users
                                        </option>

                                        <option value="student">
                                            Students
                                        </option>

                                        <option value="staff">
                                            Technicians
                                        </option>

                                    </select>

                                </div>

                            </div>

                        </div>


                        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">

                            <div className="overflow-x-auto">

                                <table className="w-full min-w-[1000px] text-left text-sm">

                                    <thead className="border-b border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-900">

                                        <tr>

                                            <th className="px-5 py-4 font-semibold">
                                                User
                                            </th>

                                            <th className="px-5 py-4 font-semibold">
                                                Role
                                            </th>

                                            <th className="px-5 py-4 font-semibold">
                                                Department
                                            </th>

                                            <th className="px-5 py-4 font-semibold">
                                                Status
                                            </th>

                                            <th className="px-5 py-4 font-semibold">
                                                Last Login
                                            </th>

                                            <th className="px-5 py-4 text-right font-semibold">
                                                Actions
                                            </th>

                                        </tr>

                                    </thead>


                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700">

                                        {allManagedUsers.map(
                                            (
                                                user
                                            ) => (

                                                <tr
                                                    key={
                                                        user._id
                                                    }
                                                    className="hover:bg-slate-50 dark:hover:bg-slate-900/50"
                                                >

                                                    <td className="px-5 py-4">

                                                        <div className="flex items-center gap-3">

                                                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 font-bold text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                                                                {user.name
                                                                    ?.charAt(
                                                                        0
                                                                    )
                                                                    ?.toUpperCase()}
                                                            </div>

                                                            <div>

                                                                <p className="font-semibold">
                                                                    {
                                                                        user.name
                                                                    }
                                                                </p>

                                                                <p className="text-xs text-slate-500">
                                                                    {
                                                                        user.email
                                                                    }
                                                                </p>

                                                            </div>

                                                        </div>

                                                    </td>


                                                    <td className="px-5 py-4">

                                                        <span
                                                            className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                                                                user.role ===
                                                                'staff'
                                                                    ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
                                                                    : 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300'
                                                            }`}
                                                        >
                                                            {user.role ===
                                                            'staff'
                                                                ? 'Technician'
                                                                : 'Student'}
                                                        </span>

                                                    </td>


                                                    <td className="px-5 py-4 text-slate-500">
                                                        {
                                                            user.department
                                                        }
                                                    </td>


                                                    <td className="px-5 py-4">

                                                        <div className="flex flex-wrap gap-1.5">

                                                            {user.isBlocked ? (

                                                                <span className="rounded-full bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-700 dark:bg-red-900/30 dark:text-red-300">
                                                                    Blocked
                                                                </span>

                                                            ) : user.isActive ? (

                                                                <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                                                                    Active
                                                                </span>

                                                            ) : (

                                                                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                                                                    Inactive
                                                                </span>

                                                            )}

                                                        </div>

                                                    </td>


                                                    <td className="px-5 py-4 text-xs text-slate-500">

                                                        {user.lastLogin
                                                            ? new Date(
                                                                  user.lastLogin
                                                              ).toLocaleString()
                                                            : 'Never'}

                                                    </td>


                                                    <td className="px-5 py-4">

                                                        <div className="flex justify-end gap-2">

                                                            <button
                                                                onClick={() => {
                                                                    setSelectedUser(
                                                                        user
                                                                    );
                                                                    setShowUserModal(
                                                                        true
                                                                    );
                                                                }}
                                                                className="rounded-lg border border-slate-200 p-2 hover:bg-slate-100 dark:border-slate-600 dark:hover:bg-slate-700"
                                                                title="View user"
                                                            >
                                                                <Eye
                                                                    size={
                                                                        16
                                                                    }
                                                                />
                                                            </button>


                                                            {user.isBlocked ? (

                                                                <button
                                                                    onClick={() =>
                                                                        unblockUser(
                                                                            user
                                                                        )
                                                                    }
                                                                    className="rounded-lg bg-emerald-600 p-2 text-white hover:bg-emerald-700"
                                                                    title="Unblock"
                                                                >
                                                                    <Unlock
                                                                        size={
                                                                            16
                                                                        }
                                                                    />
                                                                </button>

                                                            ) : (

                                                                <button
                                                                    onClick={() =>
                                                                        blockUser(
                                                                            user
                                                                        )
                                                                    }
                                                                    className="rounded-lg bg-red-600 p-2 text-white hover:bg-red-700"
                                                                    title="Block"
                                                                >
                                                                    <Ban
                                                                        size={
                                                                            16
                                                                        }
                                                                    />
                                                                </button>

                                                            )}


                                                            <button
                                                                onClick={() =>
                                                                    toggleActive(
                                                                        user
                                                                    )
                                                                }
                                                                className={`rounded-lg p-2 text-white ${
                                                                    user.isActive
                                                                        ? 'bg-orange-500 hover:bg-orange-600'
                                                                        : 'bg-blue-600 hover:bg-blue-700'
                                                                }`}
                                                                title={
                                                                    user.isActive
                                                                        ? 'Deactivate'
                                                                        : 'Activate'
                                                                }
                                                            >
                                                                {user.isActive ? (
                                                                    <PowerOff
                                                                        size={
                                                                            16
                                                                        }
                                                                    />
                                                                ) : (
                                                                    <Power
                                                                        size={
                                                                            16
                                                                        }
                                                                    />
                                                                )}
                                                            </button>


                                                            <button
                                                                onClick={() =>
                                                                    deleteUser(
                                                                        user
                                                                    )
                                                                }
                                                                className="rounded-lg bg-slate-700 p-2 text-white hover:bg-slate-800 dark:bg-slate-600 dark:hover:bg-slate-500"
                                                                title="Delete"
                                                            >
                                                                <Trash2
                                                                    size={
                                                                        16
                                                                    }
                                                                />
                                                            </button>

                                                        </div>

                                                    </td>

                                                </tr>

                                            )
                                        )}

                                    </tbody>

                                </table>

                            </div>

                        </div>

                    </div>
                )}

            </main>


            {/* ==========================================================
                ASSIGN MODAL
            ========================================================== */}

            {showAssignModal && (

                <Modal
                    title="Assign Complaint to Technician"
                    onClose={() =>
                        setShowAssignModal(
                            false
                        )
                    }
                >

                    {selectedComplaint && (

                        <div className="space-y-5">

                            <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-900">

                                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                    Complaint
                                </p>

                                <h3 className="mt-1 font-bold">
                                    {
                                        selectedComplaint.title
                                    }
                                </h3>

                                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                                    {
                                        selectedComplaint.description
                                    }
                                </p>

                                <div className="mt-3 flex flex-wrap gap-2">

                                    <StatusBadge
                                        status={
                                            selectedComplaint.status
                                        }
                                    />

                                    <span className="rounded-full bg-slate-200 px-3 py-1 text-xs dark:bg-slate-700">
                                        {
                                            selectedComplaint.category
                                        }
                                    </span>

                                </div>

                            </div>


                            <div>

                                <label className="mb-2 block text-sm font-semibold">
                                    Select Technician
                                </label>

                                <select
                                    value={
                                        selectedStaffId
                                    }
                                    onChange={(
                                        e
                                    ) =>
                                        setSelectedStaffId(
                                            e
                                                .target
                                                .value
                                        )
                                    }
                                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 dark:border-slate-600 dark:bg-slate-900"
                                >

                                    <option value="">
                                        Select a technician
                                    </option>

                                    {staff
                                        .filter(
                                            (
                                                technician
                                            ) =>
                                                technician.isActive !==
                                                    false &&
                                                !technician.isBlocked
                                        )
                                        .map(
                                            (
                                                technician
                                            ) => (

                                                <option
                                                    key={
                                                        technician._id
                                                    }
                                                    value={
                                                        technician._id
                                                    }
                                                >
                                                    {
                                                        technician.name
                                                    }{' '}
                                                    —{' '}
                                                    {
                                                        technician.department
                                                    }
                                                </option>

                                            )
                                        )}

                                </select>

                                {staff.filter(
                                    (item) =>
                                        item.isActive !==
                                            false &&
                                        !item.isBlocked
                                ).length ===
                                    0 && (

                                    <p className="mt-2 text-sm text-red-500">
                                        No active technicians are available.
                                    </p>

                                )}

                            </div>


                            <div className="flex justify-end gap-3">

                                <button
                                    onClick={() =>
                                        setShowAssignModal(
                                            false
                                        )
                                    }
                                    className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold dark:border-slate-600"
                                >
                                    Cancel
                                </button>

                                <button
                                    onClick={
                                        assignComplaint
                                    }
                                    disabled={
                                        assigning ||
                                        !selectedStaffId
                                    }
                                    className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                                >

                                    {assigning
                                        ? 'Assigning...'
                                        : 'Assign Complaint'}

                                </button>

                            </div>

                        </div>
                    )}

                </Modal>
            )}


            {/* ==========================================================
                COMPLAINT DETAIL MODAL
            ========================================================== */}

            {showComplaintModal &&
                selectedComplaint && (

                    <Modal
                        title="Complaint Details"
                        onClose={() =>
                            setShowComplaintModal(
                                false
                            )
                        }
                    >

                        <div className="space-y-5">

                            <div>

                                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                    Title
                                </p>

                                <h2 className="mt-1 text-xl font-bold">
                                    {
                                        selectedComplaint.title
                                    }
                                </h2>

                            </div>


                            <div className="grid gap-4 sm:grid-cols-2">

                                <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-900">

                                    <p className="text-xs text-slate-500">
                                        Student
                                    </p>

                                    <p className="mt-1 font-semibold">
                                        {
                                            selectedComplaint
                                                .raisedBy
                                                ?.name ||
                                            'Unknown'
                                        }
                                    </p>

                                    <p className="text-xs text-slate-500">
                                        {
                                            selectedComplaint
                                                .raisedBy
                                                ?.email
                                        }
                                    </p>

                                </div>


                                <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-900">

                                    <p className="text-xs text-slate-500">
                                        Technician
                                    </p>

                                    <p className="mt-1 font-semibold">
                                        {selectedComplaint
                                            .assignedTo
                                            ?.name ||
                                            'Not assigned'}
                                    </p>

                                </div>

                            </div>


                            <div>

                                <p className="mb-2 text-sm font-semibold">
                                    Description
                                </p>

                                <div className="rounded-xl bg-slate-50 p-4 text-sm text-slate-600 dark:bg-slate-900 dark:text-slate-300">
                                    {
                                        selectedComplaint.description
                                    }
                                </div>

                            </div>


                            {selectedComplaint.imageUrl && (

                                <div>

                                    <p className="mb-2 text-sm font-semibold">
                                        Evidence Image
                                    </p>

                                    <img
                                        src={
                                            selectedComplaint.imageUrl.startsWith(
                                                'http'
                                            )
                                                ? selectedComplaint.imageUrl
                                                : `http://localhost:5000${selectedComplaint.imageUrl}`
                                        }
                                        alt="Complaint evidence"
                                        className="max-h-72 rounded-xl border object-contain"
                                    />

                                </div>

                            )}


                            <div className="grid gap-4 sm:grid-cols-2">

                                <div>

                                    <label className="mb-2 block text-sm font-semibold">
                                        Status
                                    </label>

                                    <select
                                        value={
                                            newStatus
                                        }
                                        onChange={(
                                            e
                                        ) =>
                                            setNewStatus(
                                                e
                                                    .target
                                                    .value
                                            )
                                        }
                                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm dark:border-slate-600 dark:bg-slate-900"
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

                                </div>


                                <div>

                                    <label className="mb-2 block text-sm font-semibold">
                                        Due Period
                                    </label>

                                    <div className="rounded-xl border border-slate-200 px-4 py-3 text-sm dark:border-slate-600">
                                        Within{' '}
                                        {
                                            selectedComplaint.dueInDays
                                        }{' '}
                                        day(s)
                                    </div>

                                </div>

                            </div>


                            <div>

                                <label className="mb-2 block text-sm font-semibold">
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
                                            e
                                                .target
                                                .value
                                        )
                                    }
                                    rows="4"
                                    placeholder="Add resolution notes..."
                                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 dark:border-slate-600 dark:bg-slate-900"
                                />

                            </div>


                            <div className="flex flex-wrap justify-end gap-3">

                                <button
                                    onClick={() => {
                                        setShowComplaintModal(
                                            false
                                        );
                                        openAssignModal(
                                            selectedComplaint
                                        );
                                    }}
                                    className="inline-flex items-center gap-2 rounded-xl border border-blue-200 px-4 py-2.5 text-sm font-semibold text-blue-600 hover:bg-blue-50 dark:border-blue-900 dark:hover:bg-blue-950/30"
                                >
                                    <UserPlus
                                        size={16}
                                    />
                                    {selectedComplaint.assignedTo
                                        ? 'Reassign Technician'
                                        : 'Assign Technician'}
                                </button>


                                <button
                                    onClick={
                                        updateComplaintStatus
                                    }
                                    className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
                                >
                                    <Save
                                        size={16}
                                    />
                                    Save Changes
                                </button>

                            </div>

                        </div>

                    </Modal>
                )}


            {/* ==========================================================
                TECHNICIAN MODAL
            ========================================================== */}

            {showTechnicianModal &&
                selectedTechnician && (

                    <Modal
                        title="Technician Performance"
                        onClose={() =>
                            setShowTechnicianModal(
                                false
                            )
                        }
                        width="max-w-4xl"
                    >

                        <div className="space-y-6">

                            <div className="flex flex-col gap-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white sm:flex-row sm:items-center sm:justify-between">

                                <div>

                                    <h2 className="text-2xl font-bold">
                                        {
                                            selectedTechnician
                                                .technician
                                                .name
                                        }
                                    </h2>

                                    <p className="mt-1 text-sm text-blue-100">
                                        {
                                            selectedTechnician
                                                .technician
                                                .department
                                        }
                                    </p>

                                </div>

                                <div className="text-left sm:text-right">

                                    <p className="text-4xl font-bold">
                                        {
                                            selectedTechnician.performanceScore
                                        }
                                    </p>

                                    <p className="text-xs text-blue-100">
                                        Performance Score
                                    </p>

                                </div>

                            </div>


                            <div className="grid gap-4 sm:grid-cols-4">

                                <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-900">

                                    <p className="text-xs text-slate-500">
                                        Assigned
                                    </p>

                                    <p className="mt-1 text-2xl font-bold">
                                        {
                                            selectedTechnician
                                                .complaints
                                                .total
                                        }
                                    </p>

                                </div>


                                <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-900">

                                    <p className="text-xs text-slate-500">
                                        Resolved
                                    </p>

                                    <p className="mt-1 text-2xl font-bold text-emerald-600">
                                        {
                                            selectedTechnician
                                                .complaints
                                                .resolved
                                        }
                                    </p>

                                </div>


                                <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-900">

                                    <p className="text-xs text-slate-500">
                                        Resolution
                                    </p>

                                    <p className="mt-1 text-2xl font-bold">
                                        {
                                            selectedTechnician.resolutionPercentage
                                        }
                                        %
                                    </p>

                                </div>


                                <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-900">

                                    <p className="text-xs text-slate-500">
                                        Rating
                                    </p>

                                    <p className="mt-1 text-2xl font-bold">
                                        {
                                            selectedTechnician
                                                .reviews
                                                .averageRating
                                        }
                                        /5
                                    </p>

                                </div>

                            </div>


                            <div>

                                <h3 className="mb-3 font-bold">
                                    Rating Distribution
                                </h3>

                                <div className="space-y-2">

                                    {[5, 4, 3, 2, 1].map(
                                        (
                                            rating
                                        ) => {

                                            const count =
                                                selectedTechnician
                                                    .reviews
                                                    .ratingDistribution?.[
                                                    rating
                                                ] ||
                                                0;

                                            const total =
                                                selectedTechnician
                                                    .reviews
                                                    .total ||
                                                0;

                                            const percentage =
                                                total >
                                                0
                                                    ? (count /
                                                          total) *
                                                      100
                                                    : 0;

                                            return (

                                                <div
                                                    key={
                                                        rating
                                                    }
                                                    className="flex items-center gap-3"
                                                >

                                                    <div className="flex w-16 items-center gap-1 text-sm">
                                                        {
                                                            rating
                                                        }
                                                        <Star
                                                            size={
                                                                14
                                                            }
                                                            className="fill-yellow-400 text-yellow-400"
                                                        />
                                                    </div>

                                                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700">

                                                        <div
                                                            className="h-full rounded-full bg-yellow-400"
                                                            style={{
                                                                width: `${percentage}%`
                                                            }}
                                                        />

                                                    </div>

                                                    <span className="w-8 text-right text-xs text-slate-500">
                                                        {
                                                            count
                                                        }
                                                    </span>

                                                </div>

                                            );
                                        }
                                    )}

                                </div>

                            </div>


                            <div>

                                <div className="mb-3 flex items-center justify-between">

                                    <h3 className="font-bold">
                                        Student Reviews
                                    </h3>

                                    <span className="text-xs text-slate-500">
                                        {
                                            selectedTechnician
                                                .reviews
                                                .total
                                        }{' '}
                                        total
                                    </span>

                                </div>


                                <div className="space-y-3">

                                    {selectedTechnician
                                        .reviews
                                        .recent
                                        ?.length >
                                    0 ? (

                                        selectedTechnician.reviews.recent.map(
                                            (
                                                review
                                            ) => (

                                                <div
                                                    key={
                                                        review.id
                                                    }
                                                    className="rounded-xl border border-slate-200 p-4 dark:border-slate-700"
                                                >

                                                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">

                                                        <div>

                                                            <p className="font-semibold">
                                                                {
                                                                    review.student
                                                                }
                                                            </p>

                                                            <p className="mt-1 text-xs text-slate-500">
                                                                Complaint:{' '}
                                                                {
                                                                    review.complaint
                                                                }
                                                            </p>

                                                        </div>

                                                        <RatingStars
                                                            rating={
                                                                review.rating
                                                            }
                                                        />

                                                    </div>

                                                    {review.comment && (

                                                        <div className="mt-3 rounded-lg bg-slate-50 p-3 text-sm text-slate-600 dark:bg-slate-900 dark:text-slate-300">

                                                            <MessageSquare
                                                                size={
                                                                    15
                                                                }
                                                                className="mr-2 inline"
                                                            />

                                                            {
                                                                review.comment
                                                            }

                                                        </div>

                                                    )}

                                                    <p className="mt-2 text-[10px] text-slate-400">
                                                        {review.submittedAt
                                                            ? new Date(
                                                                  review.submittedAt
                                                              ).toLocaleString()
                                                            : ''}
                                                    </p>

                                                </div>

                                            )
                                        )

                                    ) : (

                                        <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center dark:border-slate-700">

                                            <MessageSquare
                                                size={
                                                    32
                                                }
                                                className="mx-auto mb-2 text-slate-400"
                                            />

                                            <p className="text-sm text-slate-500">
                                                This technician has not received any student reviews yet.
                                            </p>

                                        </div>

                                    )}

                                </div>

                            </div>

                        </div>

                    </Modal>
                )}


            {/* ==========================================================
                USER MODAL
            ========================================================== */}

            {showUserModal &&
                selectedUser && (

                    <Modal
                        title="User Details"
                        onClose={() =>
                            setShowUserModal(
                                false
                            )
                        }
                    >

                        <div className="space-y-5">

                            <div className="flex items-center gap-4">

                                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-2xl font-bold text-white">
                                    {selectedUser.name
                                        ?.charAt(
                                            0
                                        )
                                        ?.toUpperCase()}
                                </div>

                                <div>

                                    <h2 className="text-xl font-bold">
                                        {
                                            selectedUser.name
                                        }
                                    </h2>

                                    <p className="text-sm text-slate-500">
                                        {
                                            selectedUser.email
                                        }
                                    </p>

                                </div>

                            </div>


                            <div className="grid gap-3 sm:grid-cols-2">

                                <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-900">

                                    <Mail
                                        size={
                                            17
                                        }
                                        className="mb-2 text-blue-500"
                                    />

                                    <p className="text-xs text-slate-500">
                                        Email
                                    </p>

                                    <p className="mt-1 break-all text-sm font-medium">
                                        {
                                            selectedUser.email
                                        }
                                    </p>

                                </div>


                                <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-900">

                                    <Building2
                                        size={
                                            17
                                        }
                                        className="mb-2 text-blue-500"
                                    />

                                    <p className="text-xs text-slate-500">
                                        Department
                                    </p>

                                    <p className="mt-1 text-sm font-medium">
                                        {
                                            selectedUser.department
                                        }
                                    </p>

                                </div>


                                <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-900">

                                    <UserCheck
                                        size={
                                            17
                                        }
                                        className="mb-2 text-blue-500"
                                    />

                                    <p className="text-xs text-slate-500">
                                        Role
                                    </p>

                                    <p className="mt-1 text-sm font-medium">
                                        {selectedUser.role ===
                                        'staff'
                                            ? 'Technician'
                                            : 'Student'}
                                    </p>

                                </div>


                                <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-900">

                                    <CalendarDays
                                        size={
                                            17
                                        }
                                        className="mb-2 text-blue-500"
                                    />

                                    <p className="text-xs text-slate-500">
                                        Registered
                                    </p>

                                    <p className="mt-1 text-sm font-medium">
                                        {selectedUser.createdAt
                                            ? new Date(
                                                  selectedUser.createdAt
                                              ).toLocaleDateString()
                                            : '-'}
                                    </p>

                                </div>

                            </div>


                            {selectedUser.isBlocked && (

                                <div className="rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-900/50 dark:bg-red-950/30">

                                    <p className="font-semibold text-red-700 dark:text-red-300">
                                        Account Blocked
                                    </p>

                                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                                        {selectedUser.blockedReason ||
                                            'No reason provided.'}
                                    </p>

                                </div>

                            )}


                            <div className="flex flex-wrap justify-end gap-2">

                                {selectedUser.isBlocked ? (

                                    <button
                                        onClick={() => {
                                            setShowUserModal(
                                                false
                                            );
                                            unblockUser(
                                                selectedUser
                                            );
                                        }}
                                        className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"
                                    >
                                        <Unlock
                                            size={
                                                16
                                            }
                                        />
                                        Unblock
                                    </button>

                                ) : (

                                    <button
                                        onClick={() => {
                                            setShowUserModal(
                                                false
                                            );
                                            blockUser(
                                                selectedUser
                                            );
                                        }}
                                        className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700"
                                    >
                                        <Ban
                                            size={
                                                16
                                            }
                                        />
                                        Block
                                    </button>

                                )}


                                <button
                                    onClick={() => {
                                        setShowUserModal(
                                            false
                                        );
                                        toggleActive(
                                            selectedUser
                                        );
                                    }}
                                    className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-orange-600"
                                >
                                    {selectedUser.isActive ? (
                                        <PowerOff
                                            size={
                                                16
                                            }
                                        />
                                    ) : (
                                        <Power
                                            size={
                                                16
                                            }
                                        />
                                    )}

                                    {selectedUser.isActive
                                        ? 'Deactivate'
                                        : 'Activate'}
                                </button>


                                <button
                                    onClick={() => {
                                        setShowUserModal(
                                            false
                                        );
                                        deleteUser(
                                            selectedUser
                                        );
                                    }}
                                    className="inline-flex items-center gap-2 rounded-xl bg-slate-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
                                >
                                    <Trash2
                                        size={
                                            16
                                        }
                                    />
                                    Delete
                                </button>

                            </div>

                        </div>

                    </Modal>
                )}

        </div>
    );
};


export default AdminDashboard;