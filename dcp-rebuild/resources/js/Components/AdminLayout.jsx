import React, { useState } from 'react';
import { Head, Link, usePage, router } from '@inertiajs/react';
import Logo from './Logo';
import ThemeToggle from './ThemeToggle';

export default function AdminLayout({ title, breadcrumb, topActions, children }) {
    const { auth, currentPath, flash } = usePage().props;
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [toastDismissed, setToastDismissed] = useState(false);

    const handleSignOut = (e) => {
        e.preventDefault();
        router.post('/admin/logout');
    };

    const isLinkActive = (path) => {
        if (path === '/admin') return currentPath === '/admin';
        return currentPath.startsWith(path);
    };

    return (
        <div className="admin" data-theme="dark">
            <Head>
                <title>{title ? `${title} — DevCenterPoint Admin` : 'DevCenterPoint Admin'}</title>
            </Head>

            {/* Sidebar */}
            <aside className={`sidebar ${sidebarOpen ? 'is-open' : ''}`}>
                <div className="sidebar__brand" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Link href="/admin">
                        <Logo variant="admin" />
                    </Link>
                    <span className="sidebar__badge">CMS</span>
                </div>

                <div className="sidebar__section">
                    <span className="sidebar__label">Overview</span>
                    <Link href="/admin" className={`sidebar__link ${isLinkActive('/admin') && currentPath === '/admin' ? 'is-active' : ''}`}>
                        <span>Dashboard</span>
                    </Link>
                    <Link href="/admin/submissions" className={`sidebar__link ${isLinkActive('/admin/submissions') ? 'is-active' : ''}`}>
                        <span>Enquiries</span>
                    </Link>
                </div>

                <div className="sidebar__section">
                    <span className="sidebar__label">Content</span>
                    <Link href="/admin/cases" className={`sidebar__link ${isLinkActive('/admin/cases') ? 'is-active' : ''}`}>
                        <span>Case Studies</span>
                    </Link>
                    <Link href="/admin/posts" className={`sidebar__link ${isLinkActive('/admin/posts') ? 'is-active' : ''}`}>
                        <span>Insights</span>
                    </Link>
                    <Link href="/admin/updates" className={`sidebar__link ${isLinkActive('/admin/updates') ? 'is-active' : ''}`}>
                        <span>Updates</span>
                    </Link>
                    <Link href="/admin/services" className={`sidebar__link ${isLinkActive('/admin/services') ? 'is-active' : ''}`}>
                        <span>Services</span>
                    </Link>
                    <Link href="/admin/pages" className={`sidebar__link ${isLinkActive('/admin/pages') ? 'is-active' : ''}`}>
                        <span>Pages</span>
                    </Link>
                </div>

                <div className="sidebar__section">
                    <span className="sidebar__label">Identity &amp; Proof</span>
                    <Link href="/admin/team" className={`sidebar__link ${isLinkActive('/admin/team') ? 'is-active' : ''}`}>
                        <span>Team</span>
                    </Link>
                    <Link href="/admin/testimonials" className={`sidebar__link ${isLinkActive('/admin/testimonials') ? 'is-active' : ''}`}>
                        <span>Testimonials</span>
                    </Link>
                    <Link href="/admin/faqs" className={`sidebar__link ${isLinkActive('/admin/faqs') ? 'is-active' : ''}`}>
                        <span>FAQs</span>
                    </Link>
                </div>

                <div className="sidebar__section">
                    <span className="sidebar__label">System</span>
                    <Link href="/admin/media" className={`sidebar__link ${isLinkActive('/admin/media') ? 'is-active' : ''}`}>
                        <span>Media Library</span>
                    </Link>
                    <Link href="/admin/nav" className={`sidebar__link ${isLinkActive('/admin/nav') ? 'is-active' : ''}`}>
                        <span>Navigation</span>
                    </Link>
                    <Link href="/admin/settings" className={`sidebar__link ${isLinkActive('/admin/settings') ? 'is-active' : ''}`}>
                        <span>Settings</span>
                    </Link>
                    <a href="/status" target="_blank" rel="noreferrer" className="sidebar__link">
                        <span>System Health &nearr;</span>
                    </a>
                </div>

                <div className="sidebar__foot">
                    <a href="/" target="_blank" rel="noreferrer" className="sidebar__link">
                        <span>View Live Site &nearr;</span>
                    </a>
                    <button
                        type="button"
                        onClick={handleSignOut}
                        className="sidebar__link"
                        style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', color: 'var(--vermilion-400)', cursor: 'pointer' }}
                    >
                        <span>Sign Out ({auth?.user?.name || 'User'})</span>
                    </button>
                </div>
            </aside>

            {sidebarOpen && (
                <div
                    className="sidebar-backdrop is-active"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Main Admin Area */}
            <div className="admin-main">
                <header className="topbar">
                    <button
                        className="topbar__menu-toggle"
                        type="button"
                        onClick={() => setSidebarOpen((prev) => !prev)}
                        aria-label="Toggle navigation menu"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="3" y1="12" x2="21" y2="12" />
                            <line x1="3" y1="6" x2="21" y2="6" />
                            <line x1="3" y1="18" x2="21" y2="18" />
                        </svg>
                    </button>

                    <div className="topbar__breadcrumb">
                        <Link href="/admin">Admin</Link>
                        {breadcrumb && (
                            <>
                                <span aria-hidden="true">/</span>
                                <span>{breadcrumb}</span>
                            </>
                        )}
                    </div>

                    <div className="topbar__actions" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <ThemeToggle variant="admin" />
                        {topActions}
                    </div>
                </header>

                <main className="admin-body">
                    {flash?.message && !toastDismissed && (
                        <div className={`toast-message toast-message--${flash.type || 'info'}`}>
                            <div className="toast-message__icon" />
                            <span>{flash.message}</span>
                            <button
                                className="toast-message__close"
                                type="button"
                                onClick={() => setToastDismissed(true)}
                                aria-label="Dismiss notification"
                            >
                                &times;
                            </button>
                        </div>
                    )}

                    {children}
                </main>
            </div>
        </div>
    );
}
