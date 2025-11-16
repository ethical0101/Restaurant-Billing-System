# 🔐 Authentication Flow Test Guide

## ✅ Testing Login/Signup Functionality

### **1. Default Behavior Test**
When you visit `http://localhost:5173/`:

**Expected**: App should automatically show the **Login Page**
- ✅ Login/Sign up form is visible
- ✅ App does NOT bypass authentication
- ✅ Cannot access other pages without logging in

### **2. Sign Up Test**
1. Click **"Sign Up"** tab
2. Fill in the form:
   - **Name**: Your name
   - **Email**: test@example.com
   - **Phone**: +1234567890 (optional)
   - **Password**: test123
   - **Confirm Password**: test123
3. Click **"Create Account"**

**Expected Results**:
- ✅ Account created in Firebase
- ✅ User automatically logged in
- ✅ **Automatically redirected to Order Type page**
- ✅ User info visible in menu header

### **3. Sign In Test**
1. Click **"Sign In"** tab
2. Use existing credentials or demo login:
   - **Email**: demo@mealmind.com
   - **Password**: demo123
3. Click **"Sign In"**

**Expected Results**:
- ✅ User authenticated
- ✅ **Automatically redirected to Order Type page**
- ✅ No manual navigation needed

### **4. Authentication Guard Test**
Try to manually navigate to protected pages when not logged in:

**Test URLs** (try these in browser):
- `http://localhost:5173/` → Should show Login
- If logged out, typing any URL should redirect to Login

### **5. Logout Test**
1. Log in successfully
2. Navigate to Menu page
3. Click **logout button** (next to user name in header)

**Expected Results**:
- ✅ User logged out
- ✅ **Automatically redirected to Login page**
- ✅ Cart cleared
- ✅ Cannot access protected pages

### **6. Auto-Navigation Test**
1. Log in successfully
2. Manually go to login page by typing URL
3. **Expected**: Should automatically redirect to Order Type (you can't stay on login when logged in)

### **7. Session Persistence Test**
1. Log in successfully
2. Refresh the page (F5)
3. **Expected**: Should remain logged in and show Order Type page

---

## 🔍 **What Should Work Now**:

### ✅ **Authentication Flow**:
- Login page is the default entry point
- Sign up creates account + auto-login + redirect
- Sign in authenticates + redirect
- Logout redirects back to login
- Authentication guards protect all pages

### ✅ **Navigation Logic**:
- Logged out users: **Always see Login page**
- Logged in users: **Cannot access Login page** (auto-redirect)
- Protected pages require authentication
- Smooth navigation between authenticated states

### ✅ **Session Management**:
- Login state persists across page refreshes
- Firebase auth state automatically managed
- User profile loaded on login
- Clean logout with state reset

---

## 🚨 **Troubleshooting**

If authentication isn't working:

1. **Check browser console** for errors
2. **Clear localStorage**: `localStorage.clear()`
3. **Hard refresh**: Ctrl+F5
4. **Try demo login** first: `demo@mealmind.com` / `demo123`
5. **Check Firebase connection** in Network tab

---

## 🧪 **Quick Test Scenario**

**Complete Flow Test**:
1. Visit app → **Login page shows**
2. Sign up new account → **Auto-redirect to Order Type**
3. Navigate through app → **All pages accessible**
4. Click logout → **Back to Login page**
5. Try accessing menu directly → **Redirected to Login**
6. Sign in again → **Auto-redirect to Order Type**

**This confirms the authentication flow is working perfectly! 🎉**
