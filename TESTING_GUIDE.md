# FiberTrace Testing Guide

## 🚀 Quick Start - Test Credentials

### Admin Account
- **Email:** `admin@fibertrace.app`
- **Password:** `admin123456`
- **Role:** Administrator (full access to email settings)

### Technician Account
- **Email:** `john@fibertrace.app`
- **Password:** `tech123456`
- **Role:** Technician

### Field Technician Account
- **Email:** `jane@fibertrace.app`
- **Password:** `field123456`
- **Role:** Field Technician

---

## 📋 Testing Features

### 1. **Login Screen**
- ✅ Login with admin credentials
- ✅ Verify motto displays at bottom: "🌐 Connecting Infrastructure • Bridging Networks • Empowering Operations"
- ✅ Test "Create New Account" link
- ✅ Test "Forgot Password?" recovery flow

### 2. **Profile Management** (All Users)
- ✅ Access profile screen
- ✅ Edit full name, organization
- ✅ View email verification status
- ✅ Accept Terms of Service
- ✅ Adjust data retention settings

### 3. **Admin Email Settings** (Admin Only)
- ✅ Login as admin@fibertrace.app
- ✅ Navigate to Email Configuration
- ✅ Enter Google App Password (16-character)
- ✅ Set OTP expiry time
- ✅ Toggle email verification on/off
- ✅ Enable/disable single email use
- ✅ Save configuration

### 4. **Map Module** (All Users)
- ✅ Launch Map View
- ✅ Add new node with "+" button
- ✅ Start GPS trace
- ✅ Cache current map region
- ✅ View offline cache status
- ✅ Record power readings
- ✅ Link nodes together
- ✅ Generate daily reports

### 5. **Email Verification Flow** (New Registration)
- ✅ Click "Create New Account"
- ✅ Enter unique email (one per email policy)
- ✅ Request OTP code
- ✅ Enter OTP to verify
- ✅ Complete registration

### 6. **Offline-First Testing**
- ✅ Disable internet
- ✅ Navigate map, add nodes, record data
- ✅ All data queued for sync
- ✅ Enable internet
- ✅ Click "Sync" button
- ✅ Verify data syncs to cloud

---

## 🛠️ Setup Instructions

### Option 1: Using Provided SQL
```bash
# Connect to PostgreSQL database
psql -U postgres -d fibertrace < backend/seed-test-user.sql

# Or manually paste the SQL content into your database client
```

### Option 2: Manual Setup
```sql
-- Create test users manually
INSERT INTO users (full_name, email, password_hash, role, email_verified) VALUES
('Admin User', 'admin@fibertrace.app', 'admin123456', 'admin', true),
('John Technician', 'john@fibertrace.app', 'tech123456', 'technician', true),
('Jane Field Tech', 'jane@fibertrace.app', 'field123456', 'field_technician', true);
```

---

## 🔐 Security Features to Verify

- ✅ Admin-only access to email configuration
- ✅ One-time email use (no duplicate registrations)
- ✅ OTP expiry after 5 minutes
- ✅ Email verification required before using account
- ✅ All offline data encrypted locally
- ✅ Password never sent in plain text

---

## 📱 Device Testing

### Android
- Build APK: `npm run build:apk`
- Install on device
- Test all flows above

### iOS
- Build IPA: `npm run build:ios`
- Deploy to device
- Verify all features work

### Web (Development)
- `npm run web`
- Note: Map features require native capabilities
- All auth and profile features work

---

## 🐛 Known Limitations

- Map visualization shows web fallback on browser
- GPS requires actual device (simulated on web)
- Email sending requires Google App Password configured
- Offline sync requires internet connection when clicking "Sync"

---

## ✅ Test Completion Checklist

- [ ] Successfully logged in with test credentials
- [ ] Profile screen accessible and editable
- [ ] Admin can access email configuration
- [ ] Map loads with test nodes
- [ ] Offline cache working
- [ ] Daily reports generate
- [ ] Motto displays on login screen
- [ ] All screens responsive and professional

---

## 📞 Support

For issues or questions, check the main README.md or contact the development team.

**Ready to deploy!** 🚀
