import React, { useState } from 'react';
import { useForm, router } from '@inertiajs/react';
import AdminLayout from '../../../Components/AdminLayout';

export default function MediaIndex({ items = [] }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        file: null,
        alt_text: '',
        folder: 'general',
    });

    const [uploading, setUploading] = useState(false);

    const handleUpload = (e) => {
        e.preventDefault();
        setUploading(true);
        post('/admin/media/upload', {
            onSuccess: () => {
                reset();
                setUploading(false);
            },
            onError: () => setUploading(false),
        });
    };

    const handleDelete = (id, filename) => {
        if (confirm(`Delete file "${filename}"?`)) {
            router.delete(`/admin/media/${id}`);
        }
    };

    return (
        <AdminLayout title="Media Library" breadcrumb="Media">
            {/* Upload Box */}
            <div className="card" style={{ padding: 'var(--space-6)', marginBottom: 'var(--space-8)' }}>
                <h2 style={{ fontSize: '1.125rem', fontFamily: 'var(--font-display)', marginBottom: 'var(--space-4)' }}>
                    Upload Media Asset
                </h2>
                <form onSubmit={handleUpload} style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1fr auto', gap: 'var(--space-4)', alignItems: 'flex-end' }}>
                    <div>
                        <label className="field-label">Select File *</label>
                        <input
                            type="file"
                            onChange={(e) => setData('file', e.target.files[0])}
                            required
                            style={{ width: '100%', padding: '8px', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', color: 'var(--color-text)' }}
                        />
                        {errors.file && <span style={{ color: 'var(--vermilion-400)', fontSize: '0.75rem' }}>{errors.file}</span>}
                    </div>

                    <div>
                        <label className="field-label">Alt Text (Accessibility) *</label>
                        <input
                            type="text"
                            className="text-input"
                            value={data.alt_text}
                            onChange={(e) => setData('alt_text', e.target.value)}
                            placeholder="Descriptive caption for accessibility"
                            required
                            style={{ width: '100%', padding: '10px 12px', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', color: 'var(--color-text)' }}
                        />
                        {errors.alt_text && <span style={{ color: 'var(--vermilion-400)', fontSize: '0.75rem' }}>{errors.alt_text}</span>}
                    </div>

                    <div>
                        <label className="field-label">Folder</label>
                        <select
                            className="select-input"
                            value={data.folder}
                            onChange={(e) => setData('folder', e.target.value)}
                            style={{ width: '100%', padding: '10px 12px', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', color: 'var(--color-text)' }}
                        >
                            <option value="general">General</option>
                            <option value="cases">Case Studies</option>
                            <option value="team">Team</option>
                            <option value="posts">Insights</option>
                        </select>
                    </div>

                    <button
                        type="submit"
                        className="btn btn--primary"
                        disabled={uploading || processing}
                        style={{ padding: '10px 20px' }}
                    >
                        {uploading ? 'Uploading...' : 'Upload Asset'}
                    </button>
                </form>
            </div>

            {/* Media Grid */}
            <div className="card" style={{ padding: 'var(--space-6)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)' }}>
                    <h2 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-display)' }}>Uploaded Assets</h2>
                    <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>{items.length} files</span>
                </div>

                {items.length === 0 ? (
                    <p style={{ color: 'var(--color-text-muted)', textAlign: 'center', padding: 'var(--space-8)' }}>
                        No files in the media library. Upload an asset above.
                    </p>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 'var(--space-4)' }}>
                        {items.map((media) => (
                            <div key={media.id} className="card" style={{ padding: 'var(--space-3)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                <div style={{ height: '140px', background: 'var(--color-surface-2)', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', marginBottom: '8px' }}>
                                    {media.mime_type?.startsWith('image/') ? (
                                        <img src={media.path} alt={media.alt_text} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'cover' }} />
                                    ) : (
                                        <span className="code" style={{ color: 'var(--color-text-faint)' }}>FILE</span>
                                    )}
                                </div>
                                <div>
                                    <div style={{ fontSize: '0.8125rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {media.filename}
                                    </div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                                        {(media.size_bytes / 1024).toFixed(1)} KB &middot; {media.folder}
                                    </div>
                                </div>
                                <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <button
                                        type="button"
                                        onClick={() => navigator.clipboard.writeText(media.path)}
                                        style={{ background: 'none', border: 'none', color: 'var(--color-primary)', fontSize: '0.75rem', cursor: 'pointer' }}
                                    >
                                        Copy URL
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleDelete(media.id, media.filename)}
                                        style={{ background: 'none', border: 'none', color: 'var(--vermilion-400)', fontSize: '0.75rem', cursor: 'pointer' }}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
