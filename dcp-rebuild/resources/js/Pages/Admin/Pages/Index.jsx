import React from 'react';
import { Link, router } from '@inertiajs/react';
import AdminLayout from '../../../Components/AdminLayout';

export default function PagesIndex({ items = [] }) {
    const handleDelete = (id, title) => {
        if (confirm(`Delete page "${title}"?`)) {
            router.delete(`/admin/pages/${id}`);
        }
    };

    return (
        <AdminLayout
            title="Pages"
            breadcrumb="Pages"
            topActions={
                <Link href="/admin/pages/create" className="btn btn--primary btn--sm">
                    + New Page
                </Link>
            }
        >
            <div className="card" style={{ padding: 'var(--space-6)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
                    <h1 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-display)' }}>Static &amp; Content Pages</h1>
                    <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>{items.length} pages</span>
                </div>

                <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid var(--color-border)', color: 'var(--color-text-faint)' }}>
                            <th style={{ padding: '10px 8px' }}>Title</th>
                            <th style={{ padding: '10px 8px' }}>Slug</th>
                            <th style={{ padding: '10px 8px' }}>Template</th>
                            <th style={{ padding: '10px 8px' }}>Status</th>
                            <th style={{ padding: '10px 8px', textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((p) => (
                            <tr key={p.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                                <td style={{ padding: '12px 8px', fontWeight: 600, color: 'var(--color-text)' }}>
                                    {p.title}
                                </td>
                                <td style={{ padding: '12px 8px', fontFamily: 'var(--font-mono)', color: 'var(--color-primary)', fontSize: '0.8125rem' }}>
                                    /{p.slug}
                                </td>
                                <td style={{ padding: '12px 8px' }}>
                                    <span className="badge">{p.template || 'standard'}</span>
                                </td>
                                <td style={{ padding: '12px 8px' }}>
                                    <span className={`badge ${p.status === 'published' ? 'badge--success' : ''}`}>
                                        {p.status}
                                    </span>
                                </td>
                                <td style={{ padding: '12px 8px', textAlign: 'right' }}>
                                    <div style={{ display: 'inline-flex', gap: '8px' }}>
                                        <Link href={`/admin/pages/${p.id}/edit`} className="btn btn--ghost btn--sm">
                                            Edit
                                        </Link>
                                        <button
                                            type="button"
                                            className="btn btn--ghost btn--sm"
                                            onClick={() => handleDelete(p.id, p.title)}
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
