import React, { useState } from 'react';

const SCOPES = [
    { value: 'sprint', label: 'Architecture Review & 2-Week Sprint', weeks: '2 to 3 weeks', team: '1 Principal Architect' },
    { value: 'mvp', label: 'End-to-End MVP / Core Platform Delivery', weeks: '6 to 10 weeks', team: '1 Lead + 2 Senior Engineers' },
    { value: 'modernisation', label: 'Legacy Modernisation & Cloud Migration', weeks: '8 to 14 weeks', team: '1 Architect + 2 Full-stack + 1 DevOps' },
    { value: 'scale', label: 'Mission-Critical Scaling & Reliability Hardening', weeks: '4 to 8 weeks', team: '2 Staff Reliability Engineers' },
    { value: 'embedded', label: 'Long-term Embedded Engineering Partnership', weeks: 'Ongoing Retainer', team: 'Dedicated Senior Squad' },
];

export default function ScopeEstimator({ onAttach }) {
    const [selectedScope, setSelectedScope] = useState(SCOPES[1].value);
    const [attached, setAttached] = useState(false);

    const current = SCOPES.find((s) => s.value === selectedScope) || SCOPES[1];

    const handleAttach = () => {
        const text = `\n\n--- Project Estimation Parameter ---\nObjective: ${current.label}\nEstimated Timeline: ${current.weeks}\nRecommended Team: ${current.team}\n-----------------------------------\n`;
        if (typeof onAttach === 'function') {
            onAttach(text);
        }
        setAttached(true);
        setTimeout(() => setAttached(false), 2500);
    };

    return (
        <div className="card estimator-card" style={{ padding: 'var(--space-6)', marginTop: 'var(--space-8)' }}>
            <p className="chapter__index" style={{ marginBottom: 'var(--space-2)' }}>
                <span className="code">CALCULATOR</span> REAL-TIME ESTIMATOR
            </p>
            <h3 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-display)', marginBottom: 'var(--space-4)', color: 'var(--color-text)' }}>
                Scope, Timeline &amp; Squad Estimator
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginBottom: 'var(--space-4)' }}>
                Select your engineering objective to benchmark expected delivery velocity:
            </p>

            <div style={{ marginBottom: 'var(--space-4)' }}>
                <select
                    className="select-input"
                    value={selectedScope}
                    onChange={(e) => setSelectedScope(e.target.value)}
                    style={{
                        width: '100%',
                        padding: '10px 14px',
                        background: 'var(--color-surface-2)',
                        border: '1px solid var(--color-border)',
                        color: 'var(--color-text)',
                        borderRadius: 'var(--radius-sm)',
                        fontFamily: 'var(--font-sans)',
                    }}
                >
                    {SCOPES.map((s) => (
                        <option key={s.value} value={s.value}>
                            {s.label}
                        </option>
                    ))}
                </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--space-4)', margin: 'var(--space-4) 0' }}>
                <div style={{ padding: 'var(--space-3)', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)' }}>
                    <div style={{ fontSize: '0.6875rem', fontFamily: 'var(--font-mono)', color: 'var(--color-text-faint)', textTransform: 'uppercase' }}>ESTIMATED TIMELINE</div>
                    <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--color-primary)', marginTop: '4px' }}>{current.weeks}</div>
                </div>
                <div style={{ padding: 'var(--space-3)', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)' }}>
                    <div style={{ fontSize: '0.6875rem', fontFamily: 'var(--font-mono)', color: 'var(--color-text-faint)', textTransform: 'uppercase' }}>RECOMMENDED TEAM</div>
                    <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--color-text)', marginTop: '4px' }}>{current.team}</div>
                </div>
            </div>

            <button
                type="button"
                className="btn btn--ghost btn--sm"
                onClick={handleAttach}
                style={{ width: '100%', justifyContent: 'center' }}
            >
                {attached ? 'Attached to message ✓' : 'Attach estimate to message ↓'}
            </button>
        </div>
    );
}
