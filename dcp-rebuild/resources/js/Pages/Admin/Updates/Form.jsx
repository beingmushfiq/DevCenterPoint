import React, { useState } from 'react';
import { useForm, Link } from '@inertiajs/react';
import AdminLayout from '../../../Components/AdminLayout';

export default function UpdatesForm({ update = null }) {
    const isEdit = !!update?.id;
    const { data, setData, post, put, processing, errors } = useForm({
        version_tag: update?.version_tag || '',
        title: update?.title || '',
        slug: update?.slug || '',
        category: update?.category || 'feature',
        summary: update?.summary || '',
        body: update?.body || '',
        status: update?.status || 'published',
        is_featured: update?.is_featured ? true : false,
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
            put(`/admin/updates/${update.id}`);
        } else {
            post('/admin/updates');
        }
    };

    return (
        <AdminLayout
            title={isEdit ? `Edit: ${update.title}` : 'New Platform Update'}
            breadcrumb={isEdit ? 'Edit Update' : 'New Update'}
        >
            <div className="card" style={{ padding: 'var(--space-8)', maxWidth: '900px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)' }}>
                    <h1 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-display)' }}>
                        {isEdit ? 'Edit Platform Update' : 'Publish Platform Update'}
                    </h1>
                    <Link href="/admin/updates" className="btn btn--ghost btn--sm">&larr; Back to list</Link>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1fr', gap: 'var(--space-4)' }}>
                        <div>
                            <label className="field-label" htmlFor="version_tag">Version Tag (e.g. v2.4.0)</label>
                            <input
                                id="version_tag"
                                type="text"
                                className="text-input"
                                value={data.version_tag}
                                onChange={(e) => setData('version_tag', e.target.value)}
                                placeholder="v1.0.0"
                                style={{ width: '100%', padding: '10px 12px', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', color: 'var(--color-text)' }}
                            />
                        </div>

                        <div>
                            <label className="field-label" htmlFor="title">Headline *</label>
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
                            <label className="field-label" htmlFor="category">Category</label>
                            <select
                                id="category"
                                className="select-input"
                                value={data.category}
                                onChange={(e) => setData('category', e.target.value)}
                                style={{ width: '100%', padding: '10px 12px', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', color: 'var(--color-text)' }}
                            >
                                <option value="feature">Feature</option>
                                <option value="milestone">Milestone</option>
                                <option value="improvement">Improvement</option>
                                <option value="security">Security</option>
                                <option value="announcement">Announcement</option>
                            </select>
                        </div>
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

                    <div>
                        <label className="field-label" htmlFor="summary">Summary *</label>
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
                        <label className="field-label" htmlFor="body">Release Details (Markdown)</label>
                        <textarea
                            id="body"
                            className="text-input"
                            rows="8"
                            value={data.body}
                            onChange={(e) => setData('body', e.target.value)}
                            placeholder="Detailed technical changes and changelog bullets..."
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
                                <option value="published">Published</option>
                                <option value="draft">Draft</option>
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
                                Highlighted Milestone
                            </label>
                        </div>

                        <div style={{ textAlign: 'right', marginTop: '20px' }}>
                            <button
                                type="submit"
                                className="btn btn--primary"
                                disabled={processing}
                                style={{ width: '100%', justifyContent: 'center' }}
                            >
                                {processing ? 'Persisting...' : (isEdit ? 'Save Changes' : 'Release Update')}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}
