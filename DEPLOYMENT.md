# Deployment Guide for DebateVerse

## Problem Solved

This fix addresses the classic SPA (Single Page Application) routing issue where:
- ✅ Client-side navigation works (clicking links within the app)
- ❌ Direct URL access or page refresh returns 404

The issue occurs because the server doesn't know to serve `index.html` for non-root routes like `/login`, `/register`, etc.

## Changes Made

### 1. Server Configuration (`server/src/app.js`)

Added production-ready static file serving and fallback routing:

```javascript
// Added imports for path handling
import path from 'path';
import { fileURLToPath } from 'url';

// Added at the end of the file:
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isProduction = process.env.NODE_ENV === 'production';

if (isProduction) {
  const clientPath = path.resolve(__dirname, '../../../client/dist');
  app.use(express.static(clientPath));
  
  // Fallback route: serve index.html for all non-API routes
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(clientPath, 'index.html'));
  });
}
```

**Why this works:**
- In production, Express serves static files from the Vite build output (`client/dist`)
- The `'*'` catch-all route ensures that any non-API route (like `/login`, `/register`) serves `index.html`
- React Router then takes over and renders the correct component

### 2. Nginx Configuration (`nginx.conf`)

Created a production-ready Nginx configuration with:
- SSL/TLS setup
- Proper headers and security
- API proxy to Node.js backend
- Socket.IO support
- **Critical**: `try_files $uri $uri/ /index.html;` directive for SPA routing

## Deployment Instructions

### For Production Deployment

#### 1. Build the Client
```bash
cd client
npm run build
```

This creates the production-ready files in `client/dist`

#### 2. Set Environment Variables
```bash
# In server/.env
NODE_ENV=production
FRONTEND_URL=https://mydomain.com
# ... other variables
```

#### 3. Start the Server
```bash
cd server
npm start
```

#### 4. Nginx Setup
1. Copy `nginx.conf` to `/etc/nginx/conf.d/debateverse.conf`
2. Replace `mydomain.com` with your actual domain
3. Set up SSL certificates (Let's Encrypt recommended)
4. Restart Nginx:
```bash
sudo systemctl restart nginx
```

### For Development

The development setup remains unchanged:
- Vite development server handles client-side routing automatically
- No changes needed to your development workflow
- Just run:
```bash
# Terminal 1: Client
cd client
npm run dev

# Terminal 2: Server
cd server
npm run dev
```

## How It Works

### Development Mode
- Vite's development server handles all routing
- API requests are proxied to the Express server
- No server-side changes needed

### Production Mode
1. User visits `https://mydomain.com/login`
2. Nginx receives the request
3. Nginx tries to find `/login` file (doesn't exist)
4. Nginx falls back to `/index.html` (due to `try_files` directive)
5. React Router loads and renders the Login component
6. API calls are proxied to the Node.js backend

## Testing

Verify the fix works by:
1. ✅ Clicking navigation links within the app
2. ✅ Refreshing the page on any route (`/login`, `/register`, etc.)
3. ✅ Directly accessing URLs in a new tab
4. ✅ Checking that API routes still work correctly

## Additional Notes

- The solution works with any hosting provider (Vercel, Netlify, Render, etc.)
- For platforms like Vercel or Netlify, you may need to configure rewrite rules in their respective configuration files
- Socket.IO connections are properly proxied through Nginx
- Security headers are included for production deployments