// netlify/functions/api-stripe-checkout.js
import Stripe from 'stripe';
import { sql } from './db.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Define subscription plans
const PLANS = {
  weekly: {
    name: 'Weekly Plan',
    amount: 999, // $9.99 in cents
    interval: 'week',
    trial_days: 7
  },
  monthly: {
    name: 'Monthly Plan',
    amount: 2999, // $29.99
    interval: 'month',
    trial_days: 7
  },
  lifetime: {
    name: 'Lifetime Access',
    amount: 9999, // $99.99
    interval: 'one_time'
  }
};

export async function handler(event) {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { plan, userId, email } = JSON.parse(event.body);

    if (!PLANS[plan]) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Invalid plan selected' })
      };
    }

    const planDetails = PLANS[plan];
    const successUrl = `${process.env.URL || 'https://oodlesanddoodles.app'}/payment-success?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${process.env.URL || 'https://oodlesanddoodles.app'}/subscription`;

    // Create Stripe checkout session
    let sessionConfig;

    if (planDetails.interval === 'one_time') {
      // One-time payment for lifetime access
      sessionConfig = {
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: planDetails.name,
                description: 'Lifetime access to Oodles & Doodles premium features'
              },
              unit_amount: planDetails.amount
            },
            quantity: 1
          }
        ],
        mode: 'payment',
        success_url: successUrl,
        cancel_url: cancelUrl,
        client_reference_id: userId,
        customer_email: email
      };
    } else {
      // Recurring subscription
      sessionConfig = {
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: planDetails.name,
                description: `${planDetails.interval}ly subscription to Oodles & Doodles`
              },
              unit_amount: planDetails.amount,
              recurring: {
                interval: planDetails.interval
              }
            },
            quantity: 1
          }
        ],
        mode: 'subscription',
        subscription_data: {
          trial_period_days: planDetails.trial_days
        },
        success_url: successUrl,
        cancel_url: cancelUrl,
        client_reference_id: userId,
        customer_email: email
      };
    }

    const session = await stripe.checkout.sessions.create(sessionConfig);

    // Log the checkout attempt
    await sql`
      INSERT INTO payment_logs (user_id, plan, session_id, status, created_at)
      VALUES (${userId}, ${plan}, ${session.id}, 'pending', NOW())
    `;

    return {
      statusCode: 200,
      body: JSON.stringify({
        sessionId: session.id,
        url: session.url
      })
    };
  } catch (error) {
    console.error('Stripe checkout error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Failed to create checkout session',
        message: error.message
      })
    };
  }
}
