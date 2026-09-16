# Complete cPanel Deployment & Hosting Guide for DevCenterPoint

This manual provides an end-to-end, production-ready walkthrough for deploying and running **DevCenterPoint** on any **cPanel** hosting environment equipped with the **CloudLinux "Setup Node.js App"** feature (Phusion Passenger) and **MySQL 8.0 / MariaDB 10.4+**.

---

## Architecture Overview on cPanel

```
[ Visitor / Browser (HTTPS) ]
              │
              ▼
    [ Apache Web Server ]
  (Handles SSL, Port 80/443, .htaccess)
              │
              ▼
   [ Phusion Passenger ]
  (cPanel Node.js Application Manager)
              │
              ▼
   [ Node.js Process (app.js) ]
  (Express 5 + Server-Side EJS Templates)
              │
              ▼
     [ MySQL Database ]
(cPanel Local / Remote MySQL Server)
```

In a cPanel environment:
1. **Apache** receives the incoming HTTP/HTTPS traffic.
2. **Phusion Passenger** launches and monitors the Node.js process using `app.js`.
3. Requests are transparently proxied to your Express server.
4. Static assets in `public/` and compiled bundles in `dist/` are served with caching headers.
5. All content and sessions are stored in your cPanel **MySQL** database.

---

## 1. Prerequisites Checklist

Before you begin, verify that your cPanel account has:
- [x] **Setup Node.js App** (present under the **Software** section in cPanel).
- [x] **Node.js 20.x or 22.x LTS** available in the Node.js selector.
- [x] **MySQL Database Wizard** access.
- [x] **File Manager** or **Terminal / SSH** access.
- [x] A domain or subdomain pointed to your hosting account.

---

## 2. Step-by-Step Deployment Walkthrough

### Step 1: Prepare the Files Locally

Before uploading to cPanel, compile the production assets locally:

1. Open your terminal in the project directory:
   ```bash
   cd devcenterpoint
   ```

2. Compile the production bundles:
   ```bash
   npm run build
   ```
   *This generates the optimized, fingerprinted JavaScript and CSS bundles inside the `dist/` folder.*

3. Create a clean deployment zip archive **excluding** the following:
   - ❌ `node_modules/` *(you will install fresh Linux binaries on cPanel)*
   - ❌ `.git/` *(unneeded source control history)*
   - ❌ `.env` *(you will create this securely on the server)*

   **Windows (PowerShell command to zip):**
   ```powershell
   Get-ChildItem -Path . -Exclude 'node_modules', '.git', '.env' | Compress-Archive -DestinationPath ..\devcenterpoint-deploy.zip -Force
   ```

---

### Step 2: Create the MySQL Database in cPanel

1. Log into your **cPanel Dashboard**.
2. Navigate to **Databases** ➔ **MySQL Database Wizard**.
3. **Step 1: Create A Database**:
   - Name: `devcenter_cms` *(full name will be `cpaneluser_devcenter_cms`)*.
   - Click **Next Step**.
4. **Step 2: Create Database Users**:
   - Username: `devcenter_user` *(full name `cpaneluser_devcenter_user`)*.
   - Password: Click **Password Generator** to create a strong 24+ character password.
   - **Save the database name, username, and password in a safe place.**
   - Click **Create User**.
5. **Step 3: Add User to the Database**:
   - Check **ALL PRIVILEGES**.
   - Click **Make Changes**.

---

### Step 3: Create the Node.js Application in cPanel

1. In cPanel, go to **Software** ➔ **Setup Node.js App**.
2. Click **Create Application** (top-right button).
3. Fill in the application parameters:
   - **Node.js version**: Choose **20.x** or **22.x** (LTS).
   - **Application mode**: Select **Production**.
   - **Application root**: Enter the folder path, e.g., `devcenterpoint` (relative to your home directory).
   - **Application URL**: Select your domain or subdomain (e.g., `yourdomain.com`).
   - **Application startup file**: Enter `app.js`.
