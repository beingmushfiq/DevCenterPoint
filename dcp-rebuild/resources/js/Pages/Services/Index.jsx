import React, { useState } from 'react';
import { Link } from '@inertiajs/react';
import AppLayout from '../../Components/AppLayout';
import ThreeCanvas from '../../Components/ThreeCanvas';

export default function ServicesIndex({ services = [], deliverables = {}, faqs = [] }) {
    const [openFaq, setOpenFaq] = useState(null);

    return (
        <AppLayout
            title="Services — Engineering Disciplines"
            description="Product engineering, architecture review, design sprints, platform modernisation, reliability and embedded engineering."
            pageType="index"
        >
            <ThreeCanvas profile="calm" />

            <div className="wrap" style={{ paddingTop: 'var(--space-16)', paddingBottom: 'var(--space-20)', position: 'relative', zIndex: 2 }}>
                <header className="page-head" style={{ marginBottom: 'var(--space-12)' }}>
                    <p className="chapter__index"><span className="code">DISCIPLINES</span> WHAT WE DO</p>
                    <h1 className="display display--md">Engineering capabilities.</h1>
                    <p className="body body--lead page-head__lede">
                        We take end-to-end technical responsibility. No handoffs, no junior tiers, no vanishing acts.
                    </p>
                </header>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: 'var(--space-6)', marginBottom: 'var(--space-16)' }}>
                    {services.map((s) => (
                        <div key={s.id} className="card" style={{ padding: 'var(--space-8)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                            <div>
                                <p className="chapter__index" style={{ fontSize: '0.75rem', marginBottom: '8px' }}>
                                    {s.tagline || 'CORE DISCIPLINE'}
                                </p>
                                <h2 style={{ fontSize: '1.4rem', fontFamily: 'var(--font-display)', marginBottom: '12px' }}>
                                    <Link href={`/services/${s.slug}`} style={{ color: 'var(--color-text)', textDecoration: 'none' }}>
                                        {s.title}
                                    </Link>
                                </h2>
                                <p style={{ fontSize: '0.9375rem', color: 'var(--color-text-muted)', lineHeight: 1.6, marginBottom: 'var(--space-6)' }}>
                                    {s.summary}
                                </p>

                                {deliverables[s.id] && deliverables[s.id].length > 0 && (
                                    <div style={{ marginBottom: 'var(--space-6)' }}>
                                        <div style={{ fontSize: '0.6875rem', fontFamily: 'var(--font-mono)', color: 'var(--color-text-faint)', textTransform: 'uppercase', marginBottom: '8px' }}>
                                            Key Deliverables
                                        </div>
                                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                            {deliverables[s.id].map((del, i) => (
                                                <span key={i} className="badge" style={{ fontSize: '0.75rem' }}>
                                                    {del}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: 'var(--space-4)' }}>
                                <Link href={`/services/${s.slug}`} className="btn btn--ghost btn--sm">
                                    Deep dive discipline &rarr;
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>

                {/* FAQs */}
                {faqs.length > 0 && (
                    <div style={{ marginTop: 'var(--space-16)', paddingTop: 'var(--space-12)', borderTop: '1px solid var(--color-border)', maxWidth: '800px' }}>
                        <p className="chapter__index"><span className="code">QUESTIONS</span> FAQ</p>
                        <h2 className="display display--sm" style={{ marginBottom: 'var(--space-8)' }}>
                            Frequently asked questions.
                        </h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                            {faqs.map((f) => (
                                <div key={f.id} className="card" style={{ padding: 'var(--space-5)' }}>
                                    <button
                                        type="button"
                                        onClick={() => setOpenFaq(openFaq === f.id ? null : f.id)}
                                        style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'none', border: 'none', color: 'var(--color-text)', fontSize: '1.0625rem', fontFamily: 'var(--font-display)', textAlign: 'left', cursor: 'pointer' }}
                                    >
                                        <span>{f.question}</span>
                                        <span style={{ color: 'var(--color-primary)', fontSize: '1.25rem' }}>
                                            {openFaq === f.id ? '−' : '+'}
                                        </span>
                                    </button>
                                    {openFaq === f.id && (
                                        <p style={{ marginTop: 'var(--space-4)', fontSize: '0.9375rem', color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
                                            {f.answer}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
