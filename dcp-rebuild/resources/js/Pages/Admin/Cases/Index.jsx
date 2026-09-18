import React from 'react';
import { Link, router } from '@inertiajs/react';
import AdminLayout from '../../../Components/AdminLayout';

export default function CasesIndex({ items = [] }) {
    const handleDelete = (id, title) => {
        if (confirm(`Delete case study "${title}"?`)) {
            router.delete(`/admin/cases/${id}`);
        }
    };

    return (
        <AdminLayout
            title="Case Studies"
            breadcrumb="Case Studies"
            topActions={
                <Link href="/admin/cases/create" className="btn btn--primary btn--sm">
                    + New Case Study
                </Link>
            }
        >
            <div className="card" style={{ padding: 'var(--space-6)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
                    <h1 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-display)' }}>Manage Case Studies</h1>
                    <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>{items.length} records</span>
                </div>

                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--color-border)', color: 'var(--color-text-faint)' }}>
                                <th style={{ padding: '10px 8px' }}>Title</th>
                                <th style={{ padding: '10px 8px' }}>Client</th>
                                <th style={{ padding: '10px 8px' }}>Sector</th>
                                <th style={{ padding: '10px 8px' }}>Status</th>
                                <th style={{ padding: '10px 8px', textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((cs) => (
                                <tr key={cs.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                                    <td style={{ padding: '12px 8px', fontWeight: 600, color: 'var(--color-text)' }}>
                                        {cs.title}
                                    </td>
                                    <td style={{ padding: '12px 8px', color: 'var(--color-text-muted)' }}>
                                        {cs.client_name}
                                    </td>
                                    <td style={{ padding: '12px 8px' }}>
                                        <span className="badge">{cs.sector || 'GENERAL'}</span>
                                    </td>
                                    <td style={{ padding: '12px 8px' }}>
                                        <span className={`badge ${cs.status === 'published' ? 'badge--success' : ''}`}>
                                            {cs.status}
                                        </span>
                                    </td>
                                    <td style={{ padding: '12px 8px', textAlign: 'right' }}>
                                        <div style={{ display: 'inline-flex', gap: '8px' }}>
                                            <Link href={`/admin/cases/${cs.id}/edit`} className="btn btn--ghost btn--sm">
                                                Edit
                                            </Link>
                                            <button
                                                type="button"
                                                className="btn btn--ghost btn--sm"
                                                onClick={() => handleDelete(cs.id, cs.title)}
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
            </div>
        </AdminLayout>
    );
}
