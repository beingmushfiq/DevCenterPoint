/* ============================================================
   ADMIN ROUTE DISPATCHER
   Mounts all admin sub-routers with authentication and CSRF guards.
   ============================================================ */

import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.js';
import { csrf } from '../../middleware/csrf.js';

import { authRouter } from './auth.js';
import { dashboardRouter } from './dashboard.js';
import { casesRouter } from './cases.js';
import { postsRouter } from './posts.js';
import { servicesRouter } from './services.js';
import { teamRouter } from './team.js';
import { testimonialsRouter } from './testimonials.js';
import { faqsRouter } from './faqs.js';
import { pagesRouter } from './pages.js';
import { submissionsRouter } from './submissions.js';
import { mediaRouter } from './media.js';
import { settingsRouter } from './settings.js';
import { navRouter } from './nav.js';

export const adminRoutes = Router();

/* CSRF token generation & validation on all admin requests */
adminRoutes.use(csrf);

/* Public authentication routes (login/logout) */
adminRoutes.use('/', authRouter);

/* All routes below this line require valid admin session */
adminRoutes.use(requireAuth);

adminRoutes.use('/', dashboardRouter);
adminRoutes.use('/cases', casesRouter);
adminRoutes.use('/posts', postsRouter);
adminRoutes.use('/services', servicesRouter);
adminRoutes.use('/team', teamRouter);
adminRoutes.use('/testimonials', testimonialsRouter);
adminRoutes.use('/faqs', faqsRouter);
adminRoutes.use('/pages', pagesRouter);
adminRoutes.use('/submissions', submissionsRouter);
adminRoutes.use('/media', mediaRouter);
adminRoutes.use('/settings', settingsRouter);
adminRoutes.use('/nav', navRouter);
