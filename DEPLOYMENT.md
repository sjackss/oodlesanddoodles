# Oodles & Doodles - Deployment Guide

## ✅ Completed Updates

The following critical improvements have been implemented:

### 1. Database Configuration (`db.js`)
- Added database connection using Neon PostgreSQL
- Exports `sql` function for all API endpoints
- Environment variable: `DATABASE_URL`

### 2. Messaging System Improvements (`api-messages.js`)
- ✅ Fixed message delivery - messages now properly reach recipients
- ✅ Added 14-day automatic history retention (messages older than 14 days are filtered out)
- ✅ Added read receipt tracking
- ✅ Better error handling and validation
- Returns created message with ID on POST

### 3. Message Cleanup Job (`api-cleanup-messages.js`)
- Automated daily cleanup of messages older than 14 days
- Maintains user privacy by auto-deleting old conversations
- Can be scheduled via Netlify

### 4. Stripe Payment System

#### Checkout API (`api-stripe-checkout.js`)
- Weekly plan: $9.99/week with 7-day trial
- Monthly plan: $29.99/month with 7-day trial  
- Lifetime plan: $99.99 one-time payment
- Creates Stripe checkout sessions
- Logs all payment attempts

#### Webhook Handler (`api-stripe-webhook.js`)
- Processes payment events automatically
- Updates user subscription status
- Handles: checkout completion, subscription changes, payment success/failure

---

## 🚀 Deployment Steps

### Step 1: Environment Variables

Add these to your Netlify environment variables:

```
DATABASE_URL=postgresql://your-neon-db-url
STRIPE_SECRET_KEY=sk_live_your_stripe_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
URL=https://oodlesanddoodles.app
```

### Step 2: Database Setup

Create these tables in your Neon PostgreSQL database:

```sql
-- Messages table
CREATE TABLE messages (
  id SERIAL PRIMARY KEY,
  chat_id VARCHAR(255) NOT NULL,
  from_user_id VARCHAR(255) NOT NULL,
  to_user_id VARCHAR(255) NOT NULL,
  text TEXT,
  image_url TEXT,
  audio_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  read_at TIMESTAMP
);

CREATE INDEX idx_messages_chat ON messages(chat_id);
CREATE INDEX idx_messages_created ON messages(created_at);

-- Users table (subscription fields)
ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_status VARCHAR(50) DEFAULT 'free';
ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_id VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();

-- Payment logs table
CREATE TABLE payment_logs (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  plan VARCHAR(50) NOT NULL,
  session_id VARCHAR(255),
  status VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Step 3: Install Dependencies

Add to `package.json`:

```json
{
  "dependencies": {
    "@neondatabase/serverless": "^0.9.0",
    "stripe": "^14.0.0"
  }
}
```

Run: `npm install`

### Step 4: Netlify Configuration

Update `netlify.toml` in the `oodles-app` folder:

```toml
[build]
  functions = "."

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/:splat"
  status = 200

# Schedule message cleanup daily at 3 AM
[[functions]]
  path = "api-cleanup-messages"
  schedule = "0 3 * * *"
```

### Step 5: Stripe Webhook Setup

1. Go to Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://oodlesanddoodles.app/.netlify/functions/api-stripe-webhook`
3. Select events:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
4. Copy webhook signing secret to `STRIPE_WEBHOOK_SECRET` env var

### Step 6: Deploy to Netlify

```bash
# Push to GitHub (triggers auto-deploy)
git add .
git commit -m "Add messaging fixes and payment system"
git push origin main
```

Or deploy manually:
```bash
netlify deploy --prod
```

---

## 📝 Frontend Integration

### Messaging (to be added to chat.html)

```javascript
// Send message
async function sendMessage(chatId, fromUserId, toUserId, text) {
  const response = await fetch('/.netlify/functions/api-messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, from_user_id: fromUserId, to_user_id: toUserId, text })
  });
  return response.json();
}

// Load messages
async function loadMessages(chatId, userId) {
  const response = await fetch(`/.netlify/functions/api-messages?chat_id=${chatId}&user_id=${userId}`);
  return response.json();
}
```

### Payment Integration (subscription page)

```javascript
// Start checkout
async function startCheckout(plan, userId, email) {
  const response = await fetch('/.netlify/functions/api-stripe-checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ plan, userId, email })
  });
  const { url } = await response.json();
  window.location.href = url; // Redirect to Stripe
}
```

---

## 🧪 Testing

### Test Messaging
```bash
# Send message
curl -X POST https://oodlesanddoodles.app/.netlify/functions/api-messages \
  -H "Content-Type: application/json" \
  -d '{"chat_id":"test123","from_user_id":"user1","to_user_id":"user2","text":"Hello!"}'

# Get messages
curl "https://oodlesanddoodles.app/.netlify/functions/api-messages?chat_id=test123&user_id=user2"
```

### Test Stripe (use test keys)
- Card: 4242 4242 4242 4242
- Expiry: Any future date
- CVC: Any 3 digits

---

## 🔧 Troubleshooting

### Messages not delivering
1. Check `DATABASE_URL` is set correctly
2. Verify messages table exists
3. Check Netlify function logs

### Payment not working
1. Verify `STRIPE_SECRET_KEY` is set
2. Check webhook endpoint is configured
3. Test with Stripe test mode first

### Cleanup not running
1. Verify `netlify.toml` schedule is configured
2. Check Netlify scheduled functions are enabled (Pro plan required)

---

## 📊 Next Steps

1. ✅ Backend messaging fixed
2. ✅ Payment system implemented  
3. ⏳ Add frontend JavaScript to chat.html
4. ⏳ Create subscription/payment UI page
5. ⏳ Add payment success page
6. ⏳ Test end-to-end with real users

---

## 💰 Pricing Summary

- **Weekly**: $9.99/week (7-day free trial)
- **Monthly**: $29.99/month (7-day free trial)  
- **Lifetime**: $99.99 (one-time)

All plans include:
- Ad-free experience
- Unlimited messaging
- Advanced filters
- Profile visibility boost

---

**Last Updated**: January 15, 2026
**Status**: Core backend complete, frontend integration pending
