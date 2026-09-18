import React from 'react';
import { Link } from '@inertiajs/react';
import AdminLayout from '../../Components/AdminLayout';

export default function Dashboard({ counts = {}, recentSubmissions = [], auditLogs = [] }) {
    return (
        <AdminLayout title="Dashboard" breadcrumb="Overview">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-4)', marginBottom: 'var(--space-8)' }}>
                <div className="card" style={{ padding: 'var(--space-5)' }}>
                    <div style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--color-text-faint)' }}>ENQUIRIES</div>
                    <div style={{ fontSize: '2rem', fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--color-primary)', marginTop: '4px' }}>
                        {counts.unreadSubmissions || 0}
                        <span style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', fontWeight: 400, marginLeft: '6px' }}>unread</span>
                    </div>
                </div>

                <div className="card" style={{ padding: 'var(--space-5)' }}>
                    <div style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--color-text-faint)' }}>CASE STUDIES</div>
                    <div style={{ fontSize: '2rem', fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--color-text)', marginTop: '4px' }}>
                        {counts.cases || 0}
                    </div>
                </div>

                <div className="card" style={{ padding: 'var(--space-5)' }}>
                    <div style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--color-text-faint)' }}>INSIGHTS</div>
                    <div style={{ fontSize: '2rem', fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--color-text)', marginTop: '4px' }}>
                        {counts.posts || 0}
                    </div>
                </div>

                <div className="card" style={{ padding: 'var(--space-5)' }}>
                    <div style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--color-text-faint)' }}>SERVICES</div>
                    <div style={{ fontSize: '2rem', fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--color-text)', marginTop: '4px' }}>
                        {counts.services || 0}
                    </div>
                </div>
            </div>

            {/* Quick Actions & Recent Enquiries */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 'var(--space-6)' }}>
                {/* Enquiries */}
                <div className="card" style={{ padding: 'var(--space-6)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
                        <h2 style={{ fontSize: '1.125rem', fontFamily: 'var(--font-display)' }}>Recent Client Enquiries</h2>
                        <Link href="/admin/submissions" style={{ fontSize: '0.8125rem', color: 'var(--color-primary)' }}>View All &rarr;</Link>
                    </div>

                    {recentSubmissions.length === 0 ? (
                        <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>No new contact enquiries yet.</p>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                            {recentSubmissions.map((sub) => (
                                <div key={sub.id} style={{ padding: 'var(--space-3)', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                        <strong>{sub.name} ({sub.company || 'Direct'})</strong>
                                        <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--color-text-faint)' }}>
                                            {new Date(sub.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <div style={{ fontSize: '0.8125rem', color: 'var(--color-primary)', fontFamily: 'var(--font-mono)' }}>
                                        {sub.email} &middot; {sub.enquiry_type}
                                    </div>
                                    <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                                        {sub.message.slice(0, 120)}...
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Fast Studio Actions */}
                <div className="card" style={{ padding: 'var(--space-6)' }}>
                    <h2 style={{ fontSize: '1.125rem', fontFamily: 'var(--font-display)', marginBottom: 'var(--space-4)' }}>Quick Create</h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                        <Link href="/admin/cases/create" className="btn btn--primary btn--sm" style={{ justifyContent: 'center' }}>
                            + New Case Study
                        </Link>
                        <Link href="/admin/posts/create" className="btn btn--ghost btn--sm" style={{ justifyContent: 'center' }}>
                            + New Insight Article
                        </Link>
                        <Link href="/admin/updates/create" className="btn btn--ghost btn--sm" style={{ justifyContent: 'center' }}>
                            + New Changelog Entry
                        </Link>
                        <Link href="/admin/media" className="btn btn--ghost btn--sm" style={{ justifyContent: 'center' }}>
                            Media Library Upload
                        </Link>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
