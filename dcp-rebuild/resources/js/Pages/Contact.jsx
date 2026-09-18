import React, { useState } from 'react';
import { useForm, usePage } from '@inertiajs/react';
import AppLayout from '../Components/AppLayout';
import ScopeEstimator from '../Components/ScopeEstimator';

export default function Contact({ enquiryTypes = [], budgetRanges = [], selectedType = '', sent = false }) {
    const { site } = usePage().props;
    const { data, setData, post, processing, errors, reset, recentlySuccessful } = useForm({
        name: '',
        email: '',
        company: '',
        phone: '',
        enquiry_type: selectedType || 'delivery',
        budget_range: '',
        message: '',
        website: '', // honeypot
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post('/contact', {
            onSuccess: () => reset(),
        });
    };

    const handleAttachEstimate = (estimateText) => {
        setData('message', (data.message ? data.message + '\n' : '') + estimateText);
    };

    return (
        <AppLayout
            title="Start a Project — Contact"
            description="Discuss your engineering constraints with a principal architect. Reply within one business day."
            pageType="detail"
        >
            <div className="wrap" style={{ paddingTop: 'var(--space-16)', paddingBottom: 'var(--space-20)' }}>
                <header className="page-head" style={{ marginBottom: 'var(--space-12)' }}>
                    <p className="chapter__index"><span className="code">CONVERSATION</span> START A PROJECT</p>
                    <h1 className="display display--md">Tell us what you need built.</h1>
                    <p className="body body--lead page-head__lede">
                        We reply within one business day with what it takes, what we would build first, and what we would refuse to build.
                    </p>
                </header>

                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 3fr) minmax(0, 2fr)', gap: 'var(--space-12)' }}>
                    {/* Form */}
                    <div>
                        {(sent || recentlySuccessful) && (
                            <div className="card" style={{ padding: 'var(--space-6)', borderColor: '#10b981', background: 'rgba(16, 185, 129, 0.08)', marginBottom: 'var(--space-6)' }}>
                                <h3 style={{ color: '#10b981', fontSize: '1.125rem', fontFamily: 'var(--font-display)', marginBottom: '6px' }}>
                                    Message Dispatched Successfully
                                </h3>
                                <p style={{ fontSize: '0.875rem', color: 'var(--color-text)' }}>
                                    Thank you. A principal systems architect will review your project parameters and reply within one business day.
                                </p>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="form" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
                            {/* Honeypot */}
                            <div style={{ display: 'none' }}>
                                <input
                                    type="text"
                                    name="website"
                                    value={data.website}
                                    onChange={(e) => setData('website', e.target.value)}
                                    tabIndex="-1"
                                    autoComplete="off"
                                />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--space-4)' }}>
                                <div>
                                    <label className="field-label" htmlFor="name">Your Name *</label>
                                    <input
                                        id="name"
                                        type="text"
                                        className="text-input"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        required
                                        style={{ width: '100%', padding: '12px 14px', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', color: 'var(--color-text)' }}
                                    />
                                    {errors.name && <span style={{ color: 'var(--vermilion-400)', fontSize: '0.75rem' }}>{errors.name}</span>}
                                </div>

                                <div>
                                    <label className="field-label" htmlFor="email">Work Email *</label>
                                    <input
                                        id="email"
                                        type="email"
                                        className="text-input"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        required
                                        style={{ width: '100%', padding: '12px 14px', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', color: 'var(--color-text)' }}
                                    />
                                    {errors.email && <span style={{ color: 'var(--vermilion-400)', fontSize: '0.75rem' }}>{errors.email}</span>}
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--space-4)' }}>
                                <div>
                                    <label className="field-label" htmlFor="company">Company / Organisation</label>
                                    <input
                                        id="company"
                                        type="text"
                                        className="text-input"
                                        value={data.company}
                                        onChange={(e) => setData('company', e.target.value)}
                                        style={{ width: '100%', padding: '12px 14px', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', color: 'var(--color-text)' }}
                                    />
                                </div>

                                <div>
                                    <label className="field-label" htmlFor="phone">Phone / WhatsApp</label>
                                    <input
                                        id="phone"
                                        type="tel"
                                        className="text-input"
                                        value={data.phone}
                                        onChange={(e) => setData('phone', e.target.value)}
                                        style={{ width: '100%', padding: '12px 14px', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', color: 'var(--color-text)' }}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="field-label">Enquiry Objective</label>
                                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '6px' }}>
                                    {[
                                        { value: 'review', label: 'Architecture Review' },
                                        { value: 'sprint', label: '2-Week Sprint' },
                                        { value: 'delivery', label: 'Full Product Delivery' },
                                        { value: 'partnership', label: 'Embedded Squad' },
                                        { value: 'other', label: 'Other' },
                                    ].map((t) => (
                                        <button
                                            key={t.value}
                                            type="button"
                                            className={`btn btn--ghost btn--sm ${data.enquiry_type === t.value ? 'is-active' : ''}`}
                                            onClick={() => setData('enquiry_type', t.value)}
                                            style={data.enquiry_type === t.value ? { borderColor: 'var(--color-primary)', color: 'var(--color-primary)' } : {}}
                                        >
                                            {t.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="field-label" htmlFor="message">Problem Description &amp; Scope *</label>
                                <textarea
                                    id="message"
                                    className="text-input"
                                    rows="6"
                                    value={data.message}
                                    onChange={(e) => setData('message', e.target.value)}
                                    placeholder="Tell us what you are trying to build, existing stack constraints, and timeline targets..."
                                    required
                                    style={{ width: '100%', padding: '12px 14px', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', color: 'var(--color-text)', fontFamily: 'var(--font-sans)', lineHeight: 1.6 }}
                                />
                                {errors.message && <span style={{ color: 'var(--vermilion-400)', fontSize: '0.75rem' }}>{errors.message}</span>}
                            </div>

                            <div>
                                <button
                                    type="submit"
                                    className="btn btn--primary"
                                    disabled={processing}
                                    style={{ padding: '14px 28px', fontSize: '1rem' }}
                                >
                                    {processing ? 'Dispatching Message...' : 'Transmit Enquiry →'}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Sidebar with Scope Estimator and Direct Contacts */}
                    <div>
                        <div className="card" style={{ padding: 'var(--space-6)' }}>
                            <h3 style={{ fontSize: '1.125rem', fontFamily: 'var(--font-display)', marginBottom: 'var(--space-3)' }}>
                                Direct Contact Channels
                            </h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', fontSize: '0.875rem' }}>
                                {site?.email && (
                                    <div>
                                        <div style={{ fontSize: '0.6875rem', fontFamily: 'var(--font-mono)', color: 'var(--color-text-faint)' }}>INBOX</div>
                                        <a href={`mailto:${site.email}`} style={{ color: 'var(--color-primary)' }}>{site.email}</a>
                                    </div>
                                )}
                                {site?.phone && (
                                    <div>
                                        <div style={{ fontSize: '0.6875rem', fontFamily: 'var(--font-mono)', color: 'var(--color-text-faint)' }}>DIRECT TELEPHONE</div>
                                        <a href={`tel:${site.phone.replace(/[^\d+]/g, '')}`}>{site.phone}</a>
                                    </div>
                                )}
                                <div>
                                    <div style={{ fontSize: '0.6875rem', fontFamily: 'var(--font-mono)', color: 'var(--color-text-faint)' }}>SLA COMMITMENT</div>
                                    <span style={{ color: 'var(--color-text-muted)' }}>1 business day guaranteed triage</span>
                                </div>
                            </div>
                        </div>

                        <ScopeEstimator onAttach={handleAttachEstimate} />
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
