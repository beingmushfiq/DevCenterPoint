import '../css/tokens.css';
import '../css/base.css';
import '../css/pages.css';
import '../css/select.css';
import '../css/admin.css';

import { createRoot } from 'react-dom/client';
import { createInertiaApp } from '@inertiajs/react';

const appName = window.document.getElementsByTagName('title')[0]?.innerText || 'DevCenterPoint';

createInertiaApp({
    title: (title) => (title ? `${title} — DevCenterPoint` : appName),
    resolve: (name) => {
        const pages = import.meta.glob('./Pages/**/*.jsx', { eager: true });
        const page = pages[`./Pages/${name}.jsx`];
        if (!page) {
            throw new Error(`Inertia page component "./Pages/${name}.jsx" not found.`);
        }
        return page;
    },
    setup({ el, App, props }) {
        createRoot(el).render(<App {...props} />);
    },
    progress: {
        color: '#ff4d00',
        showSpinner: false,
    },
});
