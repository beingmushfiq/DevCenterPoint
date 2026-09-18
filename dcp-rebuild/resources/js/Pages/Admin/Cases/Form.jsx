import React, { useState } from 'react';
import { useForm, Link } from '@inertiajs/react';
import AdminLayout from '../../../Components/AdminLayout';

export default function CasesForm({ cs = null }) {
    const isEdit = !!cs?.id;
    const { data, setData, post, put, processing, errors } = useForm({
        title: cs?.title || '',
        slug: cs?.slug || '',
        client_name: cs?.client_name || '',
        client_visibility: cs?.client_visibility || 'named',
        client_label: cs?.client_label || '',
        sector: cs?.sector || 'Logistics & Supply Chain',
        engagement: cs?.engagement || 'delivery',
        year: cs?.year || 2026,
        duration: cs?.duration || '12 weeks',
        team_size: cs?.team_size || 3,
        summary: cs?.summary || '',
        context: cs?.context || '',
        challenge: cs?.challenge || '',
        approach: cs?.approach || '',
        outcome: cs?.outcome || '',
        quote: cs?.quote || '',
        quote_attribution: cs?.quote_attribution || '',
        status: cs?.status || 'draft',
        is_featured: cs?.is_featured ? true : false,
    });

    const [slugTouched, setSlugTouched] = useState(isEdit);

    const handleTitleChange = (e) => {
        const title = e.target.value;
        setData('title', title);
        if (!slugTouched) {
            const derived = title
                .toLowerCase()
                .replace(/[^a-z0-9\s-]/g, '')
                .trim()
                .replace(/\s+/g, '-')
                .slice(0, 80);
            setData('slug', derived);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (isEdit) {
            put(`/admin/cases/${cs.id}`);
        } else {
            post('/admin/cases');
        }
    };

    return (
        <AdminLayout
            title={isEdit ? `Edit: ${cs.title}` : 'New Case Study'}
            breadcrumb={isEdit ? 'Edit Case' : 'New Case'}
        >
            <div className="card" style={{ padding: 'var(--space-8)', maxWidth: '900px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)' }}>
                    <h1 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-display)' }}>
                        {isEdit ? 'Edit Case Study' : 'Author New Case Study'}
                    </h1>
                    <Link href="/admin/cases" className="btn btn--ghost btn--sm">&larr; Back to list</Link>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 'var(--space-4)' }}>
                        <div>
                            <label className="field-label" htmlFor="title">Title *</label>
                            <input
                                id="title"
                                type="text"
                                className="text-input"
                                value={data.title}
                                onChange={handleTitleChange}
                                required
                                style={{ width: '100%', padding: '10px 12px', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', color: 'var(--color-text)' }}
                            />
                            {errors.title && <span style={{ color: 'var(--vermilion-400)', fontSize: '0.75rem' }}>{errors.title}</span>}
                        </div>

                        <div>
                            <label className="field-label" htmlFor="slug">Slug *</label>
                            <input
                                id="slug"
                                type="text"
                                className="text-input"
                                value={data.slug}
                                onChange={(e) => { setSlugTouched(true); setData('slug', e.target.value); }}
                                required
                                style={{ width: '100%', padding: '10px 12px', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', color: 'var(--color-text)' }}
                            />
                            {errors.slug && <span style={{ color: 'var(--vermilion-400)', fontSize: '0.75rem' }}>{errors.slug}</span>}
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-4)' }}>
                        <div>
                            <label className="field-label" htmlFor="client_name">Client Name *</label>
                            <input
                                id="client_name"
                                type="text"
                                className="text-input"
                                value={data.client_name}
                                onChange={(e) => setData('client_name', e.target.value)}
                                required
                                style={{ width: '100%', padding: '10px 12px', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', color: 'var(--color-text)' }}
                            />
                        </div>

                        <div>
                            <label className="field-label" htmlFor="sector">Sector</label>
                            <input
                                id="sector"
                                type="text"
                                className="text-input"
                                value={data.sector}
                                onChange={(e) => setData('sector', e.target.value)}
                                style={{ width: '100%', padding: '10px 12px', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', color: 'var(--color-text)' }}
                            />
                        </div>

                        <div>
                            <label className="field-label" htmlFor="engagement">Engagement Type</label>
                            <select
                                id="engagement"
                                className="select-input"
                                value={data.engagement}
                                onChange={(e) => setData('engagement', e.target.value)}
                                style={{ width: '100%', padding: '10px 12px', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', color: 'var(--color-text)' }}
                            >
                                <option value="delivery">Delivery</option>
                                <option value="review">Review</option>
                                <option value="sprint">Sprint</option>
                                <option value="partnership">Partnership</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="field-label" htmlFor="summary">Executive Summary (Card &amp; SEO)</label>
                        <textarea
                            id="summary"
                            className="text-input"
                            rows="2"
                            value={data.summary}
                            onChange={(e) => setData('summary', e.target.value)}
                            required
                            style={{ width: '100%', padding: '10px 12px', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', color: 'var(--color-text)' }}
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--space-4)' }}>
                        <div>
                            <label className="field-label" htmlFor="context">01 &middot; Context</label>
                            <textarea
                                id="context"
                                className="text-input"
                                rows="4"
                                value={data.context}
                                onChange={(e) => setData('context', e.target.value)}
                                style={{ width: '100%', padding: '10px 12px', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', color: 'var(--color-text)' }}
                            />
                        </div>
                        <div>
                            <label className="field-label" htmlFor="challenge">02 &middot; Challenge</label>
                            <textarea
                                id="challenge"
                                className="text-input"
                                rows="4"
                                value={data.challenge}
                                onChange={(e) => setData('challenge', e.target.value)}
                                style={{ width: '100%', padding: '10px 12px', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', color: 'var(--color-text)' }}
                            />
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--space-4)' }}>
                        <div>
                            <label className="field-label" htmlFor="approach">03 &middot; Approach &amp; Implementation</label>
                            <textarea
                                id="approach"
                                className="text-input"
                                rows="4"
                                value={data.approach}
                                onChange={(e) => setData('approach', e.target.value)}
                                style={{ width: '100%', padding: '10px 12px', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', color: 'var(--color-text)' }}
                            />
                        </div>
                        <div>
                            <label className="field-label" htmlFor="outcome">04 &middot; Measurable Outcome</label>
                            <textarea
                                id="outcome"
                                className="text-input"
                                rows="4"
                                value={data.outcome}
                                onChange={(e) => setData('outcome', e.target.value)}
                                style={{ width: '100%', padding: '10px 12px', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', color: 'var(--color-text)' }}
                            />
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-4)', alignItems: 'center' }}>
                        <div>
                            <label className="field-label" htmlFor="status">Publish Status</label>
                            <select
                                id="status"
                                className="select-input"
                                value={data.status}
                                onChange={(e) => setData('status', e.target.value)}
                                style={{ width: '100%', padding: '10px 12px', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', color: 'var(--color-text)' }}
                            >
                                <option value="draft">Draft</option>
                                <option value="published">Published</option>
                            </select>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '24px' }}>
                            <input
                                id="is_featured"
                                type="checkbox"
                                checked={data.is_featured}
                                onChange={(e) => setData('is_featured', e.target.checked)}
                            />
                            <label htmlFor="is_featured" style={{ fontSize: '0.875rem', color: 'var(--color-text)' }}>
                                Feature on Homepage
                            </label>
                        </div>

                        <div style={{ textAlign: 'right', marginTop: '20px' }}>
                            <button
                                type="submit"
                                className="btn btn--primary"
                                disabled={processing}
                                style={{ width: '100%', justifyContent: 'center' }}
                            >
                                {processing ? 'Persisting...' : (isEdit ? 'Save Changes' : 'Create Case Study')}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}
