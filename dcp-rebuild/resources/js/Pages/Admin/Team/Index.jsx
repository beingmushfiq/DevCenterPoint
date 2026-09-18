import React from 'react';
import { Link, router } from '@inertiajs/react';
import AdminLayout from '../../../Components/AdminLayout';

export default function TeamIndex({ items = [] }) {
    const handleDelete = (id, name) => {
        if (confirm(`Delete team member "${name}"?`)) {
            router.delete(`/admin/team/${id}`);
        }
    };

    return (
        <AdminLayout
            title="Team"
            breadcrumb="Team"
            topActions={
                <Link href="/admin/team/create" className="btn btn--primary btn--sm">
                    + New Team Member
                </Link>
            }
        >
            <div className="card" style={{ padding: 'var(--space-6)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
                    <h1 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-display)' }}>Engineering Leadership &amp; Squad</h1>
                    <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>{items.length} members</span>
                </div>

                <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid var(--color-border)', color: 'var(--color-text-faint)' }}>
                            <th style={{ padding: '10px 8px' }}>Name</th>
                            <th style={{ padding: '10px 8px' }}>Role</th>
                            <th style={{ padding: '10px 8px' }}>Location</th>
                            <th style={{ padding: '10px 8px' }}>Status</th>
                            <th style={{ padding: '10px 8px', textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((m) => (
                            <tr key={m.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                                <td style={{ padding: '12px 8px', fontWeight: 600, color: 'var(--color-text)' }}>
                                    {m.name}
                                </td>
                                <td style={{ padding: '12px 8px', color: 'var(--color-primary)', fontFamily: 'var(--font-mono)', fontSize: '0.8125rem' }}>
                                    {m.role}
                                </td>
                                <td style={{ padding: '12px 8px', color: 'var(--color-text-muted)' }}>
                                    {m.location || 'Remote'}
                                </td>
                                <td style={{ padding: '12px 8px' }}>
                                    <span className={`badge ${m.status === 'published' ? 'badge--success' : ''}`}>
                                        {m.status}
                                    </span>
                                </td>
                                <td style={{ padding: '12px 8px', textAlign: 'right' }}>
                                    <div style={{ display: 'inline-flex', gap: '8px' }}>
                                        <Link href={`/admin/team/${m.id}/edit`} className="btn btn--ghost btn--sm">
                                            Edit
                                        </Link>
                                        <button
                                            type="button"
                                            className="btn btn--ghost btn--sm"
                                            onClick={() => handleDelete(m.id, m.name)}
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
