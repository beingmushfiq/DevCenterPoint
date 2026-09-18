import React from 'react';
import { useForm } from '@inertiajs/react';
import AdminLayout from '../../Components/AdminLayout';

export default function Settings({ settings = {} }) {
    const { data, setData, post, processing } = useForm({
        'company.name': settings['company.name'] || 'DevCenterPoint',
        'company.tagline': settings['company.tagline'] || 'Code. Build. Deploy. Scale.',
        'company.email': settings['company.email'] || 'contact@devcenterpoint.com',
        'company.phone': settings['company.phone'] || '+44 20 7946 0912',
        'company.location': settings['company.location'] || 'London & Remote Engineering',
        'seo.default_title': settings['seo.default_title'] || 'DevCenterPoint — Code. Build. Deploy. Scale.',
        'seo.default_description': settings['seo.default_description'] || 'DevCenterPoint is an elite engineering consultancy.',
        'social.linkedin': settings['social.linkedin'] || 'https://linkedin.com',
        'social.github': settings['social.github'] || 'https://github.com',
        'social.x': settings['social.x'] || 'https://x.com',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post('/admin/settings');
    };

    return (
        <AdminLayout title="Site Settings" breadcrumb="Settings">
            <div className="card" style={{ padding: 'var(--space-8)', maxWidth: '850px' }}>
                <h1 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-display)', marginBottom: 'var(--space-6)' }}>
                    Global Studio Settings &amp; SEO Defaults
                </h1>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
                    {/* Brand & Organization */}
                    <div>
                        <h2 style={{ fontSize: '1rem', fontFamily: 'var(--font-mono)', color: 'var(--color-primary)', textTransform: 'uppercase', marginBottom: 'var(--space-3)' }}>
                            01 &middot; Organization &amp; Identity
                        </h2>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--space-4)' }}>
                            <div>
                                <label className="field-label">Company Name</label>
                                <input
                                    type="text"
                                    className="text-input"
                                    value={data['company.name']}
                                    onChange={(e) => setData('company.name', e.target.value)}
                                    style={{ width: '100%', padding: '10px 12px', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', color: 'var(--color-text)' }}
                                />
                            </div>

                            <div>
                                <label className="field-label">Tagline</label>
                                <input
                                    type="text"
                                    className="text-input"
                                    value={data['company.tagline']}
                                    onChange={(e) => setData('company.tagline', e.target.value)}
                                    style={{ width: '100%', padding: '10px 12px', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', color: 'var(--color-text)' }}
                                />
                            </div>

                            <div>
                                <label className="field-label">Contact Email</label>
                                <input
                                    type="email"
                                    className="text-input"
                                    value={data['company.email']}
                                    onChange={(e) => setData('company.email', e.target.value)}
                                    style={{ width: '100%', padding: '10px 12px', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', color: 'var(--color-text)' }}
                                />
                            </div>

                            <div>
                                <label className="field-label">Contact Phone</label>
                                <input
                                    type="text"
                                    className="text-input"
                                    value={data['company.phone']}
                                    onChange={(e) => setData('company.phone', e.target.value)}
                                    style={{ width: '100%', padding: '10px 12px', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', color: 'var(--color-text)' }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* SEO Defaults */}
                    <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: 'var(--space-6)' }}>
                        <h2 style={{ fontSize: '1rem', fontFamily: 'var(--font-mono)', color: 'var(--color-primary)', textTransform: 'uppercase', marginBottom: 'var(--space-3)' }}>
                            02 &middot; SEO &amp; Meta Defaults
                        </h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                            <div>
                                <label className="field-label">Default Page Title</label>
                                <input
                                    type="text"
                                    className="text-input"
                                    value={data['seo.default_title']}
                                    onChange={(e) => setData('seo.default_title', e.target.value)}
                                    style={{ width: '100%', padding: '10px 12px', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', color: 'var(--color-text)' }}
                                />
                            </div>

                            <div>
                                <label className="field-label">Default Meta Description</label>
                                <textarea
                                    className="text-input"
                                    rows="2"
                                    value={data['seo.default_description']}
                                    onChange={(e) => setData('seo.default_description', e.target.value)}
                                    style={{ width: '100%', padding: '10px 12px', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', color: 'var(--color-text)' }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Social Media */}
                    <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: 'var(--space-6)' }}>
                        <h2 style={{ fontSize: '1rem', fontFamily: 'var(--font-mono)', color: 'var(--color-primary)', textTransform: 'uppercase', marginBottom: 'var(--space-3)' }}>
                            03 &middot; Social Network Presence
                        </h2>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-4)' }}>
                            <div>
                                <label className="field-label">LinkedIn URL</label>
                                <input
                                    type="text"
                                    className="text-input"
                                    value={data['social.linkedin']}
                                    onChange={(e) => setData('social.linkedin', e.target.value)}
                                    style={{ width: '100%', padding: '10px 12px', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', color: 'var(--color-text)' }}
                                />
                            </div>

                            <div>
                                <label className="field-label">GitHub URL</label>
                                <input
                                    type="text"
                                    className="text-input"
                                    value={data['social.github']}
                                    onChange={(e) => setData('social.github', e.target.value)}
                                    style={{ width: '100%', padding: '10px 12px', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', color: 'var(--color-text)' }}
                                />
                            </div>

                            <div>
                                <label className="field-label">X / Twitter URL</label>
                                <input
                                    type="text"
                                    className="text-input"
                                    value={data['social.x']}
                                    onChange={(e) => setData('social.x', e.target.value)}
                                    style={{ width: '100%', padding: '10px 12px', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', color: 'var(--color-text)' }}
                                />
                            </div>
                        </div>
                    </div>

                    <div style={{ textAlign: 'right', marginTop: 'var(--space-4)' }}>
                        <button
                            type="submit"
                            className="btn btn--primary"
                            disabled={processing}
                            style={{ padding: '12px 28px' }}
                        >
                            {processing ? 'Saving...' : 'Save Settings'}
                        </button>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}
