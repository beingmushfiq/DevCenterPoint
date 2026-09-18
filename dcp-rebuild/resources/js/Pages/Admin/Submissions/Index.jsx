import React from 'react';
import { router } from '@inertiajs/react';
import AdminLayout from '../../../Components/AdminLayout';

export default function SubmissionsIndex({ submissions = [] }) {
    const markAsRead = (id) => {
        router.post(`/admin/submissions/${id}/toggle-read`);
    };

    const archive = (id) => {
        if (confirm('Archive this enquiry?')) {
            router.post(`/admin/submissions/${id}/archive`);
        }
    };

    return (
        <AdminLayout title="Client Enquiries" breadcrumb="Enquiries">
            <div className="card" style={{ padding: 'var(--space-6)' }}>
                <h1 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-display)', marginBottom: 'var(--space-4)' }}>
                    Incoming Client Enquiries
                </h1>

                {submissions.length === 0 ? (
                    <p style={{ color: 'var(--color-text-muted)' }}>No enquiries found in the database.</p>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                        {submissions.map((sub) => (
                            <div
                                key={sub.id}
                                style={{
                                    padding: 'var(--space-4)',
                                    background: 'var(--color-surface)',
                                    border: '1px solid var(--color-border)',
                                    borderRadius: 'var(--radius-sm)',
                                    borderLeft: sub.is_read ? '1px solid var(--color-border)' : '4px solid var(--color-primary)',
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                    <div>
                                        <strong style={{ fontSize: '1rem' }}>{sub.name}</strong>
                                        <span style={{ color: 'var(--color-text-muted)', marginLeft: '8px' }}>
                                            {sub.company ? `(${sub.company})` : ''}
                                        </span>
                                    </div>
                                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                        <span className="badge">{sub.enquiry_type}</span>
                                        <button
                                            type="button"
                                            className="btn btn--ghost btn--sm"
                                            onClick={() => markAsRead(sub.id)}
                                        >
                                            {sub.is_read ? 'Mark Unread' : 'Mark Read'}
                                        </button>
                                        <button
                                            type="button"
                                            className="btn btn--ghost btn--sm"
                                            onClick={() => archive(sub.id)}
                                            style={{ color: 'var(--vermilion-400)' }}
                                        >
                                            Archive
                                        </button>
                                    </div>
                                </div>

                                <div style={{ fontSize: '0.8125rem', fontFamily: 'var(--font-mono)', color: 'var(--color-primary)', marginBottom: '8px' }}>
                                    <a href={`mailto:${sub.email}`}>{sub.email}</a>
                                    {sub.phone && <span> &middot; {sub.phone}</span>}
                                    {sub.budget_range && <span> &middot; Budget: {sub.budget_range}</span>}
                                    <span style={{ color: 'var(--color-text-faint)', marginLeft: '8px' }}>
                                        {new Date(sub.created_at).toLocaleString()}
                                    </span>
                                </div>

                                <p style={{ fontSize: '0.9375rem', color: 'var(--color-text)', whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                                    {sub.message}
                                </p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
