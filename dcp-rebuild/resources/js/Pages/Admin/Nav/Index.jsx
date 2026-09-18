import React, { useState } from 'react';
import { useForm, router } from '@inertiajs/react';
import AdminLayout from '../../../Components/AdminLayout';

export default function NavIndex({ items = [] }) {
    const { data, setData, post, processing, reset } = useForm({
        location: 'primary',
        label: '',
        url: '',
        sort_order: 10,
        is_external: false,
    });

    const handleCreate = (e) => {
        e.preventDefault();
        post('/admin/nav', {
            onSuccess: () => reset(),
        });
    };

    const handleDelete = (id, label) => {
        if (confirm(`Remove nav link "${label}"?`)) {
            router.delete(`/admin/nav/${id}`);
        }
    };

    return (
        <AdminLayout title="Navigation Manager" breadcrumb="Navigation">
            {/* Add nav link */}
            <div className="card" style={{ padding: 'var(--space-6)', marginBottom: 'var(--space-8)' }}>
                <h2 style={{ fontSize: '1.125rem', fontFamily: 'var(--font-display)', marginBottom: 'var(--space-4)' }}>
                    Add Navigation Link
                </h2>
                <form onSubmit={handleCreate} style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 2fr 1fr auto', gap: 'var(--space-4)', alignItems: 'flex-end' }}>
                    <div>
                        <label className="field-label">Location</label>
                        <select
                            className="select-input"
                            value={data.location}
                            onChange={(e) => setData('location', e.target.value)}
                            style={{ width: '100%', padding: '10px 12px', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', color: 'var(--color-text)' }}
                        >
                            <option value="primary">Primary Menu</option>
                            <option value="footer">Footer</option>
                            <option value="legal">Legal</option>
                        </select>
                    </div>

                    <div>
                        <label className="field-label">Label *</label>
                        <input
                            type="text"
                            className="text-input"
                            value={data.label}
                            onChange={(e) => setData('label', e.target.value)}
                            placeholder="e.g. Services"
                            required
                            style={{ width: '100%', padding: '10px 12px', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', color: 'var(--color-text)' }}
                        />
                    </div>

                    <div>
                        <label className="field-label">Target URL *</label>
                        <input
                            type="text"
                            className="text-input"
                            value={data.url}
                            onChange={(e) => setData('url', e.target.value)}
                            placeholder="e.g. /services"
                            required
                            style={{ width: '100%', padding: '10px 12px', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', color: 'var(--color-text)' }}
                        />
                    </div>

                    <div>
                        <label className="field-label">Sort Order</label>
                        <input
                            type="number"
                            className="text-input"
                            value={data.sort_order}
                            onChange={(e) => setData('sort_order', Number(e.target.value))}
                            style={{ width: '100%', padding: '10px 12px', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', color: 'var(--color-text)' }}
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn btn--primary"
                        disabled={processing}
                        style={{ padding: '10px 20px' }}
                    >
                        Add Link
                    </button>
                </form>
            </div>

            {/* List */}
            <div className="card" style={{ padding: 'var(--space-6)' }}>
                <h2 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-display)', marginBottom: 'var(--space-4)' }}>
                    Active Navigation Structure
                </h2>

                <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid var(--color-border)', color: 'var(--color-text-faint)' }}>
                            <th style={{ padding: '10px 8px' }}>Location</th>
                            <th style={{ padding: '10px 8px' }}>Label</th>
                            <th style={{ padding: '10px 8px' }}>URL</th>
                            <th style={{ padding: '10px 8px' }}>Order</th>
                            <th style={{ padding: '10px 8px', textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((item) => (
                            <tr key={item.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                                <td style={{ padding: '12px 8px' }}>
                                    <span className="badge">{item.location}</span>
                                </td>
                                <td style={{ padding: '12px 8px', fontWeight: 600, color: 'var(--color-text)' }}>
                                    {item.label}
                                </td>
                                <td style={{ padding: '12px 8px', fontFamily: 'var(--font-mono)', color: 'var(--color-primary)' }}>
                                    {item.url}
                                </td>
                                <td style={{ padding: '12px 8px', color: 'var(--color-text-muted)' }}>
                                    {item.sort_order}
                                </td>
                                <td style={{ padding: '12px 8px', textAlign: 'right' }}>
                                    <button
                                        type="button"
                                        className="btn btn--ghost btn--sm"
                                        onClick={() => handleDelete(item.id, item.label)}
                                        style={{ color: 'var(--vermilion-400)' }}
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </AdminLayout>
    );
}
