import React, { useState } from 'react';
import { Link } from '@inertiajs/react';
import AppLayout from '../../Components/AppLayout';
import ThreeCanvas from '../../Components/ThreeCanvas';

export default function InsightsIndex({ posts = [], tags = [], currentTag = null }) {
    const [selectedTag, setSelectedTag] = useState(currentTag || 'all');

    const filtered = selectedTag === 'all'
        ? posts
        : posts.filter((p) => p.tags?.some((t) => t.slug === selectedTag));

    return (
        <AppLayout
            title="Insights — Engineering Notes"
            description="Analysis of software architecture decisions, performance benchmarks, and lessons from high-throughput production systems."
            pageType="index"
        >
            <ThreeCanvas profile="calm" />

            <div className="wrap" style={{ paddingTop: 'var(--space-16)', paddingBottom: 'var(--space-20)', position: 'relative', zIndex: 2 }}>
                <header className="page-head" style={{ marginBottom: 'var(--space-12)' }}>
                    <p className="chapter__index"><span className="code">PUBLICATIONS</span> INSIGHTS</p>
                    <h1 className="display display--md">Architecture &amp; systems engineering.</h1>
                    <p className="body body--lead page-head__lede">
                        Notes from the field on system reliability, scaling bottlenecks, and what happens when architecture breaks.
                    </p>
                </header>

                {/* Tag Filters */}
                {tags.length > 0 && (
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: 'var(--space-8)' }}>
                        <button
                            type="button"
                            className={`btn btn--ghost btn--sm ${selectedTag === 'all' ? 'is-active' : ''}`}
                            onClick={() => setSelectedTag('all')}
                            style={selectedTag === 'all' ? { borderColor: 'var(--color-primary)', color: 'var(--color-primary)' } : {}}
                        >
                            All Insights
                        </button>
                        {tags.map((t) => (
                            <button
                                key={t.id || t.slug}
                                type="button"
                                className={`btn btn--ghost btn--sm ${selectedTag === t.slug ? 'is-active' : ''}`}
                                onClick={() => setSelectedTag(t.slug)}
                                style={selectedTag === t.slug ? { borderColor: 'var(--color-primary)', color: 'var(--color-primary)' } : {}}
                            >
                                {t.label}
                            </button>
                        ))}
                    </div>
                )}

                {/* Posts List */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: 'var(--space-6)' }}>
                    {filtered.map((post) => (
                        <div key={post.id} className="card" style={{ padding: 'var(--space-6)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                    <span className="code" style={{ fontSize: '0.75rem', color: 'var(--color-text-faint)' }}>
                                        {post.published_at ? new Date(post.published_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Recent'}
                                    </span>
                                    {post.reading_time && (
                                        <span className="code" style={{ fontSize: '0.75rem', color: 'var(--color-primary)' }}>
                                            {post.reading_time} MIN READ
                                        </span>
                                    )}
                                </div>
                                <h2 style={{ fontSize: '1.35rem', fontFamily: 'var(--font-display)', marginBottom: '8px' }}>
                                    <Link href={`/insights/${post.slug}`} style={{ color: 'var(--color-text)', textDecoration: 'none' }}>
                                        {post.title}
                                    </Link>
                                </h2>
                                <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
                                    {post.excerpt}
                                </p>
                            </div>
                            <div style={{ marginTop: 'var(--space-6)', paddingTop: 'var(--space-4)', borderTop: '1px solid var(--color-border)' }}>
                                <Link href={`/insights/${post.slug}`} className="btn btn--ghost btn--sm">
                                    Read Insight &rarr;
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </AppLayout>
    );
}
