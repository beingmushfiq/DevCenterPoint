import React from 'react';
import { Link, router } from '@inertiajs/react';
import AdminLayout from '../../../Components/AdminLayout';

export default function PostsIndex({ items = [] }) {
    const handleDelete = (id, title) => {
        if (confirm(`Delete insight "${title}"?`)) {
            router.delete(`/admin/posts/${id}`);
        }
    };

    return (
        <AdminLayout
            title="Insights"
            breadcrumb="Insights"
            topActions={
                <Link href="/admin/posts/create" className="btn btn--primary btn--sm">
                    + New Insight
                </Link>
            }
        >
            <div className="card" style={{ padding: 'var(--space-6)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
                    <h1 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-display)' }}>Engineering Insights &amp; Articles</h1>
                    <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>{items.length} articles</span>
                </div>

                <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid var(--color-border)', color: 'var(--color-text-faint)' }}>
                            <th style={{ padding: '10px 8px' }}>Title</th>
                            <th style={{ padding: '10px 8px' }}>Reading Time</th>
                            <th style={{ padding: '10px 8px' }}>Status</th>
                            <th style={{ padding: '10px 8px' }}>Date</th>
                            <th style={{ padding: '10px 8px', textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((post) => (
                            <tr key={post.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                                <td style={{ padding: '12px 8px', fontWeight: 600, color: 'var(--color-text)' }}>
                                    {post.title}
                                </td>
                                <td style={{ padding: '12px 8px', color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.8125rem' }}>
                                    {post.reading_time || 4} min
                                </td>
                                <td style={{ padding: '12px 8px' }}>
                                    <span className={`badge ${post.status === 'published' ? 'badge--success' : ''}`}>
                                        {post.status}
                                    </span>
                                </td>
                                <td style={{ padding: '12px 8px', color: 'var(--color-text-faint)', fontSize: '0.8125rem' }}>
                                    {post.published_at ? new Date(post.published_at).toLocaleDateString() : 'Draft'}
                                </td>
                                <td style={{ padding: '12px 8px', textAlign: 'right' }}>
                                    <div style={{ display: 'inline-flex', gap: '8px' }}>
                                        <Link href={`/admin/posts/${post.id}/edit`} className="btn btn--ghost btn--sm">
                                            Edit
                                        </Link>
                                        <button
                                            type="button"
                                            className="btn btn--ghost btn--sm"
                                            onClick={() => handleDelete(post.id, post.title)}
                                            style={{ color: 'var(--vermilion-400)' }}
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </AdminLayout>
    );
}
