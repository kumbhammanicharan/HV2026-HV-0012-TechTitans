import React, { useEffect, useState } from 'react';
import {
    BrowserRouter as Router,
    Route,
    Switch,
    Redirect
} from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import ComplaintForm from './components/Complaint/ComplaintForm';
import MyComplaints from './pages/MyComplaints';
import ComplaintDetail from './pages/ComplaintDetail';
import AdminDashboard from './pages/AdminDashboard';
import StaffDashboard from './pages/StaffDashboard';

const App = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userRole, setUserRole] = useState('');
    const [userEmail, setUserEmail] = useState('');
    const [userInfo, setUserInfo] = useState({});

    const [theme, setTheme] = useState(() => {
        return (
            localStorage.getItem('campuscare-theme') ||
            'light'
        );
    });

    // Apply theme
    useEffect(() => {
        document.documentElement.classList.toggle(
            'dark',
            theme === 'dark'
        );

        localStorage.setItem(
            'campuscare-theme',
            theme
        );
    }, [theme]);

    // Restore authentication state
    useEffect(() => {
        const token = localStorage.getItem('token');

        if (!token) {
            setIsLoggedIn(false);
            setUserRole('');
            setUserEmail('');
            setUserInfo({});
            return;
        }

        try {
            const decoded = jwtDecode(token);

            setIsLoggedIn(true);

            setUserRole(
                decoded.role || ''
            );

            setUserEmail(
                decoded.role === 'admin'
                    ? 'Admin'
                    : decoded.email || ''
            );

            setUserInfo({
                name: decoded.name || '',
                department:
                    decoded.department || '',
                email: decoded.email || ''
            });
        } catch (error) {
            console.error(
                'Invalid authentication token:',
                error
            );

            localStorage.removeItem('token');
            localStorage.removeItem('user');

            setIsLoggedIn(false);
            setUserRole('');
            setUserEmail('');
            setUserInfo({});
        }
    }, []);

    // Logout
    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');

        setIsLoggedIn(false);
        setUserRole('');
        setUserEmail('');
        setUserInfo({});

        window.location.href = '/';
    };

    // Login success
    const handleLoginSuccess = (
        response,
        history
    ) => {
        const token =
            response.data.token;

        const user =
            response.data.user;

        if (!token || !user) {
            console.error(
                'Invalid login response:',
                response.data
            );
            return;
        }

        localStorage.setItem(
            'token',
            token
        );

        localStorage.setItem(
            'user',
            JSON.stringify(user)
        );

        setIsLoggedIn(true);

        setUserRole(
            user.role || ''
        );

        setUserEmail(
            user.role === 'admin'
                ? 'Admin'
                : user.email || ''
        );

        setUserInfo({
            name: user.name || '',
            department:
                user.department || '',
            email: user.email || ''
        });

        if (user.role === 'admin') {
            history.push(
                '/admin/dashboard'
            );
        } else if (
            user.role === 'staff'
        ) {
            history.push(
                '/staff/dashboard'
            );
        } else {
            history.push('/');
        }
    };

    // Toggle theme
    const toggleTheme = () => {
        setTheme((current) =>
            current === 'dark'
                ? 'light'
                : 'dark'
        );
    };

    return (
        <Router>
            <div className="min-h-screen bg-slate-50 text-slate-900 transition-colors duration-300 dark:bg-slate-950 dark:text-slate-100">

                <Navbar
                    isLoggedIn={isLoggedIn}
                    onLogout={handleLogout}
                    userRole={userRole}
                    userEmail={userEmail}
                    userInfo={userInfo}
                    theme={theme}
                    onToggleTheme={
                        toggleTheme
                    }
                />

                <main className="min-h-[calc(100vh-72px)]">

                    <Switch>

                        {/* =========================
                            LOGIN
                        ========================== */}
                        <Route
                            path="/login/:role"
                            render={(props) =>
                                isLoggedIn ? (
                                    <Redirect to="/" />
                                ) : (
                                    <Login
                                        {...props}
                                        setIsLoggedIn={
                                            setIsLoggedIn
                                        }
                                        onLoginSuccess={
                                            handleLoginSuccess
                                        }
                                    />
                                )
                            }
                        />

                        {/* =========================
                            REGISTRATION
                        ========================== */}
                        <Route
                            path="/register/:role"
                            render={(props) =>
                                isLoggedIn ? (
                                    <Redirect to="/" />
                                ) : (
                                    <Register
                                        {...props}
                                    />
                                )
                            }
                        />

                        {/* =========================
                            NEW COMPLAINT
                        ========================== */}
                        <Route
                            path="/complaints/new"
                        >
                            {isLoggedIn &&
                            userRole ===
                                'student' ? (
                                <ComplaintForm />
                            ) : (
                                <Redirect
                                    to={
                                        userRole ===
                                        'admin'
                                            ? '/admin/dashboard'
                                            : userRole ===
                                              'staff'
                                            ? '/staff/dashboard'
                                            : '/login/student'
                                    }
                                />
                            )}
                        </Route>

                        {/* =========================
                            MY COMPLAINTS
                        ========================== */}
                        <Route
                            path="/my-complaints"
                        >
                            {isLoggedIn &&
                            userRole ===
                                'student' ? (
                                <MyComplaints />
                            ) : (
                                <Redirect
                                    to={
                                        userRole ===
                                        'admin'
                                            ? '/admin/dashboard'
                                            : userRole ===
                                              'staff'
                                            ? '/staff/dashboard'
                                            : '/login/student'
                                    }
                                />
                            )}
                        </Route>

                        {/* =========================
                            COMPLAINT DETAILS
                        ========================== */}
                        <Route
                            path="/complaints/:id"
                        >
                            {isLoggedIn &&
                            userRole ===
                                'student' ? (
                                <ComplaintDetail />
                            ) : (
                                <Redirect
                                    to={
                                        userRole ===
                                        'admin'
                                            ? '/admin/dashboard'
                                            : userRole ===
                                              'staff'
                                            ? '/staff/dashboard'
                                            : '/login/student'
                                    }
                                />
                            )}
                        </Route>

                        {/* =========================
                            ADMIN DASHBOARD
                        ========================== */}
                        <Route
                            path="/admin/dashboard"
                        >
                            {isLoggedIn &&
                            userRole ===
                                'admin' ? (
                                <AdminDashboard />
                            ) : (
                                <Redirect to="/login/admin" />
                            )}
                        </Route>

                        {/* =========================
                            STAFF / TECHNICIAN DASHBOARD
                        ========================== */}
                        <Route
                            path="/staff/dashboard"
                        >
                            {isLoggedIn &&
                            userRole ===
                                'staff' ? (
                                <StaffDashboard />
                            ) : (
                                <Redirect to="/login/staff" />
                            )}
                        </Route>

                        {/* =========================
                            HOME
                        ========================== */}
                        <Route
                            path="/"
                            exact
                        >
                            <Home
                                userEmail={
                                    userEmail
                                }
                                userRole={
                                    userRole
                                }
                            />
                        </Route>

                        {/* =========================
                            FALLBACK
                        ========================== */}
                        <Redirect to="/" />

                    </Switch>

                </main>
            </div>
        </Router>
    );
};

export default App;