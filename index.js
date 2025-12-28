const functions = require("firebase-functions");
const stripe = require("stripe")(
  process.env.STRIPE_SECRET_KEY
);

exports.createCheckoutSession = functions.https.onRequest(
  async (req, res) => {
    try {
      const { uid } = req.body;

      if (!uid) {
        return res.status(400).json({ error: "Missing UID" });
      }

      const session = await stripe.checkout.sessions.create({
        mode: "subscription",
        payment_method_types: ["card"],
        customer_email: `${uid}@oodles.user`,
        line_items: [
          {
            price: "REPLACE_THIS_WITH_YOUR_STRIPE_PRICE_ID",
            quantity: 1
          }
        ],
        success_url: "https://oodlesanddoodles.app/app.html",
        cancel_url: "https://oodlesanddoodles.app/app.html"
      });

      res.json({ url: session.url });

    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Stripe error" });
    }
  }
);
