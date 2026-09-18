import React, { useState, useEffect } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import Logo from './Logo';
import ThemeToggle from './ThemeToggle';
import CustomCursor from './CustomCursor';
import CommandPalette from './CommandPalette';
import Lenis from 'lenis';

export default function AppLayout({ title, description, image, pageType = 'detail', children }) {
    const { site, nav, currentPath } = usePage().props;
    const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
    const [mobileNavOpen, setMobileNavOpen] = useState(false);

    // Global keyboard shortcut: Cmd+K / Ctrl+K
    useEffect(() => {
        const onKeyDown = (e) => {
            if ((e.metaKey || e.ctrlKey) && (e.key === 'k' || e.key === 'K')) {
                e.preventDefault();
                setCommandPaletteOpen((prev) => !prev);
            }
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, []);

    // Lenis smooth scroll
    useEffect(() => {
        const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (isReduced) return;

        const lenis = new Lenis({
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            orientation: 'vertical',
            smoothWheel: true,
        });

        function raf(time) {
            lenis.raf(time);
            requestAnimationFrame(raf);
        }
        const rafId = requestAnimationFrame(raf);

        return () => {
            cancelAnimationFrame(rafId);
            lenis.destroy();
        };
    }, []);

    const pageTitle = title || site?.defaultTitle || 'DevCenterPoint — Code. Build. Deploy. Scale.';
    const pageDesc = description || site?.defaultDescription || 'DevCenterPoint is an elite engineering consultancy.';
    const ogImage = image || site?.ogImage || '/brand/og-image.svg';

    const primaryNav = nav?.primary || [];
    const footerNav = nav?.footer || [];
    const legalNav = nav?.legal || [];

    const isActive = (url) => {
        if (url === '/') return currentPath === '/';
        return currentPath === url || currentPath.startsWith(`${url}/`);
    };

    return (
        <div className={`app-root page-type-${pageType}`} data-page={pageType}>
            <Head>
                <title>{pageTitle}</title>
                <meta name="description" content={pageDesc} />
                <meta property="og:title" content={pageTitle} />
                <meta property="og:description" content={pageDesc} />
                <meta property="og:image" content={ogImage} />
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content={pageTitle} />
                <meta name="twitter:description" content={pageDesc} />
                <meta name="twitter:image" content={ogImage} />
            </Head>

            <CustomCursor />

            {/* Top Navigation */}
            <header className="head wrap" id="top">
                <Link href="/" className="head__brand" aria-label="DevCenterPoint Home">
                    <Logo variant="header" />
                </Link>

                <nav className="nav" id="nav" aria-label="Main Navigation">
                    <div className="nav__links">
                        {primaryNav.map((item) => (
                            <Link
                                key={item.id || item.url}
                                href={item.url}
                                className={`nav__link ${isActive(item.url) ? 'is-active' : ''}`}
                            >
                                {item.label}
                            </Link>
                        ))}
                    </div>

                    <div className="nav__actions" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <button
                            type="button"
                            className="btn-cmd"
                            onClick={() => setCommandPaletteOpen(true)}
                            aria-label="Open Command Palette"
                            style={{
                                background: 'var(--color-surface-2)',
                                border: '1px solid var(--color-border)',
                                color: 'var(--color-text-muted)',
                                padding: '6px 12px',
                                borderRadius: 'var(--radius-sm)',
                                fontSize: '0.75rem',
                                fontFamily: 'var(--font-mono)',
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                            }}
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="11" cy="11" r="8" />
                                <line x1="21" y1="21" x2="16.65" y2="16.65" />
                            </svg>
                            <span>SEARCH</span>
                            <span className="kbd" style={{ background: 'var(--color-surface)', padding: '1px 5px', borderRadius: '3px', fontSize: '0.6875rem' }}>⌘K</span>
                        </button>

                        <ThemeToggle />

                        <Link href="/contact" className="btn btn--primary btn--sm" data-magnetic="0.2">
                            <span>Start a project</span>
                        </Link>
                    </div>

                    {/* Mobile burger toggle */}
                    <button
                        type="button"
                        className="nav__toggle"
                        onClick={() => setMobileNavOpen((prev) => !prev)}
                        aria-label="Toggle mobile menu"
                        aria-expanded={mobileNavOpen}
                    >
                        <span />
                        <span />
                    </button>
                </nav>
            </header>

            {/* Mobile Nav Drawer */}
            {mobileNavOpen && (
                <div className="mobile-nav-overlay" style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(7,9,14,0.85)', backdropFilter: 'blur(8px)' }}>
                    <div style={{ padding: 'var(--space-6)', background: 'var(--color-surface)', height: '100%', maxWidth: '320px', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
                            <Logo variant="admin" />
                            <button
                                type="button"
                                onClick={() => setMobileNavOpen(false)}
                                style={{ background: 'none', border: 'none', color: 'var(--color-text)', fontSize: '1.5rem', cursor: 'pointer' }}
                            >
                                &times;
                            </button>
                        </div>
                        {primaryNav.map((item) => (
                            <Link
                                key={item.id || item.url}
                                href={item.url}
                                onClick={() => setMobileNavOpen(false)}
                                style={{ fontSize: '1.25rem', fontFamily: 'var(--font-display)', color: isActive(item.url) ? 'var(--color-primary)' : 'var(--color-text)', textDecoration: 'none' }}
                            >
                                {item.label}
                            </Link>
                        ))}
                        <div style={{ marginTop: 'auto', paddingTop: 'var(--space-4)', borderTop: '1px solid var(--color-border)' }}>
                            <Link
                                href="/contact"
                                className="btn btn--primary"
                                style={{ width: '100%', justifyContent: 'center' }}
                                onClick={() => setMobileNavOpen(false)}
                            >
                                Start a project
                            </Link>
                        </div>
                    </div>
                </div>
            )}

            {/* Page Body Content */}
            <main id="main" className="main-content">
                {children}
            </main>

            {/* Footer */}
            <footer className="foot">
                <div className="wrap">
                    <div className="foot__grid">
                        <div className="foot__brand">
                            <Logo variant="footer" />
                            <div style={{ marginTop: 'var(--space-4)' }}>
                                {site?.tagline && (
                                    <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>{site.tagline}</p>
                                )}
                                {site?.footerNote && (
                                    <p className="foot__note" style={{ marginTop: 'var(--space-2)' }}>{site.footerNote}</p>
                                )}
                            </div>
                        </div>

                        <div className="foot__col">
                            <h4>Navigate</h4>
                            {footerNav.map((item) => (
                                <Link key={item.id || item.url} href={item.url}>{item.label}</Link>
                            ))}
                        </div>

                        <div className="foot__col">
                            <h4>Contact</h4>
                            {site?.email && <a href={`mailto:${site.email}`}>{site.email}</a>}
                            {site?.phone && <a href={`tel:${site.phone.replace(/[^\d+]/g, '')}`}>{site.phone}</a>}
                            {site?.location && <span className="foot__static">{site.location}</span>}
                            {site?.hours && <span className="foot__static">{site.hours}</span>}
                        </div>

                        <div className="foot__col">
                            <h4>Elsewhere</h4>
                            {site?.social?.linkedin && (
                                <a href={site.social.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn</a>
                            )}
                            {site?.social?.github && (
                                <a href={site.social.github} target="_blank" rel="noopener noreferrer">GitHub</a>
                            )}
                            {site?.social?.x && (
                                <a href={site.social.x} target="_blank" rel="noopener noreferrer">X (Twitter)</a>
                            )}
                        </div>
                    </div>

                    <div className="foot__base">
                        <span className="code">© {new Date().getFullYear()} {site?.name}</span>
                        <span className="code foot__legal">
                            {legalNav.map((item) => (
                                <Link key={item.id || item.url} href={item.url}>{item.label}</Link>
                            ))}
                        </span>
                    </div>
                </div>
            </footer>

            <CommandPalette isOpen={commandPaletteOpen} onClose={() => setCommandPaletteOpen(false)} />
        </div>
    );
}
