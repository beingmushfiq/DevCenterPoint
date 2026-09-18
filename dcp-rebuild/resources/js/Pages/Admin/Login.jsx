import React from 'react';
import { useForm, Head } from '@inertiajs/react';
import Logo from '../../Components/Logo';

export default function Login() {
    const { data, setData, post, processing, errors } = useForm({
        email: 'admin@devcenterpoint.com',
        password: '',
        remember: true,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post('/admin/login');
    };

    return (
        <div className="admin-login-wrapper" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-bg)', padding: 'var(--space-6)' }} data-theme="dark">
            <Head>
                <title>Admin Sign In — DevCenterPoint</title>
            </Head>

            <div className="card" style={{ width: '100%', maxWidth: '420px', padding: 'var(--space-8)' }}>
                <div style={{ textAlign: 'center', marginBottom: 'var(--space-6)' }}>
                    <div style={{ display: 'inline-block', marginBottom: 'var(--space-3)' }}>
                        <Logo variant="header" />
                    </div>
                    <p style={{ fontSize: '0.8125rem', fontFamily: 'var(--font-mono)', color: 'var(--color-text-faint)' }}>
                        SECURE ADMINISTRATIVE GATEWAY
                    </p>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                    <div>
                        <label className="field-label" htmlFor="email">Email Address</label>
                        <input
                            id="email"
                            type="email"
                            className="text-input"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            required
                            autoFocus
                            style={{ width: '100%', padding: '10px 12px', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', color: 'var(--color-text)' }}
                        />
                        {errors.email && <span style={{ color: 'var(--vermilion-400)', fontSize: '0.75rem' }}>{errors.email}</span>}
                    </div>

                    <div>
                        <label className="field-label" htmlFor="password">Password</label>
                        <input
                            id="password"
                            type="password"
                            className="text-input"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            required
                            placeholder="Enter password..."
                            style={{ width: '100%', padding: '10px 12px', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', color: 'var(--color-text)' }}
                        />
                        {errors.password && <span style={{ color: 'var(--vermilion-400)', fontSize: '0.75rem' }}>{errors.password}</span>}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <input
                            id="remember"
                            type="checkbox"
                            checked={data.remember}
                            onChange={(e) => setData('remember', e.target.checked)}
                        />
                        <label htmlFor="remember" style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
                            Remember active session
                        </label>
                    </div>

                    <div style={{ marginTop: 'var(--space-2)' }}>
                        <button
                            type="submit"
                            className="btn btn--primary"
                            disabled={processing}
                            style={{ width: '100%', justifyContent: 'center', padding: '12px' }}
                        >
                            {processing ? 'Authenticating...' : 'Sign In to Studio →'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
