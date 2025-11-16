# 🧪 Testing Guide - Enhanced Meal Minds Authentication System

## 🚀 Quick Test Instructions

### 1. **Access the Application**
Visit: `http://localhost:5173/`

### 2. **Test Authentication Flow**

#### **Demo Login (Fastest Test)**
- **Email**: `demo@mealmind.com`
- **Password**: `demo123`
- ✅ This bypasses Firebase and creates a mock user session

#### **Create New Account (Full Firebase Test)**
1. Click **"Sign Up"** tab
2. Fill in the form:
   - **Full Name**: Your name
   - **Email**: Your real email (you can verify)
   - **Phone**: Optional
   - **Password**: Minimum 6 characters
   - **Confirm Password**: Must match
3. Click **"Create Account"**
4. ✅ Account created in Firebase Auth + Firestore

#### **Sign In with Existing Account**
1. Click **"Sign In"** tab
2. Enter your email and password
3. Click **"Sign In"**
4. ✅ User authenticated via Firebase

### 3. **Test Complete Order Flow**

#### **Step 1: Order Type**
- Choose: **Dine-in**, **Takeaway**, or **Delivery**
- For dine-in: Enter table number

#### **Step 2: Delivery Address (if delivery selected)**
- Enter delivery address
- Map integration for location

#### **Step 3: Menu & Cart**
- Browse menu categories
- Add items to cart
- See user info and logout button in header
- View cart sidebar

#### **Step 4: Payment**
- Select payment method:
  - **UPI/Card**: Uses Razorpay test mode
  - **Cash**: Direct order placement
- **Razorpay Test Details**:
  - Card: `4111111111111111`
  - Expiry: `12/25`
  - CVV: `123`

#### **Step 5: Receipt**
- View order confirmation
- All data saved to Firebase

## 🔥 Firebase Database Verification

### **Check Your Firebase Console**
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select project: **hiresense-a7146**
3. Navigate to **Firestore Database**

### **Collections Created**:

#### **`users` Collection**
```json
{
  "uid": "firebase_user_id",
  "email": "user@example.com",
  "displayName": "John Doe",
  "phoneNumber": "+1234567890",
  "createdAt": "2025-09-21T...",
  "lastLogin": "2025-09-21T...",
  "preferences": {
    "favoriteItems": [],
    "defaultOrderType": "dine-in",
    "notifications": true
  },
  "stats": {
    "totalOrders": 5,
    "totalSpent": 1250.50,
    "favoriteCategory": "burgers",
    "lastOrderDate": "2025-09-21T..."
  }
}
```

#### **`orders` Collection**
```json
{
  "orderId": "MMA1726934567890",
  "userId": "firebase_user_id",
  "userEmail": "user@example.com",
  "items": [
    {
      "id": 1,
      "name": "Classic Burger",
      "price": 299,
      "quantity": 2,
      "category": "burgers"
    }
  ],
  "orderType": "delivery",
  "deliveryAddress": "123 Main St...",
  "paymentMethod": "upi",
  "subtotal": 598,
  "discount": 50,
  "total": 548,
  "status": "paid",
  "estimatedDeliveryTime": "2025-09-21T...",
  "createdAt": "2025-09-21T..."
}
```

#### **`payments` Collection**
```json
{
  "orderId": "MMA1726934567890",
  "paymentMethod": "upi",
  "amount": 548,
  "status": "completed",
  "paymentId": "razorpay_payment_id",
  "razorpayOrderId": "order_xyz123",
  "signature": "signature_hash",
  "createdAt": "2025-09-21T..."
}
```

#### **`analytics` Collection**
```json
{
  "type": "order_placed",
  "orderId": "MMA1726934567890",
  "userId": "firebase_user_id",
  "amount": 548,
  "paymentMethod": "upi",
  "orderType": "delivery",
  "itemCount": 2,
  "categories": ["burgers"],
  "date": "2025-09-21",
  "hour": 14
}
```

## 🧪 Advanced Testing Scenarios

### **Test 1: Multiple Users**
1. Create 2-3 different user accounts
2. Place orders from each account
3. Verify data separation in Firebase

### **Test 2: Payment Methods**
- **Cash Payment**: Immediate order confirmation
- **UPI Payment**: Razorpay popup → Use test UPI `success@razorpay`
- **Card Payment**: Razorpay popup → Use test card `4111111111111111`

### **Test 3: Order Types**
- **Dine-in**: Table number required
- **Takeaway**: No additional info
- **Delivery**: Address and map required

### **Test 4: User Statistics**
1. Place multiple orders from same account
2. Check Firebase `users` collection
3. Verify `stats` object updates:
   - `totalOrders` increases
   - `totalSpent` accumulates
   - `favoriteCategory` updates based on orders

### **Test 5: Cart Persistence**
1. Add items to cart
2. Refresh page
3. Cart should persist via localStorage

### **Test 6: Authentication Flow**
- **Sign Up** → **Logout** → **Sign In**
- **Forgot Password** (sends real email)
- **Demo Login** vs **Real Firebase Auth**

## 🔍 Error Testing

### **Test Invalid Scenarios**:
1. **Sign Up**:
   - Invalid email format
   - Password too short
   - Passwords don't match
   - Email already exists

2. **Sign In**:
   - Wrong password
   - User doesn't exist
   - Too many attempts

3. **Payment**:
   - No payment method selected
   - Network errors
   - Payment failure simulation

## 📊 Browser Console Logs

**Watch for these logs**:
```
🧪 Razorpay Test Mode Enabled
📝 Test Card: 4111111111111111 | Expiry: 12/25 | CVV: 123
💰 Test UPI: success@razorpay
User created successfully: user_id_here
Order saved with ID: firebase_doc_id
Payment successful and order saved: {...}
User stats updated for: user_id_here
```

## ✅ Success Indicators

**Everything working correctly when you see**:
- ✅ Login/Signup works smoothly
- ✅ User info displayed in menu header
- ✅ Logout button works
- ✅ Orders appear in Firebase console
- ✅ Payments process successfully (test mode)
- ✅ User statistics update automatically
- ✅ Cart persists across page refreshes
- ✅ Proper error messages for invalid inputs

## 🔧 Troubleshooting

**If something doesn't work**:
1. **Check browser console** for errors
2. **Verify Firebase connection** in Network tab
3. **Clear localStorage** and try again
4. **Try demo login** if Firebase auth fails
5. **Check Firebase rules** if database writes fail

---

**Your enhanced food ordering system now has complete authentication and data persistence! 🎉**
