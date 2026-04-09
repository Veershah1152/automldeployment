import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    Upload,
    Sliders,
    BarChart2,
    Cpu,
    Scale,
    Trophy,
    Zap,
    BookOpen,
    Shield,
    FileText,
    LifeBuoy,
    Heart,
    CheckCircle2,
    ChevronRight,
    Search,
    Menu,
    X
} from 'lucide-react';
import { ThemeToggle } from '../components/ui/ThemeToggle';
import RobotAvatar from '../components/AIAssistant/RobotAvatar';
import ChatWindow from '../components/AIAssistant/ChatWindow';
import MobileNav from '../components/MobileNav';
import '../components/AIAssistant/index.css';
import { useAuth } from '../context/AuthContext';
import './DashboardLayout.css';

const DashboardLayout = () => {
    const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');
    const [chatOpen, setChatOpen] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

    const { user, signOut } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await signOut();
            navigate('/');
        } catch (error) {
            console.error('Error logging out:', error);
        }
    };

    const toggleTheme = () => {
        setTheme(prev => prev === 'light' ? 'dark' : 'light');
    };

    const workflowSteps = [
        { key: 'upload', label: 'Dataset Upload', icon: Upload },
        { key: 'missing', label: 'Missing Value Handling', icon: Search },
        { key: 'encoding', label: 'Feature Encoding', icon: Zap },
        { key: 'eda', label: 'Exploratory Data Analysis', icon: BarChart2 },
        { key: 'train', label: 'Model Training', icon: Cpu },
        { key: 'evaluation', label: 'Model Evaluation', icon: Trophy },
    ];

    const getActiveStepKey = () => {
        const path = location.pathname;
        if (path.startsWith('/upload')) return 'upload';
        if (path.startsWith('/preview')) return 'missing';
        if (path.startsWith('/eda')) return 'eda';
        if (path.startsWith('/train')) return 'train';
        if (path.startsWith('/results') || path.startsWith('/comparison') || path.startsWith('/best-model')) return 'evaluation';
        // Feature encoding (step 3) is currently implicitly handled
        return 'upload';
    };

    const activeStepKey = getActiveStepKey();

    return (
        <div className="dashboard-layout">
            {/* Mobile Navigation Drawer */}
            <MobileNav
                isOpen={mobileMenuOpen}
                onClose={() => setMobileMenuOpen(false)}
                theme={theme}
                toggleTheme={toggleTheme}
                user={user}
            />

            <aside className="sidebar">
                <div className="logo">
                    <div className="logo-icon-wrapper">
                        <LayoutDashboard size={26} />
                    </div>
                    <span className="logo-text">Visual & Predictive Analytics</span>
                </div>

                <nav className="nav-menu">
                    <NavLink to="/dashboard" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                        <LayoutDashboard size={20} />
                        <span>Dashboard Overview</span>
                    </NavLink>
                    <NavLink to="/upload" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                        <Upload size={20} />
                        <span>Dataset Upload</span>
                    </NavLink>
                    {user?.email === 'priyantshah3001@gmail.com' && (
                        <NavLink to="/admin" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                            <Shield size={20} />
                            <span>Admin Panel</span>
                        </NavLink>
                    )}
                    <NavLink to="/blog" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                        <BookOpen size={20} />
                        <span>Blog</span>
                    </NavLink>
                    <NavLink to="/report" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                        <FileText size={20} />
                        <span>Analysis Report</span>
                    </NavLink>
                </nav>

                <div className="sidebar-footer">
                    <div className="theme-toggle-wrapper">
                        <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
                        <span>{theme === 'light' ? 'Light Mode' : 'Dark Mode'}</span>
                    </div>

                    <button onClick={handleLogout} className="logout-button">
                        <span>Logout Session</span>
                    </button>

                    <div className="sidebar-footer-copyright">
                        <p className="sidebar-footer-meta">© {new Date().getFullYear()} Visual & Predictive Analytics</p>
                    </div>
                </div>
            </aside>

            <div className="dashboard-main">
                <header className="topbar">
                    <div className="topbar-left">
                        {/* Hamburger menu for mobile */}
                        <button
                            className="hamburger-button"
                            onClick={() => setMobileMenuOpen(true)}
                            aria-label="Open navigation menu"
                        >
                            <Menu size={22} />
                        </button>
                        <div className="topbar-left-content">
                            <span className="topbar-badge">Intelligent AutoML</span>
                            <h2 className="topbar-title">Visual & Predictive Analytics</h2>
                        </div>
                    </div>
                    <div className="topbar-right">
                        <div className="topbar-user">
                            <span className="topbar-avatar">
                                {(user?.email || 'A')[0].toUpperCase()}
                            </span>
                            <div className="topbar-user-meta">
                                <span className="topbar-user-email">{user?.email}</span>
                            </div>
                        </div>
                    </div>
                </header>

                <div className="workflow-indicator">
                    <div className="workflow-track-line" />

                    {workflowSteps.map((step, index) => {
                        const isActive = step.key === activeStepKey;
                        const isCompleted = workflowSteps.findIndex((s) => s.key === activeStepKey) > index;
                        const StepIcon = step.icon;

                        return (
                            <React.Fragment key={step.key}>
                                <div className={`workflow-step-wrapper ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}>
                                    <div className={`workflow-step-icon ${isCompleted ? 'completed' : isActive ? 'active' : ''}`}>
                                        {isCompleted ? <CheckCircle2 size={22} /> : <StepIcon size={22} />}
                                    </div>
                                    <span className={`workflow-step-label ${isCompleted ? 'completed' : isActive ? 'active' : ''}`}>
                                        {step.label}
                                    </span>
                                </div>
                                {index < workflowSteps.length - 1 && (
                                    <div className={`workflow-connector ${isCompleted ? 'completed' : ''}`}>
                                        {isCompleted && <div className="workflow-connector-glow" />}
                                    </div>
                                )}
                            </React.Fragment>
                        );
                    })}
                </div>

                <main className="main-content">
                    <Outlet />

                    <footer className="dashboard-footer-modern">
                        <div className="footer-premium-glass">
                            <div className="footer-top-row">
                                <div className="footer-brand-signature">
                                    <div className="brand-icon-poly">
                                        <Zap size={22} fill="currentColor" />
                                    </div>
                                    <div className="brand-text-stack">
                                        <span className="brand-name">Visual & Predictive Analytics</span>
                                        <span className="brand-tagline">Leaderboard Performance via EDA & AutoML</span>
                                    </div>
                                </div>
                                <nav className="footer-nav-links">
                                    <a href="/docs" className="footer-link-item"><BookOpen size={16} /> Documentation</a>
                                    <a href="/support" className="footer-link-item"><LifeBuoy size={16} /> Support Engine</a>
                                    <a href="/privacy" className="footer-link-item"><Shield size={16} /> Privacy Protocol</a>
                                </nav>
                            </div>
                            <div className="footer-divider-glow"></div>
                            <div className="footer-bottom-row">
                                <span className="copyright-text">© {new Date().getFullYear()} Visual & Predictive Analytics. High-Performance ML Workstation.</span>
                                <div className="system-status-indicator">
                                    <div className="status-dot-pulse"></div>
                                    <span>System Operational</span>
                                </div>
                            </div>
                        </div>
                    </footer>
                </main>

                {/* Floating AI assistant visible on all dashboard pages */}
                <div className="ai-assistant-launcher">
                    <button
                        type="button"
                        className="ai-assistant-button"
                        onClick={() => setChatOpen(true)}
                        aria-label="Neural Analysis Engine"
                    >
                        <RobotAvatar size={64} />
                        <div className="ai-assistant-tooltip">Automated Intelligence Engine</div>
                    </button>
                    <ChatWindow
                        open={chatOpen}
                        onClose={() => setChatOpen(false)}
                        onMinimize={() => setChatOpen(false)}
                    />
                </div>
            </div>
        </div>
    );
};

export default DashboardLayout;
