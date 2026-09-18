import React from 'react';
import { Link, router } from '@inertiajs/react';
import AdminLayout from '../../../Components/AdminLayout';

export default function UpdatesIndex({ items = [] }) {
    const handleDelete = (id, title) => {
        if (confirm(`Delete update "${title}"?`)) {
            router.delete(`/admin/updates/${id}`);
        }
    };

    return (
        <AdminLayout
            title="Changelog & Updates"
            breadcrumb="Updates"
            topActions={
                <Link href="/admin/updates/create" className="btn btn--primary btn--sm">
                    + New Update
                </Link>
            }
        >
            <div className="card" style={{ padding: 'var(--space-6)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
                    <h1 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-display)' }}>Manage Platform Updates</h1>
                    <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>{items.length} records</span>
                </div>

                <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid var(--color-border)', color: 'var(--color-text-faint)' }}>
                            <th style={{ padding: '10px 8px' }}>Version</th>
                            <th style={{ padding: '10px 8px' }}>Title</th>
                            <th style={{ padding: '10px 8px' }}>Category</th>
                            <th style={{ padding: '10px 8px' }}>Status</th>
                            <th style={{ padding: '10px 8px', textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((up) => (
                            <tr key={up.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                                <td style={{ padding: '12px 8px', fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--color-primary)' }}>
                                    {up.version_tag || 'N/A'}
                                </td>
                                <td style={{ padding: '12px 8px', fontWeight: 600, color: 'var(--color-text)' }}>
                                    {up.title}
                                </td>
                                <td style={{ padding: '12px 8px' }}>
                                    <span className="badge">{up.category}</span>
                                </td>
                                <td style={{ padding: '12px 8px' }}>
                                    <span className={`badge ${up.status === 'published' ? 'badge--success' : ''}`}>
                                        {up.status}
                                    </span>
                                </td>
                                <td style={{ padding: '12px 8px', textAlign: 'right' }}>
                                    <div style={{ display: 'inline-flex', gap: '8px' }}>
                                        <Link href={`/admin/updates/${up.id}/edit`} className="btn btn--ghost btn--sm">
                                            Edit
                                        </Link>
                                        <button
                                            type="button"
                                            className="btn btn--ghost btn--sm"
                                            onClick={() => handleDelete(up.id, up.title)}
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
