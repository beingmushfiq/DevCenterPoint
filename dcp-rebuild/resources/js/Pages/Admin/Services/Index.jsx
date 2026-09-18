import React from 'react';
import { Link, router } from '@inertiajs/react';
import AdminLayout from '../../../Components/AdminLayout';

export default function ServicesIndex({ items = [] }) {
    const handleDelete = (id, title) => {
        if (confirm(`Delete service discipline "${title}"?`)) {
            router.delete(`/admin/services/${id}`);
        }
    };

    return (
        <AdminLayout
            title="Services"
            breadcrumb="Services"
            topActions={
                <Link href="/admin/services/create" className="btn btn--primary btn--sm">
                    + New Service
                </Link>
            }
        >
            <div className="card" style={{ padding: 'var(--space-6)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
                    <h1 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-display)' }}>Engineering Disciplines</h1>
                    <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>{items.length} records</span>
                </div>

                <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid var(--color-border)', color: 'var(--color-text-faint)' }}>
                            <th style={{ padding: '10px 8px' }}>Discipline</th>
                            <th style={{ padding: '10px 8px' }}>Tagline</th>
                            <th style={{ padding: '10px 8px' }}>Status</th>
                            <th style={{ padding: '10px 8px', textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((s) => (
                            <tr key={s.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                                <td style={{ padding: '12px 8px', fontWeight: 600, color: 'var(--color-text)' }}>
                                    {s.title}
                                </td>
                                <td style={{ padding: '12px 8px', color: 'var(--color-text-muted)', fontSize: '0.8125rem' }}>
                                    {s.tagline}
                                </td>
                                <td style={{ padding: '12px 8px' }}>
                                    <span className={`badge ${s.status === 'published' ? 'badge--success' : ''}`}>
                                        {s.status}
                                    </span>
                                </td>
                                <td style={{ padding: '12px 8px', textAlign: 'right' }}>
                                    <div style={{ display: 'inline-flex', gap: '8px' }}>
                                        <Link href={`/admin/services/${s.id}/edit`} className="btn btn--ghost btn--sm">
                                            Edit
                                        </Link>
                                        <button
                                            type="button"
                                            className="btn btn--ghost btn--sm"
                                            onClick={() => handleDelete(s.id, s.title)}
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
