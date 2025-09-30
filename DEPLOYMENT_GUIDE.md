# 🚀 Deployment Guide

This guide provides step-by-step instructions for deploying the Real-Time Chat Application to various platforms.

## 📋 Table of Contents

- [Prerequisites](#-prerequisites)
- [Environment Setup](#-environment-setup)
- [Backend Deployment](#-backend-deployment)
- [Frontend Deployment](#-frontend-deployment)
- [Database Setup](#-database-setup)
- [File Storage Setup](#-file-storage-setup)
- [Domain Configuration](#-domain-configuration)
- [SSL/HTTPS Setup](#-sslhttps-setup)
- [Monitoring & Maintenance](#-monitoring--maintenance)
- [Troubleshooting](#-troubleshooting)

## 🔧 Prerequisites

### Required Accounts
- **GitHub** - Code repository
- **MongoDB Atlas** - Database hosting
- **Cloudinary** - File storage
- **Render** - Backend hosting (recommended)
- **Vercel/Netlify** - Frontend hosting (recommended)
- **Domain Provider** - Custom domain (optional)

### Required Tools
- **Node.js** (v14 or higher)
- **npm** or **yarn**
- **Git**
- **MongoDB Compass** (optional, for database management)

## 🌍 Environment Setup

### 1. MongoDB Atlas Setup

1. **Create MongoDB Atlas Account**
   - Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - Sign up for a free account
   - Create a new cluster

2. **Configure Database Access**
   ```bash
   # Create database user
   Username: your_username
   Password: your_secure_password
   ```

3. **Configure Network Access**
   ```bash
   # Add IP addresses
   0.0.0.0/0 (for development)
   Your server IP (for production)
   ```

4. **Get Connection String**
   ```bash
   mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority
   ```

### 2. Cloudinary Setup

1. **Create Cloudinary Account**
   - Go to [Cloudinary](https://cloudinary.com/)
   - Sign up for a free account

2. **Get API Credentials**
   ```bash
   Cloud Name: your_cloud_name
   API Key: your_api_key
   API Secret: your_api_secret
   ```

### 3. Environment Variables

Create `.env` file in backend directory:
```env
# Server Configuration
PORT=5000
NODE_ENV=production

# Database
MONGODB_URL=mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority

# JWT
JWT_SECRET=your_very_secure_jwt_secret_key_here

# Cloudinary
CLOUD_NAME=your_cloudinary_cloud_name
API_KEY=your_cloudinary_api_key
API_SECRET=your_cloudinary_api_secret

# CORS
FRONTEND_URL=https://your-frontend-domain.com
```

## 🖥 Backend Deployment

### Option 1: Render (Recommended)

1. **Connect GitHub Repository**
   - Go to [Render](https://render.com/)
   - Sign up and connect your GitHub account
   - Select your repository

2. **Create Web Service**
   ```bash
   Name: chatly-backend
   Environment: Node
   Build Command: npm install
   Start Command: npm start
   ```

3. **Configure Environment Variables**
   - Add all environment variables from `.env`
   - Set `NODE_ENV=production`

4. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment to complete
   - Note the service URL

### Option 2: Heroku

1. **Install Heroku CLI**
   ```bash
   # Download from https://devcenter.heroku.com/articles/heroku-cli
   ```

2. **Login and Create App**
   ```bash
   heroku login
   heroku create your-app-name
   ```

3. **Configure Environment Variables**
   ```bash
   heroku config:set NODE_ENV=production
   heroku config:set MONGODB_URL=your_mongodb_url
   heroku config:set JWT_SECRET=your_jwt_secret
   heroku config:set CLOUD_NAME=your_cloudinary_cloud_name
   heroku config:set API_KEY=your_cloudinary_api_key
   heroku config:set API_SECRET=your_cloudinary_api_secret
   ```

4. **Deploy**
   ```bash
   git push heroku main
   ```

### Option 3: DigitalOcean App Platform

1. **Create App**
   - Go to [DigitalOcean App Platform](https://cloud.digitalocean.com/apps)
   - Create new app from GitHub

2. **Configure Service**
   ```bash
   Source: GitHub Repository
   Branch: main
   Build Command: npm install
   Run Command: npm start
   ```

3. **Set Environment Variables**
   - Add all required environment variables
   - Set `NODE_ENV=production`

4. **Deploy**
   - Click "Create Resources"
   - Wait for deployment

## 🎨 Frontend Deployment

### Option 1: Vercel (Recommended)

1. **Connect GitHub Repository**
   - Go to [Vercel](https://vercel.com/)
   - Sign up and connect GitHub
   - Import your repository

2. **Configure Build Settings**
   ```bash
   Framework Preset: Vite
   Build Command: npm run build
   Output Directory: dist
   Install Command: npm install
   ```

3. **Set Environment Variables**
   ```bash
   VITE_API_URL=https://your-backend-url.com
   ```

4. **Deploy**
   - Click "Deploy"
   - Wait for deployment
   - Note the deployment URL

### Option 2: Netlify

1. **Connect GitHub Repository**
   - Go to [Netlify](https://netlify.com/)
   - Sign up and connect GitHub
   - Add new site from Git

2. **Configure Build Settings**
   ```bash
   Build Command: npm run build
   Publish Directory: dist
   ```

3. **Set Environment Variables**
   ```bash
   VITE_API_URL=https://your-backend-url.com
   ```

4. **Deploy**
   - Click "Deploy site"
   - Wait for deployment

### Option 3: GitHub Pages

1. **Install gh-pages**
   ```bash
   npm install --save-dev gh-pages
   ```

2. **Update package.json**
   ```json
   {
     "scripts": {
       "predeploy": "npm run build",
       "deploy": "gh-pages -d dist"
     },
     "homepage": "https://username.github.io/repository-name"
   }
   ```

3. **Deploy**
   ```bash
   npm run deploy
   ```

## 🗄 Database Setup

### MongoDB Atlas Configuration

1. **Create Database**
   ```bash
   Database Name: chatly_db
   Collections: users, messages, conversations
   ```

2. **Set Up Indexes**
   ```javascript
   // Users collection
   db.users.createIndex({ "email": 1 }, { unique: true })
   db.users.createIndex({ "userName": 1 }, { unique: true })
   
   // Messages collection
   db.messages.createIndex({ "sender": 1 })
   db.messages.createIndex({ "receiver": 1 })
   db.messages.createIndex({ "group": 1 })
   db.messages.createIndex({ "createdAt": -1 })
   
   // Conversations collection
   db.conversations.createIndex({ "partcipants": 1 })
   db.conversations.createIndex({ "isGroup": 1 })
   ```

3. **Configure Backup**
   - Enable automatic backups
   - Set backup retention period
   - Configure backup frequency

## 📁 File Storage Setup

### Cloudinary Configuration

1. **Set Up Upload Presets**
   ```javascript
   // Image upload preset
   {
     "name": "chat_images",
     "folder": "chatly/images",
     "transformation": {
       "width": 800,
       "height": 600,
       "crop": "limit",
       "quality": "auto"
     }
   }
   
   // Video upload preset
   {
     "name": "chat_videos",
     "folder": "chatly/videos",
     "transformation": {
       "width": 1280,
       "height": 720,
       "crop": "limit",
       "quality": "auto"
     }
   }
   ```

2. **Configure Security**
   - Set up signed uploads
   - Configure upload restrictions
   - Set file size limits

## 🌐 Domain Configuration

### Custom Domain Setup

1. **Purchase Domain**
   - Choose a domain provider
   - Purchase your domain
   - Configure DNS settings

2. **Configure DNS**
   ```bash
   # Backend subdomain
   api.yourdomain.com -> your-backend-url.com
   
   # Frontend domain
   yourdomain.com -> your-frontend-url.com
   ```

3. **Update Environment Variables**
   ```env
   # Backend
   FRONTEND_URL=https://yourdomain.com
   
   # Frontend
   VITE_API_URL=https://api.yourdomain.com
   ```

## 🔒 SSL/HTTPS Setup

### Automatic SSL (Recommended)

Most hosting platforms provide automatic SSL:
- **Vercel**: Automatic SSL
- **Netlify**: Automatic SSL
- **Render**: Automatic SSL
- **Heroku**: Automatic SSL

### Manual SSL Setup

1. **Get SSL Certificate**
   - Use Let's Encrypt (free)
   - Or purchase from certificate authority

2. **Configure SSL**
   ```bash
   # Nginx configuration
   server {
       listen 443 ssl;
       server_name yourdomain.com;
       
       ssl_certificate /path/to/certificate.crt;
       ssl_certificate_key /path/to/private.key;
       
       location / {
           proxy_pass http://localhost:5000;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
       }
   }
   ```

## 📊 Monitoring & Maintenance

### 1. Application Monitoring

#### Backend Monitoring
```javascript
// Add health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});
```

#### Frontend Monitoring
```javascript
// Add error boundary
class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }
    
    static getDerivedStateFromError(error) {
        return { hasError: true };
    }
    
    componentDidCatch(error, errorInfo) {
        console.error('Error caught by boundary:', error, errorInfo);
    }
    
    render() {
        if (this.state.hasError) {
            return <h1>Something went wrong.</h1>;
        }
        return this.props.children;
    }
}
```

### 2. Performance Monitoring

#### Database Monitoring
- Monitor query performance
- Set up slow query logging
- Configure connection pooling

#### Server Monitoring
- Monitor CPU and memory usage
- Set up alerts for high usage
- Configure auto-scaling

### 3. Backup Strategy

#### Database Backups
```bash
# Automated backups
- Daily backups
- Weekly full backups
- Monthly archive backups
```

#### Code Backups
```bash
# Version control
- Git repository
- Multiple remotes
- Tagged releases
```

## 🐛 Troubleshooting

### Common Deployment Issues

#### 1. Build Failures
```bash
# Check build logs
- Verify Node.js version
- Check package.json scripts
- Ensure all dependencies are installed
```

#### 2. Environment Variable Issues
```bash
# Verify environment variables
- Check variable names
- Ensure proper formatting
- Verify secret values
```

#### 3. Database Connection Issues
```bash
# Check database connection
- Verify connection string
- Check network access
- Ensure database is running
```

#### 4. CORS Issues
```bash
# Check CORS configuration
- Verify allowed origins
- Check credentials setting
- Ensure proper headers
```

#### 5. File Upload Issues
```bash
# Check file upload configuration
- Verify Cloudinary credentials
- Check file size limits
- Ensure proper MIME types
```

### Performance Issues

#### 1. Slow Response Times
```bash
# Optimize database queries
- Add indexes
- Optimize aggregation pipelines
- Use connection pooling
```

#### 2. High Memory Usage
```bash
# Monitor memory usage
- Check for memory leaks
- Optimize image processing
- Implement caching
```

#### 3. Socket Connection Issues
```bash
# Check socket configuration
- Verify CORS settings
- Check connection limits
- Monitor connection stability
```

## 🔧 Maintenance Tasks

### Daily Tasks
- Monitor application logs
- Check error rates
- Verify backup status

### Weekly Tasks
- Review performance metrics
- Update dependencies
- Check security alerts

### Monthly Tasks
- Review and update documentation
- Performance optimization
- Security audit

## 📚 Additional Resources

- [Render Documentation](https://render.com/docs)
- [Vercel Documentation](https://vercel.com/docs)
- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)
- [Cloudinary Documentation](https://cloudinary.com/documentation)
- [Let's Encrypt Documentation](https://letsencrypt.org/docs/)

---

This deployment guide provides comprehensive instructions for deploying the Real-Time Chat Application to various platforms. Follow the steps carefully and refer to the troubleshooting section if you encounter any issues.
