import React from 'react';
import { Link } from '@inertiajs/react';
import AppLayout from '../../Components/AppLayout';

export default function InsightsShow({ post, bodyHtml, related = [] }) {
    return (
        <AppLayout
            title={post.seo_title || `${post.title} — Insights`}
            description={post.seo_description || post.excerpt}
            pageType="detail"
        >
            <div className="wrap" style={{ paddingTop: 'var(--space-16)', paddingBottom: 'var(--space-20)' }}>
                {/* Breadcrumbs */}
                <div style={{ display: 'flex', gap: '8px', fontSize: '0.8125rem', fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-6)' }}>
                    <Link href="/insights" style={{ color: 'var(--color-text-muted)' }}>Insights</Link>
                    <span>/</span>
                    <span style={{ color: 'var(--color-text)' }}>{post.title}</span>
                </div>

                <header className="page-head" style={{ marginBottom: 'var(--space-12)', maxWidth: '780px' }}>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: 'var(--space-4)', fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--color-text-faint)' }}>
                        <span>{post.published_at ? new Date(post.published_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Recent'}</span>
                        <span>&middot;</span>
                        {post.reading_time && <span style={{ color: 'var(--color-primary)' }}>{post.reading_time} MIN READ</span>}
                    </div>
                    <h1 className="display display--md">{post.title}</h1>
                    {post.excerpt && (
                        <p className="body body--lead page-head__lede" style={{ fontStyle: 'italic' }}>
                            {post.excerpt}
                        </p>
                    )}
                </header>

                <article className="prose" style={{ maxWidth: '780px', lineHeight: 1.8, fontSize: '1.0625rem', color: 'var(--color-text)' }}>
                    {bodyHtml ? (
                        <div dangerouslySetInnerHTML={{ __html: bodyHtml }} />
                    ) : (
                        <div style={{ whiteSpace: 'pre-wrap' }}>{post.body}</div>
                    )}
                </article>

                {/* Related Insights */}
                {related.length > 0 && (
                    <div style={{ marginTop: 'var(--space-16)', paddingTop: 'var(--space-12)', borderTop: '1px solid var(--color-border)', maxWidth: '780px' }}>
                        <h2 className="display display--sm" style={{ marginBottom: 'var(--space-6)' }}>Related Insights</h2>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--space-4)' }}>
                            {related.map((rel) => (
                                <div key={rel.id} className="card" style={{ padding: 'var(--space-5)' }}>
                                    <h3 style={{ fontSize: '1.125rem', fontFamily: 'var(--font-display)', marginBottom: '6px' }}>
                                        <Link href={`/insights/${rel.slug}`} style={{ color: 'var(--color-text)', textDecoration: 'none' }}>
                                            {rel.title}
                                        </Link>
                                    </h3>
                                    <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>{rel.excerpt}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
