import React, { useState } from 'react';
import AppLayout from '../Components/AppLayout';
import ThreeCanvas from '../Components/ThreeCanvas';

const CATEGORIES = [
    { value: 'all', label: 'All Updates' },
    { value: 'feature', label: 'Features' },
    { value: 'milestone', label: 'Milestones' },
    { value: 'improvement', label: 'Improvements' },
    { value: 'security', label: 'Security' },
    { value: 'announcement', label: 'Announcements' },
];

export default function Updates({ items = [], currentCategory = 'all' }) {
    const [selectedCategory, setSelectedCategory] = useState(currentCategory);

    const filtered = selectedCategory === 'all'
        ? items
        : items.filter((i) => i.category === selectedCategory);

    return (
        <AppLayout
            title="Updates & Changelog"
            description="Company updates, technical milestones, and engineering releases from DevCenterPoint."
            pageType="index"
        >
            <ThreeCanvas profile="calm" />

            <div className="wrap" style={{ paddingTop: 'var(--space-16)', paddingBottom: 'var(--space-20)', position: 'relative', zIndex: 2 }}>
                <header className="page-head" style={{ marginBottom: 'var(--space-12)' }}>
                    <p className="chapter__index"><span className="code">CHANGELOG</span> COMPANY UPDATES</p>
                    <h1 className="display display--md">Continuous deployment log.</h1>
                    <p className="body body--lead page-head__lede">
                        Live stream of new platform releases, architectural milestones, and capability expansions.
                    </p>
                </header>

                {/* Categories */}
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: 'var(--space-10)' }}>
                    {CATEGORIES.map((cat) => (
                        <button
                            key={cat.value}
                            type="button"
                            className={`btn btn--ghost btn--sm ${selectedCategory === cat.value ? 'is-active' : ''}`}
                            onClick={() => setSelectedCategory(cat.value)}
                            style={selectedCategory === cat.value ? { borderColor: 'var(--color-primary)', color: 'var(--color-primary)' } : {}}
                        >
                            {cat.label}
                        </button>
                    ))}
                </div>

                {/* Timeline Entries */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)', maxWidth: '780px' }}>
                    {filtered.length === 0 ? (
                        <div className="card" style={{ padding: 'var(--space-8)', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                            No updates posted under this category yet.
                        </div>
                    ) : (
                        filtered.map((update) => (
                            <article key={update.id} id={update.slug} className="card" style={{ padding: 'var(--space-8)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)', flexWrap: 'wrap', gap: '8px' }}>
                                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                        {update.version_tag && (
                                            <span className="badge" style={{ borderColor: 'var(--color-primary)', color: 'var(--color-primary)', fontWeight: 600 }}>
                                                {update.version_tag}
                                            </span>
                                        )}
                                        <span className="badge">{update.category?.toUpperCase()}</span>
                                    </div>
                                    <span className="code" style={{ fontSize: '0.75rem', color: 'var(--color-text-faint)' }}>
                                        {update.published_at ? new Date(update.published_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Recent'}
                                    </span>
                                </div>

                                <h2 style={{ fontSize: '1.4rem', fontFamily: 'var(--font-display)', marginBottom: 'var(--space-3)', color: 'var(--color-text)' }}>
                                    {update.title}
                                </h2>

                                {update.summary && (
                                    <p style={{ fontSize: '1rem', color: 'var(--color-text-muted)', lineHeight: 1.6, marginBottom: 'var(--space-4)' }}>
                                        {update.summary}
                                    </p>
                                )}

                                {update.body && (
                                    <div className="prose" style={{ borderTop: '1px solid var(--color-border)', paddingTop: 'var(--space-4)', fontSize: '0.9375rem', color: 'var(--color-text)', whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>
                                        {update.body}
                                    </div>
                                )}
                            </article>
                        ))
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
