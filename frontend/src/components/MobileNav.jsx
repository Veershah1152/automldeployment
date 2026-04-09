import React from 'react';
import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard,
    Upload,
    Shield,
    BookOpen,
    FileText,
    X
} from 'lucide-react';
import { ThemeToggle } from './ui/ThemeToggle';
import './MobileNav.css';

const MobileNav = ({ isOpen, onClose, theme, toggleTheme, user }) => {
    const navItems = [
        { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard Overview' },
        { to: '/upload', icon: Upload, label: 'Dataset Upload' },
        ...(user?.email === 'priyantshah3001@gmail.com' ? [{ to: '/admin', icon: Shield, label: 'Admin Panel' }] : []),
        { to: '/blog', icon: BookOpen, label: 'Blog' },
        { to: '/report', icon: FileText, label: 'Analysis Report' },
    ];

    return (
        <>
            {/* Backdrop overlay */}
            <div
                className={`mobile-nav-backdrop ${isOpen ? 'visible' : ''}`}
                onClick={onClose}
                aria-hidden="true"
            />

            {/* Slide-out drawer */}
            <aside className={`mobile-nav-drawer ${isOpen ? 'open' : ''}`}>
                <div className="mobile-nav-header">
                    <div className="mobile-nav-logo">
                        <div className="mobile-nav-logo-icon">
                            <LayoutDashboard size={24} />
                        </div>
                        <span className="mobile-nav-logo-text">V&P Analytics</span>
                    </div>
                    <button
                        className="mobile-nav-close"
                        onClick={onClose}
                        aria-label="Close navigation"
                    >
                        <X size={24} />
                    </button>
                </div>

                <nav className="mobile-nav-menu">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}
                            onClick={onClose}
                        >
                            <item.icon size={20} />
                            <span>{item.label}</span>
                        </NavLink>
                    ))}
                </nav>

                <div className="mobile-nav-footer">
                    <div className="mobile-nav-theme-toggle">
                        <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
                        <span>{theme === 'light' ? 'Light Mode' : 'Dark Mode'}</span>
                    </div>

                    <div className="mobile-nav-user">
                        <div className="mobile-nav-avatar">
                            {(user?.email || 'A')[0].toUpperCase()}
                        </div>
                        <span className="mobile-nav-user-email">{user?.email}</span>
                    </div>

                    <p className="mobile-nav-copyright">
                        © {new Date().getFullYear()} V&P Analytics
                    </p>
                </div>
            </aside>
        </>
    );
};

export default MobileNav;