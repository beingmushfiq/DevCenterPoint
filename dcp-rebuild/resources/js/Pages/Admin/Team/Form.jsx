import React from 'react';
import { useForm, Link } from '@inertiajs/react';
import AdminLayout from '../../../Components/AdminLayout';

export default function TeamForm({ member = null }) {
    const isEdit = !!member?.id;
    const { data, setData, post, put, processing, errors } = useForm({
        name: member?.name || '',
        role: member?.role || '',
        bio: member?.bio || '',
        location: member?.location || '',
        email: member?.email || '',
        status: member?.status || 'draft',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (isEdit) {
            put(`/admin/team/${member.id}`);
        } else {
            post('/admin/team');
        }
    };

    return (
        <AdminLayout
            title={isEdit ? `Edit: ${member.name}` : 'New Team Member'}
            breadcrumb={isEdit ? 'Edit Member' : 'New Member'}
        >
            <div className="card" style={{ padding: 'var(--space-8)', maxWidth: '800px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)' }}>
                    <h1 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-display)' }}>
                        {isEdit ? 'Edit Team Member Profile' : 'Add Team Member'}
                    </h1>
                    <Link href="/admin/team" className="btn btn--ghost btn--sm">&larr; Back to list</Link>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--space-4)' }}>
                        <div>
                            <label className="field-label" htmlFor="name">Full Name *</label>
                            <input
                                id="name"
                                type="text"
                                className="text-input"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                required
                                style={{ width: '100%', padding: '10px 12px', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', color: 'var(--color-text)' }}
                            />
                            {errors.name && <span style={{ color: 'var(--vermilion-400)', fontSize: '0.75rem' }}>{errors.name}</span>}
                        </div>

                        <div>
                            <label className="field-label" htmlFor="role">Role / Title *</label>
                            <input
                                id="role"
                                type="text"
                                className="text-input"
                                value={data.role}
                                onChange={(e) => setData('role', e.target.value)}
                                placeholder="e.g. Principal Distributed Systems Architect"
                                required
                                style={{ width: '100%', padding: '10px 12px', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', color: 'var(--color-text)' }}
                            />
                            {errors.role && <span style={{ color: 'var(--vermilion-400)', fontSize: '0.75rem' }}>{errors.role}</span>}
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--space-4)' }}>
                        <div>
                            <label className="field-label" htmlFor="location">Location</label>
                            <input
                                id="location"
                                type="text"
                                className="text-input"
                                value={data.location}
                                onChange={(e) => setData('location', e.target.value)}
                                placeholder="e.g. London, UK"
                                style={{ width: '100%', padding: '10px 12px', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', color: 'var(--color-text)' }}
                            />
                        </div>

                        <div>
                            <label className="field-label" htmlFor="email">Email</label>
                            <input
                                id="email"
                                type="email"
                                className="text-input"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                style={{ width: '100%', padding: '10px 12px', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', color: 'var(--color-text)' }}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="field-label" htmlFor="bio">Biography &amp; Focus Area</label>
                        <textarea
                            id="bio"
                            className="text-input"
                            rows="4"
                            value={data.bio}
                            onChange={(e) => setData('bio', e.target.value)}
                            style={{ width: '100%', padding: '10px 12px', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', color: 'var(--color-text)' }}
                        />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ width: '200px' }}>
                            <label className="field-label" htmlFor="status">Publish Status</label>
                            <select
                                id="status"
                                className="select-input"
                                value={data.status}
                                onChange={(e) => setData('status', e.target.value)}
                                style={{ width: '100%', padding: '10px 12px', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', color: 'var(--color-text)' }}
                            >
                                <option value="published">Published</option>
                                <option value="draft">Draft</option>
                            </select>
                        </div>

                        <button
                            type="submit"
                            className="btn btn--primary"
                            disabled={processing}
                            style={{ padding: '12px 24px', marginTop: '16px' }}
                        >
                            {processing ? 'Persisting...' : (isEdit ? 'Save Changes' : 'Add Member')}
                        </button>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}