4. Click **Create** at the top right.
5. Once created, you will see a banner at the top showing a command like:
   ```bash
   source /home/youruser/nodevenv/devcenterpoint/20/bin/activate && cd /home/youruser/devcenterpoint
   ```
   *Copy this command — you will use it if running commands via SSH or cPanel Terminal.*

---

### Step 4: Upload the Application Files

1. In cPanel, open **Files** ➔ **File Manager**.
2. Navigate into the **Application root** directory you set in Step 3 (e.g., `/home/youruser/devcenterpoint`).
3. If cPanel created a placeholder `app.js` file, you can delete or overwrite it.
4. Click **Upload** in the top toolbar and upload `devcenterpoint-deploy.zip`.
5. Once uploaded, right-click the zip file in File Manager and select **Extract**.
6. Verify the folder structure:
   ```
   /home/youruser/devcenterpoint/
   ├── app.js
   ├── package.json
   ├── dist/
   ├── server/
   ├── src/
   ├── views/
   ├── migrations/
   ├── public/
   └── .htaccess
   ```

---

### Step 5: Configure Production Environment Variables (`.env`)

1. In File Manager, click **Settings** (top-right gear icon) and ensure **Show Hidden Files (dotfiles)** is checked.
2. In your application root (`/home/youruser/devcenterpoint`), create a new file named `.env`.
3. Add the production environment variables:

```ini
# --- Server Environment ---
NODE_ENV=production
PORT=3000
SITE_URL=https://yourdomain.com

# --- cPanel MySQL Database Credentials ---
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=cpaneluser_devcenter_user
DB_PASSWORD=YourStrongGeneratedPasswordHere!
DB_NAME=cpaneluser_devcenter_cms
DB_POOL_SIZE=10

# --- Security & Sessions ---
# Generate a strong 48-character secret (letters, numbers, symbols)
SESSION_SECRET=a8f9c2d1e4b70365fc0981248ab761e05d9321cbafe40798

# --- Initial Administrator Credentials ---
ADMIN_EMAIL=admin@yourdomain.com
ADMIN_PASSWORD=YourSuperSecureAdminPassword2026!
ADMIN_NAME=Administrator
```
4. Click **Save Changes**.

---

### Step 6: Install Dependencies

You can install dependencies via the cPanel UI or the Terminal:

#### Method A: Via cPanel UI (No Terminal required)
1. Go back to **Setup Node.js App** in cPanel.
2. Click the edit icon (pencil) next to your `devcenterpoint` application.
3. Scroll down to the **Detected configuration files** section.
4. Click the **Run NPM Install** button next to `package.json`.
5. Wait 30–60 seconds for the installation to finish.

#### Method B: Via cPanel Terminal / SSH (Recommended)
1. In cPanel, open **Advanced** ➔ **Terminal**.
2. Paste the virtual environment activation command provided by cPanel:
   ```bash
   source /home/youruser/nodevenv/devcenterpoint/20/bin/activate && cd /home/youruser/devcenterpoint
   ```
3. Run the production installation:
   ```bash
   npm install --omit=dev
   ```

---

### Step 7: Initialize Database & Seed Content

In the cPanel Terminal:
1. Ensure the Node.js virtual environment is active:
   ```bash
   source /home/youruser/nodevenv/devcenterpoint/20/bin/activate && cd /home/youruser/devcenterpoint
   ```

2. Run the database setup script:
   ```bash
   npm run db:setup
   ```
   This will:
   - Execute all SQL schemas and migrations.
   - Create all 24 relational tables.
   - Seed the initial site settings, services, sample case studies, and navigation.
   - Create your administrator account using `ADMIN_EMAIL` and `ADMIN_PASSWORD` from `.env`.

3. Verify output:
   ```
   ✓ Database configured and seeded cleanly.
   ```

---

### Step 8: Configure `.htaccess` & Security

Ensure your root `.htaccess` file inside `/home/youruser/devcenterpoint/.htaccess` contains:

