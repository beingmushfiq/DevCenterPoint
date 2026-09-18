import React from 'react';

export default function Logo({ variant = 'header' }) {
    if (variant === 'footer') {
        return (
            <div className="brand-logo brand-logo--footer" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 12 }}>
                    <svg width="38" height="38" viewBox="0 0 500 500" style={{ flex: 'none', color: 'var(--color-text)' }}>
                        <path className="logo-d" d="M 140 110 L 260 110 C 275 110, 285 116, 292 125 C 272 138, 255 160, 245 185 L 205 185 L 205 315 L 270 315 C 285 315, 305 305, 320 290 L 320 340 C 300 375, 260 390, 215 390 L 140 390 Z" fill="currentColor" />
                        <path d="M 268 128 C 285 128, 305 132, 325 142 C 355 158, 375 188, 375 228 C 375 272, 350 305, 312 320 L 268 320 L 268 425 L 268 360 L 268 320 C 252 305, 238 285, 230 262 C 240 248, 248 232, 252 215 C 255 200, 255 185, 252 170 C 255 155, 260 142, 268 128 Z" fill="#2563EB" />
                        <g fill="none" stroke="#FFFFFF" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" transform="translate(305, 155)">
                            <polyline points="14,10 4,20 14,30" />
                            <line x1="22" y1="8" x2="16" y2="32" strokeWidth="10" />
                            <polyline points="24,10 34,20 24,30" />
                        </g>
                        <circle cx="268" cy="245" r="58" fill="#FFFFFF" />
                        <circle cx="268" cy="245" r="58" fill="none" stroke="#0D111A" strokeWidth="6" />
                        <circle cx="268" cy="245" r="32" fill="#2563EB" />
                        <circle cx="262" cy="238" r="8" fill="#93C5FD" opacity="0.6" />
                    </svg>
                    <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.35rem', letterSpacing: '-0.025em' }}>
                        <span style={{ color: 'var(--color-primary)' }}>Dev</span>
                        <span style={{ color: 'var(--color-text)' }}>Center</span>
                        <span style={{ color: 'var(--color-primary)' }}>Point</span>
                    </span>
                </div>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', letterSpacing: '0.22em', color: 'var(--color-text-faint)', textTransform: 'uppercase' }}>
                    CODE. BUILD. DEPLOY. SCALE.
                </span>
            </div>
        );
    }

    if (variant === 'admin') {
        return (
            <div className="brand-logo brand-logo--admin" style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                <svg width="24" height="24" viewBox="0 0 500 500" style={{ flex: 'none', color: 'var(--color-text)' }}>
                    <path className="logo-d" d="M 140 110 L 260 110 C 275 110, 285 116, 292 125 C 272 138, 255 160, 245 185 L 205 185 L 205 315 L 270 315 C 285 315, 305 305, 320 290 L 320 340 C 300 375, 260 390, 215 390 L 140 390 Z" fill="currentColor" />
                    <path d="M 268 128 C 285 128, 305 132, 325 142 C 355 158, 375 188, 375 228 C 375 272, 350 305, 312 320 L 268 320 L 268 425 L 268 360 L 268 320 C 252 305, 238 285, 230 262 C 240 248, 248 232, 252 215 C 255 200, 255 185, 252 170 C 255 155, 260 142, 268 128 Z" fill="#2563EB" />
                    <circle cx="268" cy="245" r="58" fill="#FFFFFF" />
                    <circle cx="268" cy="245" r="32" fill="#2563EB" />
                </svg>
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1rem', letterSpacing: '-0.02em' }}>
                    <span style={{ color: 'var(--color-primary)' }}>Dev</span>CenterPoint
                </span>
            </div>
        );
    }

    return (
        <div className="brand-logo brand-logo--header" style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
            <svg width="32" height="32" viewBox="0 0 500 500" style={{ flex: 'none', color: 'var(--color-text)' }}>
                <path className="logo-d" d="M 140 110 L 260 110 C 275 110, 285 116, 292 125 C 272 138, 255 160, 245 185 L 205 185 L 205 315 L 270 315 C 285 315, 305 305, 320 290 L 320 340 C 300 375, 260 390, 215 390 L 140 390 Z" fill="currentColor" />
                <path d="M 268 128 C 285 128, 305 132, 325 142 C 355 158, 375 188, 375 228 C 375 272, 350 305, 312 320 L 268 320 L 268 425 L 268 360 L 268 320 C 252 305, 238 285, 230 262 C 240 248, 248 232, 252 215 C 255 200, 255 185, 252 170 C 255 155, 260 142, 268 128 Z" fill="#2563EB" />
                <g fill="none" stroke="#FFFFFF" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" transform="translate(305, 155)">
                    <polyline points="14,10 4,20 14,30" />
                    <line x1="22" y1="8" x2="16" y2="32" strokeWidth="10" />
                    <polyline points="24,10 34,20 24,30" />
                </g>
                <circle cx="268" cy="245" r="58" fill="#FFFFFF" />
                <circle cx="268" cy="245" r="58" fill="none" stroke="#0D111A" strokeWidth="6" />
                <circle cx="268" cy="245" r="32" fill="#2563EB" />
                <circle cx="262" cy="238" r="8" fill="#93C5FD" opacity="0.6" />
            </svg>
            <span className="brand-logo__wordmark" style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.1875rem', letterSpacing: '-0.025em', lineHeight: 1 }}>
                <span style={{ color: 'var(--color-primary)' }}>Dev</span>
                <span style={{ color: 'var(--color-text)' }}>Center</span>
                <span style={{ color: 'var(--color-primary)' }}>Point</span>
            </span>
        </div>
    );
}
