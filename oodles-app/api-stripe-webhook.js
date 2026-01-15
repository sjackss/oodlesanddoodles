// netlify/functions/api-stripe-webhook.js
import Stripe from 'stripe';
import { sql } from './db.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function handler(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method not allowed' };
  }

  const sig = event.headers['stripe-signature'];

  try {
    // Verify webhook signature
    const stripeEvent = stripe.webhooks.constructEvent(
      event.body,
      sig,
      webhookSecret
    );

    // Handle different event types
    switch (stripeEvent.type) {
      case 'checkout.session.completed':
        await handleCheckoutComplete(stripeEvent.data.object);
        break;
      
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
        await handleSubscriptionChange(stripeEvent.data.object);
        break;
      
      case 'invoice.payment_succeeded':
        await handlePaymentSuccess(stripeEvent.data.object);
        break;
      
      case 'invoice.payment_failed':
        await handlePaymentFailure(stripeEvent.data.object);
        break;

      default:
        console.log(`Unhandled event type: ${stripeEvent.type}`);
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ received: true })
    };
  } catch (err) {
    console.error('Webhook error:', err.message);
    return {
      statusCode: 400,
      body: `Webhook Error: ${err.message}`
    };
  }
}

async function handleCheckoutComplete(session) {
  const userId = session.client_reference_id;
  const subscriptionId = session.subscription;
  
  try {
    // Update user subscription status
    await sql`
      UPDATE users
      SET 
        subscription_status = 'active',
        subscription_id = ${subscriptionId || null},
        updated_at = NOW()
      WHERE id = ${userId}
    `;

    // Log successful payment
    await sql`
      UPDATE payment_logs
      SET status = 'completed', updated_at = NOW()
      WHERE session_id = ${session.id}
    `;

    console.log(`Subscription activated for user ${userId}`);
  } catch (error) {
    console.error('Error handling checkout complete:', error);
  }
}

async function handleSubscriptionChange(subscription) {
  try {
    const status = subscription.status; // active, past_due, canceled, etc.
    
    await sql`
      UPDATE users
      SET subscription_status = ${status}, updated_at = NOW()
      WHERE subscription_id = ${subscription.id}
    `;

    console.log(`Subscription ${subscription.id} updated to ${status}`);
  } catch (error) {
    console.error('Error handling subscription change:', error);
  }
}

async function handlePaymentSuccess(invoice) {
  console.log(`Payment succeeded for subscription ${invoice.subscription}`);
}

async function handlePaymentFailure(invoice) {
  try {
    await sql`
      UPDATE users
      SET subscription_status = 'payment_failed', updated_at = NOW()
      WHERE subscription_id = ${invoice.subscription}
    `;

    console.log(`Payment failed for subscription ${invoice.subscription}`);
  } catch (error) {
    console.error('Error handling payment failure:', error);
  }
}
