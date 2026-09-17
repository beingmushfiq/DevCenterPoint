/**
 * DevCenterPoint — Application Entry Point
 *
 * This file serves as the default entry point for cPanel (Phusion Passenger),
 * CloudLinux "Setup Node.js App", and PaaS environments.
 * It ensures production environment variables are loaded and boots the server.
 */

import fs from 'node:fs';
import dotenv from 'dotenv';

// If .env is missing but .env.production exists, load it automatically
if (!fs.existsSync('.env') && fs.existsSync('.env.production')) {
  dotenv.config({ path: '.env.production' });
} else {
  dotenv.config();
}

import './server/index.js';
