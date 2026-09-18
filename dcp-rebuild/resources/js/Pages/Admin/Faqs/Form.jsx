import React from 'react';
import { useForm, Link } from '@inertiajs/react';
import AdminLayout from '../../../Components/AdminLayout';

export default function FaqsForm({ faq = null }) {
    const isEdit = !!faq?.id;
    const { data, setData, post, put, processing, errors } = useForm({
        question: faq?.question || '',
        answer: faq?.answer || '',
        category: faq?.category || 'general',
        status: faq?.status || 'published',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (isEdit) {
            put(`/admin/faqs/${faq.id}`);
        } else {
            post('/admin/faqs');
        }
    };

    return (
        <AdminLayout
            title={isEdit ? 'Edit FAQ' : 'New FAQ'}
            breadcrumb={isEdit ? 'Edit FAQ' : 'New FAQ'}
        >
            <div className="card" style={{ padding: 'var(--space-8)', maxWidth: '800px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)' }}>
                    <h1 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-display)' }}>
                        {isEdit ? 'Edit FAQ Entry' : 'Create FAQ Entry'}
                    </h1>
                    <Link href="/admin/faqs" className="btn btn--ghost btn--sm">&larr; Back to list</Link>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
                    <div>
                        <label className="field-label" htmlFor="question">Question Text *</label>
                        <input
                            id="question"
                            type="text"
                            className="text-input"
                            value={data.question}
                            onChange={(e) => setData('question', e.target.value)}
                            required
                            style={{ width: '100%', padding: '10px 12px', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', color: 'var(--color-text)' }}
                        />
                        {errors.question && <span style={{ color: 'var(--vermilion-400)', fontSize: '0.75rem' }}>{errors.question}</span>}
                    </div>

                    <div>
                        <label className="field-label" htmlFor="category">Category</label>
                        <select
                            id="category"
                            className="select-input"
                            value={data.category}
                            onChange={(e) => setData('category', e.target.value)}
                            style={{ width: '100%', padding: '10px 12px', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', color: 'var(--color-text)' }}
                        >
                            <option value="general">General</option>
                            <option value="engineering">Engineering</option>
                            <option value="process">Process</option>
                            <option value="pricing">Pricing &amp; Terms</option>
                        </select>
                    </div>

                    <div>
                        <label className="field-label" htmlFor="answer">Answer *</label>
                        <textarea
                            id="answer"
                            className="text-input"
                            rows="5"
                            value={data.answer}
                            onChange={(e) => setData('answer', e.target.value)}
                            required
                            style={{ width: '100%', padding: '12px 14px', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', color: 'var(--color-text)', lineHeight: 1.6 }}
                        />
                        {errors.answer && <span style={{ color: 'var(--vermilion-400)', fontSize: '0.75rem' }}>{errors.answer}</span>}
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
                            {processing ? 'Persisting...' : (isEdit ? 'Save Changes' : 'Create FAQ')}
                        </button>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}
