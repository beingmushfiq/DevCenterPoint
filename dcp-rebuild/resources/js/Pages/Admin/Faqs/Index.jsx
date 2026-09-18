import React from 'react';
import { Link, router } from '@inertiajs/react';
import AdminLayout from '../../../Components/AdminLayout';

export default function FaqsIndex({ items = [] }) {
    const handleDelete = (id, q) => {
        if (confirm(`Delete FAQ "${q}"?`)) {
            router.delete(`/admin/faqs/${id}`);
        }
    };

    return (
        <AdminLayout
            title="FAQs"
            breadcrumb="FAQs"
            topActions={
                <Link href="/admin/faqs/create" className="btn btn--primary btn--sm">
                    + New FAQ
                </Link>
            }
        >
            <div className="card" style={{ padding: 'var(--space-6)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
                    <h1 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-display)' }}>Frequently Asked Questions</h1>
                    <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>{items.length} items</span>
                </div>

                <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid var(--color-border)', color: 'var(--color-text-faint)' }}>
                            <th style={{ padding: '10px 8px' }}>Question</th>
                            <th style={{ padding: '10px 8px' }}>Category</th>
                            <th style={{ padding: '10px 8px' }}>Status</th>
                            <th style={{ padding: '10px 8px', textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((f) => (
                            <tr key={f.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                                <td style={{ padding: '12px 8px', fontWeight: 600, color: 'var(--color-text)' }}>
                                    {f.question}
                                </td>
                                <td style={{ padding: '12px 8px' }}>
                                    <span className="badge">{f.category}</span>
                                </td>
                                <td style={{ padding: '12px 8px' }}>
                                    <span className={`badge ${f.status === 'published' ? 'badge--success' : ''}`}>
                                        {f.status}
                                    </span>
                                </td>
                                <td style={{ padding: '12px 8px', textAlign: 'right' }}>
                                    <div style={{ display: 'inline-flex', gap: '8px' }}>
                                        <Link href={`/admin/faqs/${f.id}/edit`} className="btn btn--ghost btn--sm">
                                            Edit
                                        </Link>
                                        <button
                                            type="button"
                                            className="btn btn--ghost btn--sm"
                                            onClick={() => handleDelete(f.id, f.question)}
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
