import React, { useState } from 'react';
import { useForm, Link } from '@inertiajs/react';
import AdminLayout from '../../../Components/AdminLayout';

export default function PagesForm({ page = null }) {
    const isEdit = !!page?.id;
    const { data, setData, post, put, processing, errors } = useForm({
        title: page?.title || '',
        slug: page?.slug || '',
        heading: page?.heading || '',
        lede: page?.lede || '',
        body: page?.body || '',
        template: page?.template || 'standard',
        status: page?.status || 'draft',
        show_in_nav: page?.show_in_nav ? true : false,
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
            put(`/admin/pages/${page.id}`);
        } else {
            post('/admin/pages');
        }
    };

    return (
        <AdminLayout
            title={isEdit ? `Edit: ${page.title}` : 'New Static Page'}
            breadcrumb={isEdit ? 'Edit Page' : 'New Page'}
        >
            <div className="card" style={{ padding: 'var(--space-8)', maxWidth: '900px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)' }}>
                    <h1 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-display)' }}>
                        {isEdit ? 'Edit Page' : 'Create Static Page'}
                    </h1>
                    <Link href="/admin/pages" className="btn btn--ghost btn--sm">&larr; Back to list</Link>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 'var(--space-4)' }}>
                        <div>
                            <label className="field-label" htmlFor="title">Page Title *</label>
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
                        <label className="field-label" htmlFor="heading">Hero Heading</label>
                        <input
                            id="heading"
                            type="text"
                            className="text-input"
                            value={data.heading}
                            onChange={(e) => setData('heading', e.target.value)}
                            style={{ width: '100%', padding: '10px 12px', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', color: 'var(--color-text)' }}
                        />
                    </div>

                    <div>
                        <label className="field-label" htmlFor="lede">Lede Paragraph</label>
                        <textarea
                            id="lede"
                            className="text-input"
                            rows="2"
                            value={data.lede}
                            onChange={(e) => setData('lede', e.target.value)}
                            style={{ width: '100%', padding: '10px 12px', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', color: 'var(--color-text)' }}
                        />
                    </div>

                    <div>
                        <label className="field-label" htmlFor="body">Markdown Content</label>
                        <textarea
                            id="body"
                            className="text-input"
                            rows="10"
                            value={data.body}
                            onChange={(e) => setData('body', e.target.value)}
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

                        <div>
                            <label className="field-label" htmlFor="template">Template</label>
                            <select
                                id="template"
                                className="select-input"
                                value={data.template}
                                onChange={(e) => setData('template', e.target.value)}
                                style={{ width: '100%', padding: '10px 12px', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', color: 'var(--color-text)' }}
                            >
                                <option value="standard">Standard</option>
                                <option value="wide">Wide</option>
                                <option value="legal">Legal</option>
                            </select>
                        </div>

                        <div style={{ textAlign: 'right', marginTop: '20px' }}>
                            <button
                                type="submit"
                                className="btn btn--primary"
                                disabled={processing}
                                style={{ width: '100%', justifyContent: 'center' }}
                            >
                                {processing ? 'Persisting...' : (isEdit ? 'Save Changes' : 'Create Page')}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}
