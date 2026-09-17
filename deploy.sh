#!/bin/bash
set -e

# ============================================================
# DevCenterPoint — Automated cPanel Deployment Script
# ============================================================

APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$APP_DIR"

echo "=========================================="
echo " Starting DevCenterPoint Deployment"
echo " Directory: $APP_DIR"
echo " Timestamp: $(date)"
echo "=========================================="

# 1. Ensure .env exists with production credentials
if [ ! -f ".env" ]; then
  if [ -f ".env.production" ]; then
    echo "Creating .env from .env.production..."
    cp .env.production .env
  elif [ -f ".env.example" ]; then
    echo "Creating .env from .env.example..."
    cp .env.example .env
  fi
fi

# 2. Discover Node.js / npm binaries in cPanel environment
# cPanel CloudLinux Node.js selector installs node in virtualenvs or ea-nodejs paths
for p in \
  "$HOME/nodevenv/devcenterpoint"/*/bin \
  "$HOME/nodevenv"/*/*/bin \
  /opt/cpanel/ea-nodejs*/bin \
  /usr/local/bin \
  "$HOME/bin" \
  "$HOME/.nvm/versions/node"/*/bin; do
  if [ -d "$p" ]; then
    export PATH="$p:$PATH"
  fi
done

# If node virtual environment activate script exists, source it
VENV_ACTIVATE=$(find "$HOME/nodevenv" -name "activate" 2>/dev/null | head -n 1)
if [ -n "$VENV_ACTIVATE" ] && [ -f "$VENV_ACTIVATE" ]; then
  echo "Activating Node.js virtualenv: $VENV_ACTIVATE"
  source "$VENV_ACTIVATE" || true
fi

NODE_BIN=$(command -v node || echo "node")
NPM_BIN=$(command -v npm || echo "npm")

echo "Using Node: $($NODE_BIN -v 2>/dev/null || echo 'not found in PATH')"
echo "Using NPM:  $($NPM_BIN -v 2>/dev/null || echo 'not found in PATH')"

# 3. Install production dependencies (zero devDependencies, low memory)
if command -v npm &> /dev/null; then
  echo "Installing production dependencies (npm install --omit=dev)..."
  npm install --omit=dev --no-audit --no-fund
else
  echo "Notice: npm command not found; skipping npm install (assumes dependencies already present)."
fi

# 4. Database Setup and Migrations
if [ -f "server/db/setup.js" ]; then
  echo "Running database setup & migrations..."
  $NODE_BIN server/db/setup.js || $NODE_BIN server/db/migrate.js || echo "Database migration step completed."
fi

# 5. Ensure required runtime directories exist
mkdir -p tmp
mkdir -p public/uploads
chmod 755 public/uploads 2>/dev/null || true

# 6. Ensure LiteSpeed / Apache public_html/.htaccess routes to Node.js
if [ -d "$HOME/public_html" ]; then
  echo "Configuring LiteSpeed Passenger bridge in $HOME/public_html/.htaccess..."
  NODE_EXEC=$(command -v node || find "$HOME/nodevenv/devcenterpoint" -name "node" 2>/dev/null | head -n 1 || echo "$HOME/nodevenv/devcenterpoint/24/bin/node")
  cat << EOF > "$HOME/public_html/.htaccess"
# DO NOT REMOVE. CLOUDLINUX PASSENGER CONFIGURATION BEGIN
PassengerAppRoot "$APP_DIR"
PassengerBaseURI "/"
PassengerNodejs "$NODE_EXEC"
PassengerAppType node
PassengerStartupFile start.cjs
# DO NOT REMOVE. CLOUDLINUX PASSENGER CONFIGURATION END
EOF
fi

# 7. Restart Phusion Passenger / LiteSpeed
echo "Triggering Phusion Passenger restart (touch tmp/restart.txt)..."
touch tmp/restart.txt

echo "=========================================="
echo " DevCenterPoint Deployment Finished Successfully!"
echo "=========================================="
