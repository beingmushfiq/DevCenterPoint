import React, { useState, useEffect, useRef } from 'react';
import { Link } from '@inertiajs/react';
import AppLayout from '../Components/AppLayout';
import ThreeCanvas from '../Components/ThreeCanvas';
import SplineSlot from '../Components/SplineSlot';

export default function Home({ sections = [], services = [], featured = [], testimonials = [] }) {
    const [activeDot, setActiveDot] = useState(0);
    const [sceneInstance, setSceneInstance] = useState(null);
    const [splineInstance, setSplineInstance] = useState(null);

    const sec = (key) => sections.find((s) => s.section_key === key) || {};
    const hero = sec('hero');
    const curve = sec('cost-curve');
    const whatWeAre = sec('what-we-are');
    const whatWeDo = sec('what-we-do');
    const howWeWork = sec('how-we-work');
    const commitments = sec('commitments');
    const whoBehind = sec('who-stands-behind-it');
    const startHere = sec('start-here');

    // Scroll progress tracking for 3D particles & Rail
    useEffect(() => {
        let lastScrollY = window.scrollY;
        let ticking = false;

        const onScroll = () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    const scrollY = window.scrollY;
                    const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
                    const progress = Math.min(1, Math.max(0, scrollY / maxScroll));
                    const velocity = Math.min(1, Math.max(-1, (scrollY - lastScrollY) / 100));
                    lastScrollY = scrollY;

                    // Update Rail fill
                    const railFill = document.getElementById('railFill');
                    if (railFill) {
                        railFill.style.height = `${progress * 100}%`;
                    }

                    // Update Scene
                    if (sceneInstance) {
                        sceneInstance.setProgress(progress);
                        sceneInstance.setVelocity(velocity);
                    }

                    // Determine active chapter for dots
                    const chapters = document.querySelectorAll('.chapter');
                    let currentIdx = 0;
                    chapters.forEach((ch, idx) => {
                        const rect = ch.getBoundingClientRect();
                        if (rect.top <= window.innerHeight * 0.45) {
                            currentIdx = idx;
                        }
                    });
                    setActiveDot(currentIdx);

                    // Update Spline camera chapter if available
                    if (splineInstance && splineInstance.setChapter) {
                        splineInstance.setChapter(currentIdx);
                    }

                    ticking = false;
                });
                ticking = true;
            }
        };

        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, [sceneInstance, splineInstance]);

    const scrollToChapter = (idx) => {
        const chapters = document.querySelectorAll('.chapter');
        if (chapters[idx]) {
            chapters[idx].scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <AppLayout pageType="home">
            {/* 3D Scene Layer */}
            <ThreeCanvas profile="full" onSceneReady={(sc) => setSceneInstance(sc)} />
            <SplineSlot onSplineReady={(sp) => setSplineInstance(sp)} />

            {/* Scroll Navigation Rail & Dots */}
            <div className="rail" aria-hidden="true">
                <span className="rail__fill" id="railFill" />
            </div>
            <div className="chapter-dots" id="dots" aria-hidden="true">
                {[0, 1, 2, 3, 4, 5, 6, 7].map((idx) => (
                    <button
                        key={idx}
                        type="button"
                        className={`chapter-dot ${activeDot === idx ? 'is-active' : ''}`}
                        onClick={() => scrollToChapter(idx)}
                        aria-label={`Jump to chapter 0${idx + 1}`}
                    />
                ))}
            </div>

            {/* ============ 01 · HERO ============ */}
            <section className="chapter chapter--hero" id="ch-01" data-scene={hero.scene || 'shards'}>
                <div className="wrap">
                    <p className="eyebrow"><span className="code">DCP / 001</span> {hero.eyebrow || 'Product Engineering Studio — Est. 2026'}</p>
                    <h1 className="display">
                        <span className="line">{hero.heading || 'Bring your problems.'}</span>
                        <span className="line"><em>{hero.heading_emphasis || 'Bring your idea.'}</em></span>
                    </h1>
                    <p className="lede">
                        {hero.lede || 'We design the system, build it, and stand behind it in production. No slide deck, no handoff, no disappearing act — an engineering partner accountable for what actually ships.'}
                    </p>
                    <div className="hero__actions">
                        <Link className="btn btn--primary" href="/contact" data-magnetic="0.3">
                            Start a project
                        </Link>
                        <a className="btn btn--ghost" href="#ch-02" data-magnetic="0.2">
                            Why foundations fail
                        </a>
                    </div>
                    <div className="hero__foot">
                        {hero.content?.credibility ? (
                            hero.content.credibility.map((c, i) => (
                                <span key={i} className="hero__foot-item">{c.label}</span>
                            ))
                        ) : (
                            <>
                                <span className="hero__foot-item">Senior engineers only</span>
                                <span className="hero__foot-item">You own every commit</span>
                                <span className="hero__foot-item">Reply within one business day</span>
                            </>
                        )}
                    </div>
                </div>
                <div className="scroll-hint" aria-hidden="true"><span /></div>
            </section>

            {/* ============ 02 · THE COST CURVE ============ */}
            <section className="chapter" id="ch-02" data-scene={curve.scene || 'scatter'}>
                <div className="wrap">
                    <div className="wrap--split">
                        <div className="col">
                            <p className="chapter__index"><span className="code">01</span> {curve.eyebrow || 'The Problem'}</p>
                            <h2 className="display display--md">
                                {curve.heading || 'Software is rarely expensive to build.'} <em>{curve.heading_emphasis || 'It is expensive to change.'}</em>
                            </h2>
                        </div>
                        <div className="col">
                            <p className="body body--lead">
                                {curve.lede || 'Every system carries the cost of its own decisions. Made early, a correction is nearly free. Made late — after launch, after your team has built on top of it — the same correction costs orders of magnitude more.'}
                            </p>
                            <p className="body">
                                This is not a metaphor. It is the single most reliable pattern in software delivery, and it is the reason most "successful" launches quietly become unfixable within eighteen months.
                            </p>
                        </div>
                    </div>

                    <div className="curve">
                        {curve.content?.curve ? (
                            curve.content.curve.map((c, i) => (
                                <div key={i} className="curve__cell">
                                    <span className="curve__stage">{c.stage}</span>
                                    <span className="curve__x">{c.multiplier}<i>×</i></span>
                                    <span className="curve__label">{c.label}</span>
                                    <span className="curve__bar" aria-hidden="true" />
                                </div>
                            ))
                        ) : (
                            <>
                                <div className="curve__cell">
                                    <span className="curve__stage">In discovery</span>
                                    <span className="curve__x">1<i>×</i></span>
                                    <span className="curve__label">Redraw the architecture on a whiteboard. Cost: a conversation.</span>
                                    <span className="curve__bar" aria-hidden="true" />
                                </div>
                                <div className="curve__cell">
                                    <span className="curve__stage">During build</span>
                                    <span className="curve__x">10<i>×</i></span>
                                    <span className="curve__label">Refactor the module, migrate the data, re-test the surface.</span>
                                    <span className="curve__bar" aria-hidden="true" />
                                </div>
                                <div className="curve__cell">
                                    <span className="curve__stage">In production</span>
                                    <span className="curve__x">100<i>×</i></span>
                                    <span className="curve__label">Coordinate a migration, absorb downtime, apologise to customers, rebuild trust.</span>
                                    <span className="curve__bar" aria-hidden="true" />
                                </div>
                            </>
                        )}
                    </div>

                    <p className="body body--wide">
                        {curve.content?.closing || 'We exist to make the expensive decisions while they are still cheap to make — and to build the kind of foundation that does not force you back here.'}
                    </p>
                </div>
            </section>

            {/* ============ 03 · WHAT WE ARE ============ */}
            <section className="chapter" id="ch-03" data-scene={whatWeAre.scene || 'converge'}>
                <div className="wrap wrap--split">
                    <div className="col">
                        <p className="chapter__index"><span className="code">02</span> {whatWeAre.eyebrow || 'Position'}</p>
                        <h2 className="display display--md">
                            {whatWeAre.heading || 'Neither an agency'} <em>{whatWeAre.heading_emphasis || 'nor a body shop.'}</em>
                        </h2>
                    </div>
                    <div className="col">
                        <p className="body body--lead">{whatWeAre.lede || 'Most software vendors optimize for billable hours or slide decks. We optimize for code shipped into production.'}</p>
                        <div className="card-grid" style={{ display: 'grid', gap: 'var(--space-4)', marginTop: 'var(--space-6)' }}>
                            <div className="card" style={{ padding: 'var(--space-6)' }}>
                                <h3 style={{ fontSize: '1.125rem', fontFamily: 'var(--font-display)', color: 'var(--color-primary)' }}>Senior Leadership Only</h3>
                                <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginTop: '6px' }}>
                                    You will never be pitched by partners and handed off to junior contractors. Every contributor is a seasoned systems engineer.
                                </p>
                            </div>
                            <div className="card" style={{ padding: 'var(--space-6)' }}>
                                <h3 style={{ fontSize: '1.125rem', fontFamily: 'var(--font-display)', color: 'var(--color-primary)' }}>Transparent Ownership</h3>
                                <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginTop: '6px' }}>
                                    Every commit, pull request, and deployment script belongs entirely to your organisation from day zero.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ============ 04 · WHAT WE DO (SERVICES) ============ */}
            <section className="chapter" id="ch-04" data-scene={whatWeDo.scene || 'build'}>
                <div className="wrap">
                    <div style={{ marginBottom: 'var(--space-8)' }}>
                        <p className="chapter__index"><span className="code">03</span> {whatWeDo.eyebrow || 'Capabilities'}</p>
                        <h2 className="display display--md">
                            {whatWeDo.heading || 'Core engineering disciplines.'} <em>{whatWeDo.heading_emphasis || 'Zero filler.'}</em>
                        </h2>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 'var(--space-6)' }}>
                        {services.map((s) => (
                            <div key={s.id} className="card" style={{ padding: 'var(--space-6)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                <div>
                                    <p className="chapter__index" style={{ fontSize: '0.75rem', marginBottom: '8px' }}>{s.tagline || 'DISCIPLINE'}</p>
                                    <h3 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-display)', color: 'var(--color-text)', marginBottom: '12px' }}>
                                        {s.title}
                                    </h3>
                                    <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
                                        {s.summary}
                                    </p>
                                </div>
                                <div style={{ marginTop: 'var(--space-6)' }}>
                                    <Link href={`/services/${s.slug}`} className="btn btn--ghost btn--sm">
                                        Explore discipline &rarr;
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ============ 05 · FEATURED WORK ============ */}
            <section className="chapter" id="ch-05" data-scene={howWeWork.scene || 'name'}>
                <div className="wrap">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 'var(--space-8)', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
                        <div>
                            <p className="chapter__index"><span className="code">04</span> PROVEN OUTCOMES</p>
                            <h2 className="display display--md">Recent case studies. <em>Real metrics.</em></h2>
                        </div>
                        <Link href="/work" className="btn btn--ghost">View all work &rarr;</Link>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 'var(--space-6)' }}>
                        {featured.map((item) => (
                            <div key={item.id} className="card" style={{ padding: 'var(--space-6)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                <div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                                        <span className="badge">{item.sector || 'ENTERPRISE'}</span>
                                        <span className="code" style={{ color: 'var(--color-text-muted)' }}>{item.year || '2026'}</span>
                                    </div>
                                    <h3 style={{ fontSize: '1.35rem', fontFamily: 'var(--font-display)', marginBottom: '8px' }}>
                                        <Link href={`/work/${item.slug}`} style={{ color: 'var(--color-text)', textDecoration: 'none' }}>
                                            {item.title}
                                        </Link>
                                    </h3>
                                    <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
                                        {item.summary}
                                    </p>
                                </div>
                                <div style={{ marginTop: 'var(--space-6)', paddingTop: 'var(--space-4)', borderTop: '1px solid var(--color-border)' }}>
                                    <Link href={`/work/${item.slug}`} className="btn btn--ghost btn--sm">
                                        Read breakdown &rarr;
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ============ 06 · COMMITMENTS ============ */}
            <section className="chapter" id="ch-06" data-scene={commitments.scene || 'leap'}>
                <div className="wrap wrap--split">
                    <div className="col">
                        <p className="chapter__index"><span className="code">05</span> STANDARDS</p>
                        <h2 className="display display--md">Our production <em>guarantees.</em></h2>
                    </div>
                    <div className="col">
                        <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
                            <li style={{ borderLeft: '2px solid var(--color-primary)', paddingLeft: 'var(--space-4)' }}>
                                <h3 style={{ fontSize: '1.125rem', fontFamily: 'var(--font-display)' }}>Zero Lock-in</h3>
                                <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>We use open standards and modern frameworks. Any skilled engineering team can continue maintenance seamlessly.</p>
                            </li>
                            <li style={{ borderLeft: '2px solid var(--color-primary)', paddingLeft: 'var(--space-4)' }}>
                                <h3 style={{ fontSize: '1.125rem', fontFamily: 'var(--font-display)' }}>Performance-First</h3>
                                <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>Sub-100ms API response benchmarks and Core Web Vitals compliance on every platform we ship.</p>
                            </li>
                            <li style={{ borderLeft: '2px solid var(--color-primary)', paddingLeft: 'var(--space-4)' }}>
                                <h3 style={{ fontSize: '1.125rem', fontFamily: 'var(--font-display)' }}>Direct Architect Communication</h3>
                                <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>No communication friction through layers of account reps. You communicate directly with the engineers coding your system.</p>
                            </li>
                        </ul>
                    </div>
                </div>
            </section>

            {/* ============ 07 · TESTIMONIALS ============ */}
            <section className="chapter" id="ch-07" data-scene={whoBehind.scene || 'merge'}>
                <div className="wrap">
                    <p className="chapter__index"><span className="code">06</span> TESTIMONIALS</p>
                    <h2 className="display display--md" style={{ marginBottom: 'var(--space-8)' }}>
                        What engineering leaders <em>say about us.</em>
                    </h2>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 'var(--space-6)' }}>
                        {testimonials.map((t) => (
                            <div key={t.id} className="card" style={{ padding: 'var(--space-6)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                <p style={{ fontStyle: 'italic', fontSize: '1.0625rem', lineHeight: 1.6, color: 'var(--color-text)', marginBottom: 'var(--space-4)' }}>
                                    &ldquo;{t.quote}&rdquo;
                                </p>
                                <div>
                                    <div style={{ fontWeight: 600, color: 'var(--color-text)' }}>{t.attribution}</div>
                                    <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
                                        {t.role}{t.company ? `, ${t.company}` : ''}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ============ 08 · START A PROJECT ============ */}
            <section className="chapter chapter--foot" id="ch-08" data-scene={startHere.scene || 'expand'}>
                <div className="wrap wrap--split">
                    <div className="col">
                        <p className="chapter__index"><span className="code">07</span> ENGAGEMENT</p>
                        <h2 className="display display--lg">
                            Ready to ship <em>software that scales?</em>
                        </h2>
                        <p className="lede" style={{ marginTop: 'var(--space-4)' }}>
                            Tell us what you are trying to build. We reply within one business day with an honest technical assessment and recommended sprint plan.
                        </p>
                    </div>
                    <div className="col" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start' }}>
                        <Link href="/contact" className="btn btn--primary" style={{ fontSize: '1.125rem', padding: '16px 32px' }}>
                            Start a project conversation &rarr;
                        </Link>
                    </div>
                </div>
            </section>
        </AppLayout>
    );
}
