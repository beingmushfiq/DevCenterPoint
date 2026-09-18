import React, { useState } from 'react';
import { Link } from '@inertiajs/react';
import AppLayout from '../../Components/AppLayout';
import ThreeCanvas from '../../Components/ThreeCanvas';

export default function WorkIndex({ items = [], sectors = [], currentSector = null, total = 0 }) {
    const [selectedSector, setSelectedSector] = useState(currentSector || 'all');

    const filtered = selectedSector === 'all'
        ? items
        : items.filter((item) => item.sector?.toLowerCase() === selectedSector.toLowerCase());

    return (
        <AppLayout
            title="Work — Case Studies"
            description="Engineering solutions delivered: what the problem was, what we built, and the measurable impact."
            pageType="index"
        >
            <ThreeCanvas profile="calm" />

            <div className="wrap" style={{ paddingTop: 'var(--space-16)', paddingBottom: 'var(--space-20)', position: 'relative', zIndex: 2 }}>
                <header className="page-head" style={{ marginBottom: 'var(--space-12)' }}>
                    <p className="chapter__index"><span className="code">INDEX</span> DELIVERED WORK</p>
                    <h1 className="display display--md">Engineering in production.</h1>
                    <p className="body body--lead page-head__lede">
                        Projects we have architected, built, and stood behind in live production environments.
                    </p>
                </header>

                {/* Filter bar */}
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: 'var(--space-8)' }}>
                    <button
                        type="button"
                        className={`btn btn--ghost btn--sm ${selectedSector === 'all' ? 'is-active' : ''}`}
                        onClick={() => setSelectedSector('all')}
                        style={selectedSector === 'all' ? { borderColor: 'var(--color-primary)', color: 'var(--color-primary)' } : {}}
                    >
                        All Sectors ({items.length})
                    </button>
                    {sectors.map((sec) => (
                        <button
                            key={sec}
                            type="button"
                            className={`btn btn--ghost btn--sm ${selectedSector === sec ? 'is-active' : ''}`}
                            onClick={() => setSelectedSector(sec)}
                            style={selectedSector === sec ? { borderColor: 'var(--color-primary)', color: 'var(--color-primary)' } : {}}
                        >
                            {sec}
                        </button>
                    ))}
                </div>

                {/* Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: 'var(--space-6)' }}>
                    {filtered.map((cs) => {
                        const clientDisplay = cs.client_visibility === 'named' ? cs.client_name : (cs.client_label || 'A client');
                        return (
                            <div key={cs.id} className="card" style={{ padding: 'var(--space-6)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                <div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                        <span className="badge">{cs.sector || 'TECHNOLOGY'}</span>
                                        <span className="code" style={{ color: 'var(--color-text-faint)', fontSize: '0.75rem' }}>{cs.year || '2026'}</span>
                                    </div>
                                    <h2 style={{ fontSize: '1.35rem', fontFamily: 'var(--font-display)', marginBottom: '8px' }}>
                                        <Link href={`/work/${cs.slug}`} style={{ color: 'var(--color-text)', textDecoration: 'none' }}>
                                            {cs.title}
                                        </Link>
                                    </h2>
                                    <div style={{ fontSize: '0.8125rem', color: 'var(--color-primary)', marginBottom: '12px', fontFamily: 'var(--font-mono)' }}>
                                        {clientDisplay} &middot; {cs.engagement || 'Delivery'}
                                    </div>
                                    <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
                                        {cs.summary}
                                    </p>
                                </div>
                                <div style={{ marginTop: 'var(--space-6)', paddingTop: 'var(--space-4)', borderTop: '1px solid var(--color-border)' }}>
                                    <Link href={`/work/${cs.slug}`} className="btn btn--ghost btn--sm">
                                        View Case Study &rarr;
                                    </Link>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </AppLayout>
    );
}
