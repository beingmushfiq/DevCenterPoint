import React, { useState } from 'react';
import { useForm, Link } from '@inertiajs/react';
import AdminLayout from '../../../Components/AdminLayout';

export default function ServicesForm({ service = null }) {
    const isEdit = !!service?.id;
    const { data, setData, post, put, processing, errors } = useForm({
        title: service?.title || '',
        slug: service?.slug || '',
        tagline: service?.tagline || '',
        summary: service?.summary || '',
        body: service?.body || '',
        icon_key: service?.icon_key || 'cpu',
        status: service?.status || 'draft',
        is_featured: service?.is_featured ? true : false,
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
            put(`/admin/services/${service.id}`);
        } else {
            post('/admin/services');
        }
    };

    return (
        <AdminLayout
            title={isEdit ? `Edit: ${service.title}` : 'New Discipline'}
            breadcrumb={isEdit ? 'Edit Service' : 'New Service'}
        >
            <div className="card" style={{ padding: 'var(--space-8)', maxWidth: '900px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)' }}>
                    <h1 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-display)' }}>
                        {isEdit ? 'Edit Discipline' : 'Define Engineering Discipline'}
                    </h1>
                    <Link href="/admin/services" className="btn btn--ghost btn--sm">&larr; Back to list</Link>
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

                    <div>
                        <label className="field-label" htmlFor="tagline">Discipline Tagline</label>
                        <input
                            id="tagline"
                            type="text"
                            className="text-input"
                            value={data.tagline}
                            onChange={(e) => setData('tagline', e.target.value)}
                            placeholder="e.g. MISSION-CRITICAL SYSTEMS & DISTRIBUTED PLATFORMS"
                            style={{ width: '100%', padding: '10px 12px', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', color: 'var(--color-text)' }}
                        />
                    </div>

                    <div>
                        <label className="field-label" htmlFor="summary">Executive Summary</label>
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

                    <div>
                        <label className="field-label" htmlFor="body">Discipline Overview (Markdown)</label>
                        <textarea
                            id="body"
                            className="text-input"
                            rows="6"
                            value={data.body}
                            onChange={(e) => setData('body', e.target.value)}
                            placeholder="Detailed technical deliverables and approach..."
                            style={{ width: '100%', padding: '12px 14px', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', color: 'var(--color-text)', fontFamily: 'var(--font-mono)', lineHeight: 1.6 }}
                        />
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
                                {processing ? 'Persisting...' : (isEdit ? 'Save Changes' : 'Create Service')}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}
