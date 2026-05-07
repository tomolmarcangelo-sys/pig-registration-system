# Pig Registration System - Render Deployment Guide

## Step-by-Step Deployment Instructions

### Prerequisites
- GitHub account with your project pushed to a repository
- Render.com account

### Step 1: Prepare Your Project Locally

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Build the project:**
   ```bash
   npm run build
   ```

3. **Test the server locally:**
   ```bash
   npm start
   ```
   The server should run on `http://localhost:3000`

### Step 2: Push to GitHub

1. Initialize git (if not already done):
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Add Render deployment"
   ```

2. Push to your GitHub repository:
   ```bash
   git branch -M main
   git remote add origin https://github.com/yourusername/pig-registration-system.git
   git push -u origin main
   ```

### Step 3: Deploy to Render

#### Option A: Using render.yaml (Recommended)

1. Go to [https://render.com](https://render.com)
2. Sign up or log in with your GitHub account
3. Click **New +** → **Web Service**
4. Connect your GitHub repository
5. Select your `pig-registration-system` repository
6. Render will automatically detect `render.yaml` and configure the service
7. Click **Deploy**

#### Option B: Manual Configuration

1. Go to [https://render.com](https://render.com)
2. Click **New +** → **Web Service**
3. Connect your GitHub repository
4. Fill in the following settings:

   | Setting | Value |
   |---------|-------|
   | **Name** | pig-registration-system |
   | **Runtime** | Node |
   | **Build Command** | `npm install && npm run build` |
   | **Start Command** | `npm start` |
   | **Environment** | Production |
   | **Plan** | Free |

5. Add Environment Variable (Optional):
   - Key: `NODE_ENV`
   - Value: `production`

6. Click **Create Web Service**

### Step 4: Verify Deployment

1. Wait for the build to complete (usually 2-5 minutes)
2. Once deployed, you'll get a URL like: `https://pig-registration-system.onrender.com`
3. Visit the URL to test your application
4. Check the API health endpoint: `https://your-app-url.onrender.com/api/health`

### Step 5: Set Up Auto-Deploy (Optional)

1. In Render dashboard, go to your service settings
2. Under **Deploy**, toggle **Auto-Deploy from Git**
3. Now every push to `main` branch will automatically deploy

### Troubleshooting

#### Build Fails
- Check the build logs in Render dashboard
- Ensure all dependencies are listed in `package.json`
- Verify `npm run build` works locally

#### Application Crashes
- Check runtime logs in Render dashboard
- Ensure environment variables are set correctly
- Verify the `dist` folder is created after build

#### Static Files Not Loading
- Ensure `npm run build` completes successfully
- Check that `dist` folder contains your built files
- Verify `server.ts` paths are correct

### Project Structure After Build

```
project-root/
├── dist/               # Built React app (created by Vite)
├── src/                # Source files
├── server.ts           # Node.js server
├── package.json        # Dependencies
├── render.yaml         # Render configuration
├── .nvmrc              # Node version
└── vite.config.ts      # Vite configuration
```

### Key Files for Render

1. **server.ts** - Express server that serves your React app
2. **render.yaml** - Deployment configuration
3. **.nvmrc** - Specifies Node.js version (20)
4. **package.json** - Updated with Express and build scripts

### Environment Variables

If your app needs environment variables:
1. In Render dashboard, go to **Environment**
2. Add your variables (API keys, database URLs, etc.)
3. Use `process.env.VARIABLE_NAME` in Node.js
4. Use `import.meta.env.VITE_VARIABLE_NAME` in React (prefix with `VITE_`)

### Performance Tips

1. **Enable Caching:**
   - Add cache headers to static files
   - The server is pre-configured with static file serving

2. **Monitor Logs:**
   - Check logs regularly in Render dashboard
   - Set up error tracking (optional)

3. **Free Plan Limitations:**
   - App spins down after 15 minutes of inactivity
   - Limited to 0.5GB RAM
   - For production, upgrade to a paid plan

### Next Steps

- Monitor your application in Render dashboard
- Set up custom domain (if needed)
- Configure email alerts for deployment failures
- Consider upgrading to a paid plan for production use

### Support

For issues with Render, visit: https://render.com/docs
For issues with this project, check the GitHub repository
