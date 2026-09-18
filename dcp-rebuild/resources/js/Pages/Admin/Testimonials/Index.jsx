import React from 'react';
import { Link, router } from '@inertiajs/react';
import AdminLayout from '../../../Components/AdminLayout';

export default function TestimonialsIndex({ items = [] }) {
    const handleDelete = (id, attribution) => {
        if (confirm(`Delete testimonial from "${attribution}"?`)) {
            router.delete(`/admin/testimonials/${id}`);
        }
    };

    return (
        <AdminLayout
            title="Testimonials"
            breadcrumb="Testimonials"
            topActions={
                <Link href="/admin/testimonials/create" className="btn btn--primary btn--sm">
                    + New Testimonial
                </Link>
            }
        >
            <div className="card" style={{ padding: 'var(--space-6)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
                    <h1 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-display)' }}>Client Quotes &amp; Endorsements</h1>
                    <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>{items.length} testimonials</span>
                </div>

                <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid var(--color-border)', color: 'var(--color-text-faint)' }}>
                            <th style={{ padding: '10px 8px' }}>Attribution</th>
                            <th style={{ padding: '10px 8px' }}>Role / Company</th>
                            <th style={{ padding: '10px 8px' }}>Quote</th>
                            <th style={{ padding: '10px 8px' }}>Status</th>
                            <th style={{ padding: '10px 8px', textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((t) => (
                            <tr key={t.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                                <td style={{ padding: '12px 8px', fontWeight: 600, color: 'var(--color-text)' }}>
                                    {t.attribution}
                                </td>
                                <td style={{ padding: '12px 8px', color: 'var(--color-text-muted)', fontSize: '0.8125rem' }}>
                                    {t.role}{t.company ? `, ${t.company}` : ''}
                                </td>
                                <td style={{ padding: '12px 8px', color: 'var(--color-text-muted)', fontStyle: 'italic', maxWidth: '360px' }}>
                                    &ldquo;{t.quote.slice(0, 100)}...&rdquo;
                                </td>
                                <td style={{ padding: '12px 8px' }}>
                                    <span className={`badge ${t.status === 'published' ? 'badge--success' : ''}`}>
                                        {t.status}
                                    </span>
                                </td>
                                <td style={{ padding: '12px 8px', textAlign: 'right' }}>
                                    <div style={{ display: 'inline-flex', gap: '8px' }}>
                                        <Link href={`/admin/testimonials/${t.id}/edit`} className="btn btn--ghost btn--sm">
                                            Edit
                                        </Link>
                                        <button
                                            type="button"
                                            className="btn btn--ghost btn--sm"
                                            onClick={() => handleDelete(t.id, t.attribution)}
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
