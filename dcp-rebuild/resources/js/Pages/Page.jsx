import React from 'react';
import AppLayout from '../Components/AppLayout';

export default function GenericPage({ page, bodyHtml, team = [], testimonials = [], faqs = [] }) {
    const isAbout = page.slug === 'about';

    return (
        <AppLayout
            title={page.seo_title || `${page.title} — DevCenterPoint`}
            description={page.seo_description || page.lede}
            pageType="detail"
        >
            <div className="wrap" style={{ paddingTop: 'var(--space-16)', paddingBottom: 'var(--space-20)', maxWidth: isAbout ? '1000px' : '780px' }}>
                <header className="page-head" style={{ marginBottom: 'var(--space-12)' }}>
                    <p className="chapter__index"><span className="code">ORGANISATION</span> {page.title?.toUpperCase()}</p>
                    <h1 className="display display--md">{page.heading || page.title}</h1>
                    {page.lede && (
                        <p className="body body--lead page-head__lede">{page.lede}</p>
                    )}
                </header>

                <article className="prose" style={{ lineHeight: 1.8, fontSize: '1.0625rem', color: 'var(--color-text)', marginBottom: 'var(--space-12)' }}>
                    {bodyHtml ? (
                        <div dangerouslySetInnerHTML={{ __html: bodyHtml }} />
                    ) : (
                        <div style={{ whiteSpace: 'pre-wrap' }}>{page.body}</div>
                    )}
                </article>

                {/* If About page: Team squad */}
                {isAbout && team.length > 0 && (
                    <section style={{ marginTop: 'var(--space-16)', paddingTop: 'var(--space-12)', borderTop: '1px solid var(--color-border)' }}>
                        <p className="chapter__index"><span className="code">PEOPLE</span> LEADERSHIP</p>
                        <h2 className="display display--sm" style={{ marginBottom: 'var(--space-8)' }}>The Engineering Team</h2>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--space-6)' }}>
                            {team.map((member) => (
                                <div key={member.id} className="card" style={{ padding: 'var(--space-6)' }}>
                                    <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--color-surface-2)', border: '1px solid var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: 'var(--color-primary)', marginBottom: 'var(--space-4)' }}>
                                        {member.name.charAt(0)}
                                    </div>
                                    <h3 style={{ fontSize: '1.125rem', fontFamily: 'var(--font-display)', color: 'var(--color-text)' }}>{member.name}</h3>
                                    <div style={{ fontSize: '0.8125rem', color: 'var(--color-primary)', fontFamily: 'var(--font-mono)', marginBottom: '8px' }}>
                                        {member.role}
                                    </div>
                                    <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
                                        {member.bio}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </section>
                )}
            </div>
        </AppLayout>
    );
}
