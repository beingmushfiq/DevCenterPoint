import React from 'react';
import { Link } from '@inertiajs/react';
import AppLayout from '../../Components/AppLayout';

export default function WorkShow({ cs, metrics = [], tech = [], related = [], displayClient }) {
    return (
        <AppLayout
            title={cs.seo_title || `${cs.title} — Case Study`}
            description={cs.seo_description || cs.summary}
            pageType="detail"
        >
            <div className="wrap" style={{ paddingTop: 'var(--space-16)', paddingBottom: 'var(--space-20)' }}>
                {/* Breadcrumbs */}
                <div style={{ display: 'flex', gap: '8px', fontSize: '0.8125rem', fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-6)' }}>
                    <Link href="/work" style={{ color: 'var(--color-text-muted)' }}>Work</Link>
                    <span>/</span>
                    <span style={{ color: 'var(--color-text)' }}>{cs.title}</span>
                </div>

                <header className="page-head" style={{ marginBottom: 'var(--space-12)' }}>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
                        <span className="badge">{cs.sector || 'ENTERPRISE'}</span>
                        <span className="badge" style={{ borderColor: 'var(--color-primary)', color: 'var(--color-primary)' }}>
                            {cs.engagement ? cs.engagement.toUpperCase() : 'DELIVERY'}
                        </span>
                    </div>
                    <h1 className="display display--md">{cs.title}</h1>
                    <p className="body body--lead page-head__lede">{cs.summary}</p>

                    <div style={{ display: 'flex', gap: 'var(--space-8)', marginTop: 'var(--space-6)', flexWrap: 'wrap', borderTop: '1px solid var(--color-border)', paddingTop: 'var(--space-4)', fontSize: '0.875rem' }}>
                        <div>
                            <span style={{ color: 'var(--color-text-faint)', fontSize: '0.75rem', fontFamily: 'var(--font-mono)', display: 'block' }}>CLIENT</span>
                            <strong>{displayClient || cs.client_name}</strong>
                        </div>
                        {cs.duration && (
                            <div>
                                <span style={{ color: 'var(--color-text-faint)', fontSize: '0.75rem', fontFamily: 'var(--font-mono)', display: 'block' }}>TIMELINE</span>
                                <strong>{cs.duration}</strong>
                            </div>
                        )}
                        {cs.year && (
                            <div>
                                <span style={{ color: 'var(--color-text-faint)', fontSize: '0.75rem', fontFamily: 'var(--font-mono)', display: 'block' }}>YEAR</span>
                                <strong>{cs.year}</strong>
                            </div>
                        )}
                        {cs.team_size && (
                            <div>
                                <span style={{ color: 'var(--color-text-faint)', fontSize: '0.75rem', fontFamily: 'var(--font-mono)', display: 'block' }}>TEAM</span>
                                <strong>{cs.team_size} Engineers</strong>
                            </div>
                        )}
                    </div>
                </header>

                {/* Key Metrics */}
                {metrics.length > 0 && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-4)', marginBottom: 'var(--space-12)' }}>
                        {metrics.map((m) => (
                            <div key={m.id} className="card" style={{ padding: 'var(--space-6)', textAlign: 'center' }}>
                                <div style={{ fontSize: '2.5rem', fontFamily: 'var(--font-display)', color: 'var(--color-primary)', fontWeight: 700 }}>
                                    {m.prefix}{m.value}{m.unit}
                                </div>
                                <div style={{ fontWeight: 600, color: 'var(--color-text)', marginTop: '4px' }}>{m.label}</div>
                                {m.note && (
                                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>{m.note}</div>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {/* Narrative Sections */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 'var(--space-10)', maxWidth: '780px' }}>
                    {cs.context && (
                        <div>
                            <h2 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-display)', color: 'var(--color-primary)', marginBottom: '8px' }}>
                                01 &middot; The Context
                            </h2>
                            <p style={{ lineHeight: 1.7, color: 'var(--color-text)' }}>{cs.context}</p>
                        </div>
                    )}
                    {cs.challenge && (
                        <div>
                            <h2 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-display)', color: 'var(--color-primary)', marginBottom: '8px' }}>
                                02 &middot; The Technical Challenge
                            </h2>
                            <p style={{ lineHeight: 1.7, color: 'var(--color-text)' }}>{cs.challenge}</p>
                        </div>
                    )}
                    {cs.approach && (
                        <div>
                            <h2 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-display)', color: 'var(--color-primary)', marginBottom: '8px' }}>
                                03 &middot; What We Actually Built
                            </h2>
                            <p style={{ lineHeight: 1.7, color: 'var(--color-text)' }}>{cs.approach}</p>
                        </div>
                    )}
                    {cs.outcome && (
                        <div>
                            <h2 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-display)', color: 'var(--color-primary)', marginBottom: '8px' }}>
                                04 &middot; The Measurable Outcome
                            </h2>
                            <p style={{ lineHeight: 1.7, color: 'var(--color-text)' }}>{cs.outcome}</p>
                        </div>
                    )}

                    {/* Quote */}
                    {cs.quote && (
                        <div className="card" style={{ padding: 'var(--space-8)', borderLeft: '4px solid var(--color-primary)', fontStyle: 'italic' }}>
                            <p style={{ fontSize: '1.125rem', lineHeight: 1.6, color: 'var(--color-text)' }}>
                                &ldquo;{cs.quote}&rdquo;
                            </p>
                            {cs.quote_attribution && (
                                <p style={{ marginTop: 'var(--space-4)', fontStyle: 'normal', fontWeight: 600, color: 'var(--color-primary)' }}>
                                    &mdash; {cs.quote_attribution}
                                </p>
                            )}
                        </div>
                    )}

                    {/* Tech Stack */}
                    {tech.length > 0 && (
                        <div>
                            <h3 style={{ fontSize: '1rem', fontFamily: 'var(--font-mono)', color: 'var(--color-text-faint)', textTransform: 'uppercase', marginBottom: '10px' }}>
                                Technologies Utilised
                            </h3>
                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                {tech.map((t) => (
                                    <span key={t.id || t.label} className="badge">
                                        {t.label}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Related Work */}
                {related.length > 0 && (
                    <div style={{ marginTop: 'var(--space-16)', paddingTop: 'var(--space-12)', borderTop: '1px solid var(--color-border)' }}>
                        <h2 className="display display--sm" style={{ marginBottom: 'var(--space-8)' }}>Related Deliveries</h2>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 'var(--space-6)' }}>
                            {related.map((rel) => (
                                <div key={rel.id} className="card" style={{ padding: 'var(--space-6)' }}>
                                    <h3 style={{ fontSize: '1.2rem', fontFamily: 'var(--font-display)', marginBottom: '6px' }}>
                                        <Link href={`/work/${rel.slug}`} style={{ color: 'var(--color-text)', textDecoration: 'none' }}>
                                            {rel.title}
                                        </Link>
                                    </h3>
                                    <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginBottom: '12px' }}>{rel.summary}</p>
                                    <Link href={`/work/${rel.slug}`} className="btn btn--ghost btn--sm">Read &rarr;</Link>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
