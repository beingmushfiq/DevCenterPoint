import React, { useEffect, useState } from 'react';

export default function ThemeToggle({ variant = 'default' }) {
    const [theme, setTheme] = useState('dark');

    useEffect(() => {
        const current = document.documentElement.getAttribute('data-theme') || 'dark';
        setTheme(current);
    }, []);

    const toggle = () => {
        const next = theme === 'dark' ? 'light' : 'dark';
        setTheme(next);
        document.documentElement.setAttribute('data-theme', next);
        try {
            localStorage.setItem('dcp-theme', next);
        } catch (e) {}
    };

    return (
        <button
            type="button"
            onClick={toggle}
            className={`theme-toggle theme-toggle--${variant}`}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            style={{
                background: 'none',
                border: '1px solid var(--color-border)',
                borderRadius: '999px',
                padding: '6px 10px',
                cursor: 'pointer',
                color: 'var(--color-text)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.8125rem',
                fontFamily: 'var(--font-mono)',
            }}
        >
            {theme === 'dark' ? (
                <>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="5" />
                        <line x1="12" y1="1" x2="12" y2="3" />
                        <line x1="12" y1="21" x2="12" y2="23" />
                        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                        <line x1="1" y1="12" x2="3" y2="12" />
                        <line x1="21" y1="12" x2="23" y2="12" />
                        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                    </svg>
                    <span>LIGHT</span>
                </>
            ) : (
                <>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                    </svg>
                    <span>DARK</span>
                </>
            )}
        </button>
    );
}
