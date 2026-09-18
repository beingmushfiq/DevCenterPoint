import React from 'react';
import { Link } from '@inertiajs/react';
import AppLayout from '../../Components/AppLayout';

export default function ServicesShow({ service, deliverables = [], related = [], others = [] }) {
    return (
        <AppLayout
            title={service.seo_title || `${service.title} — Service`}
            description={service.seo_description || service.summary}
            pageType="detail"
        >
            <div className="wrap" style={{ paddingTop: 'var(--space-16)', paddingBottom: 'var(--space-20)' }}>
                {/* Breadcrumbs */}
                <div style={{ display: 'flex', gap: '8px', fontSize: '0.8125rem', fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-6)' }}>
                    <Link href="/services" style={{ color: 'var(--color-text-muted)' }}>Services</Link>
                    <span>/</span>
                    <span style={{ color: 'var(--color-text)' }}>{service.title}</span>
                </div>

                <header className="page-head" style={{ marginBottom: 'var(--space-12)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
                        <span className="badge" style={{ borderColor: 'rgb(16 185 129 / 0.4)', color: '#10b981' }}>
                            ACTIVE DISCIPLINE &middot; SENIOR LEAD ONLY
                        </span>
                    </div>
                    <p className="chapter__index"><span className="code">DISCIPLINE</span> {service.tagline || 'CORE ENGINEERING'}</p>
                    <h1 className="display display--md">{service.title}</h1>
                    <p className="body body--lead page-head__lede">{service.summary}</p>
                </header>

                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)', gap: 'var(--space-12)' }}>
                    <div>
                        {/* 4-Phase Delivery Process */}
                        <section style={{ marginBottom: 'var(--space-12)' }}>
                            <p className="chapter__index"><span className="code">HOW WE WORK</span> STEP-BY-STEP PROCESS</p>
                            <h2 className="display display--sm" style={{ marginBottom: 'var(--space-6)' }}>
                                From first discovery to final production handover
                            </h2>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--space-4)' }}>
                                <div className="card" style={{ padding: 'var(--space-6)', borderLeft: '2px solid var(--color-primary)' }}>
                                    <span style={{ color: 'var(--color-primary)', fontWeight: 600, fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>PHASE 01</span>
                                    <h3 style={{ fontSize: '1.125rem', fontFamily: 'var(--font-display)', margin: '8px 0', color: 'var(--color-text)' }}>Discovery &amp; Blueprint</h3>
                                    <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
                                        We analyze your constraints, audit existing bottlenecks, and produce an ironclad technical roadmap with zero ambiguity.
                                    </p>
                                </div>

                                <div className="card" style={{ padding: 'var(--space-6)', borderLeft: '2px solid var(--color-primary)' }}>
                                    <span style={{ color: 'var(--color-primary)', fontWeight: 600, fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>PHASE 02</span>
                                    <h3 style={{ fontSize: '1.125rem', fontFamily: 'var(--font-display)', margin: '8px 0', color: 'var(--color-text)' }}>Rapid Prototype &amp; Test</h3>
                                    <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
                                        We build working end-to-end prototypes early so you can touch, test, and benchmark actual software before scaling up.
                                    </p>
                                </div>

                                <div className="card" style={{ padding: 'var(--space-6)', borderLeft: '2px solid var(--color-primary)' }}>
                                    <span style={{ color: 'var(--color-primary)', fontWeight: 600, fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>PHASE 03</span>
                                    <h3 style={{ fontSize: '1.125rem', fontFamily: 'var(--font-display)', margin: '8px 0', color: 'var(--color-text)' }}>Hardening &amp; Quality Check</h3>
                                    <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
                                        Stress-testing, automated CI/CD pipeline verification, latency profiling, and security boundary isolation.
                                    </p>
                                </div>

                                <div className="card" style={{ padding: 'var(--space-6)', borderLeft: '2px solid var(--color-primary)' }}>
                                    <span style={{ color: 'var(--color-primary)', fontWeight: 600, fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>PHASE 04</span>
                                    <h3 style={{ fontSize: '1.125rem', fontFamily: 'var(--font-display)', margin: '8px 0', color: 'var(--color-text)' }}>Deployment &amp; Handover</h3>
                                    <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
                                        Zero-downtime release into production, documentation synthesis, and full training transfer to your team.
                                    </p>
                                </div>
                            </div>
                        </section>

                        {/* Deliverables */}
                        {deliverables.length > 0 && (
                            <section style={{ marginBottom: 'var(--space-12)' }}>
                                <h3 style={{ fontSize: '1.125rem', fontFamily: 'var(--font-display)', marginBottom: 'var(--space-4)' }}>
                                    Standard Deliverables in this Discipline
                                </h3>
                                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                    {deliverables.map((d, i) => (
                                        <span key={i} className="badge" style={{ padding: '6px 12px', fontSize: '0.8125rem' }}>
                                            {d}
                                        </span>
                                    ))}
                                </div>
                            </section>
                        )}
                    </div>

                    {/* Sidebar: CTA & other disciplines */}
                    <div>
                        <div className="card" style={{ padding: 'var(--space-6)', marginBottom: 'var(--space-6)' }}>
                            <h3 style={{ fontSize: '1.125rem', fontFamily: 'var(--font-display)', marginBottom: '8px' }}>Engage this Discipline</h3>
                            <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginBottom: 'var(--space-4)' }}>
                                Speak with a principal engineer about integrating this into your product roadmap.
                            </p>
                            <Link href="/contact" className="btn btn--primary" style={{ width: '100%', justifyContent: 'center' }}>
                                Start a project &rarr;
                            </Link>
                        </div>

                        {others.length > 0 && (
                            <div className="card" style={{ padding: 'var(--space-6)' }}>
                                <h4 style={{ fontSize: '0.875rem', fontFamily: 'var(--font-mono)', color: 'var(--color-text-faint)', textTransform: 'uppercase', marginBottom: '12px' }}>
                                    Other Disciplines
                                </h4>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    {others.map((oth) => (
                                        <Link
                                            key={oth.id}
                                            href={`/services/${oth.slug}`}
                                            style={{ color: 'var(--color-text)', textDecoration: 'none', fontSize: '0.9375rem', padding: '4px 0' }}
                                        >
                                            &rarr; {oth.title}
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
