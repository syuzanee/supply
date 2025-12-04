# ✅ Deployment Checklist

## Pre-Deployment Checklist

### Backend Preparation

- [ ] **Models Trained & Tested**
  - [ ] Supplier model accuracy > 90%
  - [ ] Shipment model tested with sample data
  - [ ] Inventory model validated
  
- [ ] **API Endpoints Working**
  - [ ] All `/api/v1/*` endpoints respond correctly
  - [ ] Error handling implemented
  - [ ] Input validation working
  - [ ] Response times acceptable (<2s)

- [ ] **Security Configured**
  - [ ] CORS properly configured
  - [ ] API keys (if needed) implemented
  - [ ] Rate limiting enabled
  - [ ] Input sanitization active

- [ ] **Environment Variables**
  - [ ] `DATABASE_URL` (if using database)
  - [ ] `SECRET_KEY` set
  - [ ] `ENVIRONMENT=production`
  - [ ] Model file paths configured

- [ ] **Dependencies**
  - [ ] `requirements.txt` up to date
  - [ ] All packages pinned to versions
  - [ ] No development dependencies in production

### Frontend Preparation

- [ ] **Build Process**
  - [ ] `npm run build` completes successfully
  - [ ] No console errors in production build
  - [ ] Bundle size optimized (<2MB)
  - [ ] Sourcemaps disabled for production

- [ ] **Environment Configuration**
  - [ ] `VITE_API_URL` points to production backend
  - [ ] No localhost URLs in production
  - [ ] Analytics configured (if needed)

- [ ] **Testing**
  - [ ] All components render correctly
  - [ ] API integration working
  - [ ] Error states handled gracefully
  - [ ] Loading states implemented
  - [ ] Mobile responsive verified

- [ ] **Performance**
  - [ ] Images optimized
  - [ ] Code splitting implemented
  - [ ] Lazy loading for heavy components
  - [ ] Lighthouse score > 90

### Code Quality

- [ ] **Code Review**
  - [ ] No console.logs in production
  - [ ] No commented-out code
  - [ ] Proper error handling everywhere
  - [ ] Code comments where necessary

- [ ] **Security**
  - [ ] No sensitive data in code
  - [ ] API keys in environment variables
  - [ ] XSS protection implemented
  - [ ] HTTPS enforced

## Deployment Options

### Option 1: Vercel (Frontend) + Railway (Backend)

#### Frontend on Vercel

```bash
# 1. Install Vercel CLI
npm i -g vercel

# 2. Build project
cd frontend
npm run build

# 3. Deploy
vercel --prod

# 4. Set environment variable
vercel env add VITE_API_URL production
```

#### Backend on Railway

```bash
# 1. Install Railway CLI
npm i -g @railway/cli

# 2. Login
railway login

# 3. Initialize project
cd backend
railway init

# 4. Deploy
railway up

# 5. Set environment variables
railway variables set ENVIRONMENT=production
```

### Option 2: Docker Deployment

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "8000:8000"
    environment:
      - ENVIRONMENT=production
      - PORT=8000
    restart: always

  frontend:
    build: ./frontend
    ports:
      - "80:80"
    environment:
      - VITE_API_URL=http://your-domain.com:8000
    depends_on:
      - backend
    restart: always
```

Deploy:

```bash
# Build and start
docker-compose up -d --build

# Check logs
docker-compose logs -f

# Stop
docker-compose down
```

### Option 3: Traditional VPS (DigitalOcean, AWS, etc.)

#### Backend Setup

```bash
# 1. SSH into server
ssh user@your-server-ip

# 2. Install Python
sudo apt update
sudo apt install python3 python3-pip

# 3. Clone repository
git clone your-repo-url
cd backend

# 4. Install dependencies
pip3 install -r requirements.txt

# 5. Setup systemd service
sudo nano /etc/systemd/system/supply-chain-api.service
```

Service file content:

```ini
[Unit]
Description=Supply Chain API
After=network.target

[Service]
User=ubuntu
WorkingDirectory=/home/ubuntu/backend
Environment="PATH=/usr/bin"
ExecStart=/usr/bin/python3 -m uvicorn main:app --host 0.0.0.0 --port 8000
Restart=always

[Install]
WantedBy=multi-user.target
```

```bash
# 6. Start service
sudo systemctl start supply-chain-api
sudo systemctl enable supply-chain-api
```

#### Frontend Setup

```bash
# 1. Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install nodejs

# 2. Build frontend
cd frontend
npm install
npm run build

# 3. Setup Nginx
sudo apt install nginx
sudo nano /etc/nginx/sites-available/supply-chain
```

Nginx config:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    root /home/ubuntu/frontend/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

```bash
# 4. Enable site
sudo ln -s /etc/nginx/sites-available/supply-chain /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## Post-Deployment Checks

### Immediate Checks (Within 5 minutes)

- [ ] **Website Loads**
  - [ ] Frontend accessible at domain
  - [ ] No console errors
  - [ ] Styling correct

- [ ] **API Connection**
  - [ ] Header shows "Connected"
  - [ ] Health check returns 200
  - [ ] Models loaded successfully

- [ ] **Basic Functionality**
  - [ ] Dashboard loads
  - [ ] Supplier predictor works
  - [ ] At least one feature tested successfully

### Within 24 Hours

- [ ] **Performance Monitoring**
  - [ ] Response times acceptable
  - [ ] No memory leaks
  - [ ] CPU usage normal
  - [ ] Error rate < 1%

- [ ] **User Testing**
  - [ ] All features tested
  - [ ] Mobile devices tested
  - [ ] Different browsers tested
  - [ ] User feedback collected

- [ ] **Monitoring Setup**
  - [ ] Uptime monitoring active
  - [ ] Error tracking configured
  - [ ] Analytics tracking (optional)
  - [ ] Backup system in place

### Within 1 Week

- [ ] **Security Audit**
  - [ ] SSL certificate installed
  - [ ] Security headers configured
  - [ ] Rate limiting tested
  - [ ] Penetration testing (if applicable)

- [ ] **Performance Optimization**
  - [ ] CDN configured (if needed)
  - [ ] Caching implemented
  - [ ] Database indexed (if applicable)
  - [ ] Load testing completed

- [ ] **Documentation**
  - [ ] User guide created
  - [ ] Admin documentation written
  - [ ] API documentation published
  - [ ] Troubleshooting guide available

## Monitoring & Maintenance

### Daily
- Check uptime status
- Review error logs
- Monitor response times

### Weekly
- Review user feedback
- Update dependencies
- Performance analysis

### Monthly
- Security updates
- Backup verification
- Capacity planning

## Rollback Plan

If deployment fails:

```bash
# Frontend (Vercel)
vercel rollback

# Backend (Railway)
railway rollback

# Docker
docker-compose down
git checkout previous-working-commit
docker-compose up -d --build

# VPS
sudo systemctl stop supply-chain-api
cd backend && git checkout previous-commit
sudo systemctl start supply-chain-api
```

## Support Contacts

- **Technical Issues:** [Your Contact]
- **Deployment Help:** [DevOps Contact]
- **Emergency:** [On-Call Number]

## Success Criteria

✅ Deployment is successful when:

1. Website loads at production URL
2. All features functional
3. No critical errors in logs
4. API response time < 2s
5. Mobile responsive
6. HTTPS working
7. Monitoring active
8. Team trained on system

---

**Last Updated:** [Date]  
**Next Review:** [Date + 1 month]