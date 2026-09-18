import React from 'react';
import { useForm, Link } from '@inertiajs/react';
import AdminLayout from '../../../Components/AdminLayout';

export default function TestimonialsForm({ testimonial = null }) {
    const isEdit = !!testimonial?.id;
    const { data, setData, post, put, processing, errors } = useForm({
        attribution: testimonial?.attribution || '',
        role: testimonial?.role || '',
        company: testimonial?.company || '',
        quote: testimonial?.quote || '',
        status: testimonial?.status || 'published',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (isEdit) {
            put(`/admin/testimonials/${testimonial.id}`);
        } else {
            post('/admin/testimonials');
        }
    };

    return (
        <AdminLayout
            title={isEdit ? `Edit: ${testimonial.attribution}` : 'New Testimonial'}
            breadcrumb={isEdit ? 'Edit Testimonial' : 'New Testimonial'}
        >
            <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: 'var(--space-8)', maxWidth: '1050px' }}>
                {/* Form */}
                <div className="card" style={{ padding: 'var(--space-8)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)' }}>
                        <h1 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-display)' }}>
                            {isEdit ? 'Edit Testimonial' : 'Add Testimonial'}
                        </h1>
                        <Link href="/admin/testimonials" className="btn btn--ghost btn--sm">&larr; Back to list</Link>
                    </div>

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
                        <div>
                            <label className="field-label" htmlFor="attribution">Person / Attribution Name *</label>
                            <input
                                id="attribution"
                                type="text"
                                className="text-input"
                                value={data.attribution}
                                onChange={(e) => setData('attribution', e.target.value)}
                                required
                                style={{ width: '100%', padding: '10px 12px', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', color: 'var(--color-text)' }}
                            />
                            {errors.attribution && <span style={{ color: 'var(--vermilion-400)', fontSize: '0.75rem' }}>{errors.attribution}</span>}
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--space-4)' }}>
                            <div>
                                <label className="field-label" htmlFor="role">Job Title / Role</label>
                                <input
                                    id="role"
                                    type="text"
                                    className="text-input"
                                    value={data.role}
                                    onChange={(e) => setData('role', e.target.value)}
                                    placeholder="e.g. Chief Technology Officer"
                                    style={{ width: '100%', padding: '10px 12px', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', color: 'var(--color-text)' }}
                                />
                            </div>

                            <div>
                                <label className="field-label" htmlFor="company">Company</label>
                                <input
                                    id="company"
                                    type="text"
                                    className="text-input"
                                    value={data.company}
                                    onChange={(e) => setData('company', e.target.value)}
                                    placeholder="e.g. Enterprise Logistics Corp"
                                    style={{ width: '100%', padding: '10px 12px', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', color: 'var(--color-text)' }}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="field-label" htmlFor="quote">Quote / Endorsement Text *</label>
                            <textarea
                                id="quote"
                                className="text-input"
                                rows="5"
                                value={data.quote}
                                onChange={(e) => setData('quote', e.target.value)}
                                required
                                placeholder="What they said about working with DevCenterPoint..."
                                style={{ width: '100%', padding: '12px 14px', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', color: 'var(--color-text)', lineHeight: 1.6 }}
                            />
                            {errors.quote && <span style={{ color: 'var(--vermilion-400)', fontSize: '0.75rem' }}>{errors.quote}</span>}
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ width: '180px' }}>
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
                                {processing ? 'Persisting...' : (isEdit ? 'Save Changes' : 'Publish Quote')}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Live Card Preview */}
                <div>
                    <h3 style={{ fontSize: '0.875rem', fontFamily: 'var(--font-mono)', color: 'var(--color-text-faint)', textTransform: 'uppercase', marginBottom: '12px' }}>
                        Live Public Card Preview
                    </h3>
                    <div className="card" style={{ padding: 'var(--space-6)', minHeight: '180px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                        <p style={{ fontStyle: 'italic', fontSize: '1.0625rem', lineHeight: 1.6, color: 'var(--color-text)' }}>
                            &ldquo;{data.quote || 'Quote will appear here as you type in the editor...'}&rdquo;
                        </p>
                        <div style={{ marginTop: 'var(--space-4)', paddingTop: 'var(--space-3)', borderTop: '1px solid var(--color-border)' }}>
                            <div style={{ fontWeight: 600, color: 'var(--color-text)' }}>
                                {data.attribution || 'Author Name'}
                            </div>
                            <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
                                {data.role ? data.role : ''}
                                {data.role && data.company ? ', ' : ''}
                                {data.company ? data.company : ''}
                                {!data.role && !data.company ? 'Role & Company' : ''}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
