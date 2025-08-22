# 🚀 Vercel Deployment Guide

## Fixing the 404 Error on Vercel

The 404 error you're experiencing is likely due to the monorepo structure and routing configuration. Here's how to fix it:

## 📋 **Step-by-Step Deployment Process**

### **Option 1: Deploy Frontend Only (Recommended for now)**

1. **Navigate to the frontend directory in Vercel:**
   - Go to your Vercel dashboard
   - Create a new project
   - Set the **Root Directory** to `frontend`
   - Set the **Framework Preset** to `Vite`

2. **Environment Variables:**
   ```
   NODE_ENV=production
   ```

3. **Build Settings:**
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`

### **Option 2: Deploy Both Frontend and Backend**

#### **Step 1: Deploy Backend API**
1. Create a new Vercel project for the backend
2. Set **Root Directory** to `backend`
3. Set **Framework Preset** to `Node.js`
4. Add environment variables:
   ```
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   NODE_ENV=production
   ```

#### **Step 2: Deploy Frontend**
1. Create another Vercel project for the frontend
2. Set **Root Directory** to `frontend`
3. Set **Framework Preset** to `Vite`
4. Update the API URL in `frontend/src/utils/api.js`:
   ```javascript
   const API_BASE_URL = process.env.NODE_ENV === 'production' 
     ? 'https://your-backend-project.vercel.app/api'
     : 'http://localhost:3001/api';
   ```

## 🔧 **Current Configuration Files**

### **Root vercel.json (for frontend deployment)**
```json
{
  "version": 2,
  "builds": [
    {
      "src": "frontend/package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "frontend/dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/frontend/index.html"
    }
  ],
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/frontend/index.html"
    }
  ]
}
```

### **Backend vercel.json**
```json
{
  "version": 2,
  "builds": [
    {
      "src": "server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/server.js"
    }
  ],
  "functions": {
    "server.js": {
      "maxDuration": 30
    }
  }
}
```

## 🐛 **Common Issues and Solutions**

### **Issue 1: 404 Error on All Routes**
**Solution:** This happens because Vercel doesn't know how to handle React Router routes.
- Use the `rewrites` configuration in `vercel.json`
- Make sure all routes point to `index.html`

### **Issue 2: API Calls Failing**
**Solution:** 
- Deploy backend separately
- Update API base URL in frontend
- Check CORS configuration

### **Issue 3: Build Failures**
**Solution:**
- Check Node.js version compatibility
- Ensure all dependencies are in `package.json`
- Verify build commands

## 📝 **Recommended Deployment Steps**

### **1. Deploy Frontend First**
```bash
# In Vercel Dashboard:
# 1. Import your GitHub repository
# 2. Set Root Directory: frontend
# 3. Framework Preset: Vite
# 4. Build Command: npm run build
# 5. Output Directory: dist
```

### **2. Deploy Backend API**
```bash
# In Vercel Dashboard:
# 1. Create new project
# 2. Set Root Directory: backend
# 3. Framework Preset: Node.js
# 4. Add environment variables
```

### **3. Update Frontend API Configuration**
After getting your backend URL, update `frontend/src/utils/api.js`:
```javascript
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://your-backend-url.vercel.app/api'
  : 'http://localhost:3001/api';
```

## 🔍 **Testing Your Deployment**

### **Frontend Testing:**
1. Visit your Vercel frontend URL
2. Check if the homepage loads
3. Test navigation between pages
4. Verify static assets load correctly

### **Backend Testing:**
1. Visit `https://your-backend-url.vercel.app/api/health`
2. Should return: `{"status":"success","message":"Amrutam Doctor Portal API is running"}`

### **Integration Testing:**
1. Test the contact form
2. Test doctor registration
3. Check browser console for API errors

## 🚨 **Important Notes**

1. **Database:** You'll need a cloud MongoDB instance (MongoDB Atlas)
2. **Environment Variables:** Set them in Vercel dashboard
3. **CORS:** Backend needs to allow your frontend domain
4. **Build Time:** First build might take longer

## 📞 **If You Still Get 404 Errors**

1. **Check Vercel logs** in the dashboard
2. **Verify build output** in the Functions tab
3. **Test API endpoints** directly
4. **Check environment variables** are set correctly

## 🎯 **Quick Fix for 404 Error**

If you're still getting 404 errors, try this simplified approach:

1. **Deploy only the frontend first**
2. **Set Root Directory to `frontend`**
3. **Use Vite preset**
4. **Don't use the root vercel.json initially**

This should resolve the 404 error and get your frontend working on Vercel! 🚀