```apache
# ============================================================
# DEVCENTERPOINT — CPANEL & APACHE CONFIGURATION
# ============================================================

# 1. Block access to sensitive source files, dotfiles, and databases
<FilesMatch "^\.(env|git|gitignore|eslintrc|editorconfig)|package(-lock)?\.json|\.(md|sql|log|sh)$">
  Order Allow,Deny
  Deny from all
</FilesMatch>

# 2. Block access to backend internal directories
RedirectMatch 403 ^/(server|views|migrations|node_modules)/

# 3. Security Headers
<IfModule mod_headers.c>
  Header always set X-Content-Type-Options "nosniff"
  Header always set X-Frame-Options "DENY"
  Header always set X-XSS-Protection "1; mode=block"
  Header always set Referrer-Policy "strict-origin-when-cross-origin"
</IfModule>

# 4. HTTPS Force Redirect
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteCond %{HTTPS} off
  RewriteCond %{HTTP:X-Forwarded-Proto} !https
  RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
</IfModule>

# 5. Phusion Passenger
<IfModule mod_passenger.c>
  PassengerAppRoot "/home/youruser/devcenterpoint"
  PassengerBaseURI "/"
  PassengerStartupFile app.js
  PassengerAppType node
</IfModule>
```

*(Also confirm `public/uploads/.htaccess` is present to protect uploaded media from script execution).*

---

### Step 9: Install Free SSL Certificate (HTTPS)

1. In cPanel, navigate to **Security** ➔ **SSL/TLS Status**.
2. Find your domain name in the list.
3. Click **Run AutoSSL**.
4. Within 1–3 minutes, cPanel will issue and configure a free Sectigo or Let's Encrypt certificate.

---

### Step 10: Start & Test the Application

1. Go to **Setup Node.js App**.
2. Click **Restart** on your application.
3. Open your browser and navigate to:
   - **Website**: `https://yourdomain.com`
   - **Health Check**: `https://yourdomain.com/healthz` (should return `{"ok":true,"database":"...","version":"..."}`)
   - **Admin Portal**: `https://yourdomain.com/admin/login`

---

## 3. Maintenance, Monitoring & Troubleshooting

### How to Restart the Application After Content/Code Updates
Whenever you update code or settings, restart Passenger using any of these methods:
- **cPanel UI**: Go to **Setup Node.js App** and click the **Restart** icon.
- **Terminal**: Run `touch tmp/restart.txt` inside your application root:
  ```bash
  mkdir -p tmp && touch tmp/restart.txt
  ```

### Inspecting Error Logs
If your app displays a *503 Service Unavailable* or *Application Error*:
1. Open File Manager in the application root.
2. Look for `stderr.log` or `passenger.log`.
3. Read the latest lines at the bottom of the log file for the exact JavaScript or database error.

### Common Issues & Quick Fixes

| Issue | Root Cause | Solution |
| :--- | :--- | :--- |
| **503 Service Unavailable** | Node.js process failed during startup | Check `stderr.log`. Verify `.env` has correct database credentials and `dist/.vite/manifest.json` exists. |
| **Database Connection Refused** | Incorrect `DB_HOST` or credentials | On cPanel, `DB_HOST` is almost always `127.0.0.1` or `localhost`. Confirm the MySQL user has all privileges assigned. |
| **Styles or 3D Scene Missing** | `dist/` directory was not uploaded | Run `npm run build` locally and upload the generated `dist/` folder into your application root. |
| **Admin Login Returns 429** | Rate limiter triggered due to failed attempts | Wait 15 minutes, or clear the session table in phpMyAdmin. |
| **Cookies / Login not sticking** | `trust proxy` mismatch on HTTPS | Ensure `app.set('trust proxy', 1)` is present in `server/index.js` (pre-configured) so secure cookies work behind Passenger. |

---

## Congratulations!
Your **DevCenterPoint** platform is now fully deployed, security-hardened, and running live on cPanel!
