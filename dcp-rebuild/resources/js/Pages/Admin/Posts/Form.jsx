import React, { useState } from 'react';
import { useForm, Link } from '@inertiajs/react';
import AdminLayout from '../../../Components/AdminLayout';

export default function PostsForm({ post = null }) {
    const isEdit = !!post?.id;
    const { data, setData, post: submitPost, put, processing, errors } = useForm({
        title: post?.title || '',
        slug: post?.slug || '',
        excerpt: post?.excerpt || '',
        body: post?.body || '',
        reading_time: post?.reading_time || 5,
        status: post?.status || 'draft',
        is_featured: post?.is_featured ? true : false,
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

    const handleBodyChange = (e) => {
        const val = e.target.value;
        setData('body', val);
        // Estimate reading time: ~200 wpm
        const words = val.trim().split(/\s+/).length;
        setData('reading_time', Math.max(1, Math.round(words / 200)));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (isEdit) {
            put(`/admin/posts/${post.id}`);
        } else {
            submitPost('/admin/posts');
        }
    };

    return (
        <AdminLayout
            title={isEdit ? `Edit: ${post.title}` : 'New Insight'}
            breadcrumb={isEdit ? 'Edit Insight' : 'New Insight'}
        >
            <div className="card" style={{ padding: 'var(--space-8)', maxWidth: '900px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)' }}>
                    <h1 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-display)' }}>
                        {isEdit ? 'Edit Insight Article' : 'Author Insight Article'}
                    </h1>
                    <Link href="/admin/posts" className="btn btn--ghost btn--sm">&larr; Back to list</Link>
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
                        <label className="field-label" htmlFor="excerpt">Excerpt</label>
                        <textarea
                            id="excerpt"
                            className="text-input"
                            rows="2"
                            value={data.excerpt}
                            onChange={(e) => setData('excerpt', e.target.value)}
                            style={{ width: '100%', padding: '10px 12px', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', color: 'var(--color-text)' }}
                        />
                    </div>

                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                            <label className="field-label" htmlFor="body">Article Markdown Body *</label>
                            <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--color-primary)' }}>
                                Est. {data.reading_time} min read
                            </span>
                        </div>
                        <textarea
                            id="body"
                            className="text-input"
                            rows="12"
                            value={data.body}
                            onChange={handleBodyChange}
                            required
                            placeholder="Write article in Markdown..."
                            style={{ width: '100%', padding: '12px 14px', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', color: 'var(--color-text)', fontFamily: 'var(--font-mono)', lineHeight: 1.6 }}
                        />
                        {errors.body && <span style={{ color: 'var(--vermilion-400)', fontSize: '0.75rem' }}>{errors.body}</span>}
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
                                {processing ? 'Persisting...' : (isEdit ? 'Save Changes' : 'Publish Insight')}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}
