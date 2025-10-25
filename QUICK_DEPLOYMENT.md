# 🚀 Quick Deployment Reference Card

## 📁 **Files to Upload**

### Frontend (to `public_html`)
```
dist/
├── index.html
└── assets/
    ├── index-[hash].css
    └── index-[hash].js
```

### Backend (to `sensidoc-backend`)
```
backend/dist/
├── index.js
├── controllers/
├── middleware/
├── routes/
├── services/
├── config/
└── package.json
```

---

## ⚙️ **Environment Variables (.env)**

```env
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_supabase_service_key
PORT=3001
NODE_ENV=production
JWT_SECRET=your_secure_jwt_secret
OPENAI_API_KEY=your_openai_api_key
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_email_app_password
```

---

## 🔧 **Quick Commands**

### Install Dependencies
```bash
cd sensidoc-backend
npm install --production
```

### Start Server
```bash
node index.js
```

### Using PM2 (if available)
```bash
pm2 start index.js --name sensidoc-backend
pm2 save
pm2 startup
```

---

## 🌐 **URLs After Deployment**

- **Frontend:** `https://your-domain.com`
- **Backend API:** `https://api.your-domain.com`
- **API Docs:** `https://api.your-domain.com/api-docs`

---

## ✅ **Quick Test Checklist**

- [ ] Frontend loads at domain
- [ ] Backend responds at API URL
- [ ] User registration works
- [ ] Login functionality works
- [ ] SSL certificate installed
- [ ] No console errors

---

## 🆘 **Common Issues**

| Issue | Solution |
|-------|----------|
| Frontend not loading | Check file permissions (644/755) |
| Backend not starting | Verify Node.js version and dependencies |
| API connection failed | Check CORS and API URL configuration |
| Database errors | Verify Supabase credentials |

---

**📖 Full Guide:** See `DEPLOYMENT_GUIDE.md` for detailed instructions. 