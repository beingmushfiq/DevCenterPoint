/* ============================================================
   ADMIN MEDIA LIBRARY ROUTE
   ============================================================ */

import { Router } from 'express';
import multer from 'multer';
import path from 'node:path';
import fs from 'node:fs';
import * as Admin from '../../models/admin.js';
import { renderAdmin } from '../../lib/admin-render.js';

export const mediaRouter = Router();

const uploadDir = path.resolve('public/uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, uploadDir);
  },
  filename(req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    const base = path.basename(file.originalname, ext).replace(/[^a-z0-9_-]/gi, '-');
    const unique = `${base}-${Date.now()}${ext}`;
    cb(null, unique);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter(req, file, cb) {
    const allowed = /jpeg|jpg|png|webp|svg|gif|pdf/;
    const ext = path.extname(file.originalname).toLowerCase().slice(1);
    if (allowed.test(ext) || allowed.test(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only images (JPEG, PNG, WebP, SVG, GIF) and PDF are allowed.'));
    }
  },
});

mediaRouter.get('/', async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = 32;
    const offset = (page - 1) * limit;

    const [items, total] = await Promise.all([
      Admin.listMedia({ limit, offset }),
      Admin.countMedia(),
    ]);

    renderAdmin(req, res, 'admin/media/index', {
      title: 'Media Library',
      breadcrumb: 'Media',
      items,
      total,
      page,
      pages: Math.max(1, Math.ceil(total / limit)),
    });
  } catch (err) {
    next(err);
  }
});

mediaRouter.post('/upload', upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.redirect('/admin/media?msg=No file selected&status=error');
    }

    const file = req.file;
    const webPath = `/uploads/${file.filename}`;

    await Admin.createMedia(
      {
        filename: file.filename,
        original_name: file.originalname,
        path: webPath,
        mime_type: file.mimetype,
        size_bytes: file.size,
        alt_text: req.body.alt_text || file.originalname,
        caption: req.body.caption || '',
        folder: 'uploads',
      },
      req.session.userId
    );

    res.redirect('/admin/media?msg=File uploaded successfully.');
  } catch (err) {
    next(err);
  }
});

mediaRouter.post('/:id/delete', async (req, res, next) => {
  try {
    const media = await Admin.deleteMedia(req.params.id, req.session.userId);
    if (media && media.path) {
      const localFile = path.resolve('public', media.path.replace(/^\//, ''));
      if (fs.existsSync(localFile)) {
        try { fs.unlinkSync(localFile); } catch { /* ignore */ }
      }
    }
    res.redirect('/admin/media?msg=Media deleted.');
  } catch (err) {
    next(err);
  }
});
