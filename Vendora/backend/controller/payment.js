const express = require("express");
const router = express.Router();
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const ErrorHandler = require("../utils/ErrorHandler");
const { isAuthenticated } = require("../middleware/auth");
const Product = require("../model/product");
const Shop = require("../model/shop");
const CouponCode = require("../model/coupounCode");
const Order = require("../model/order");
const sendMail = require("../utils/sendMail");
const templates = require("../utils/emailTemplates");

// Publishable key is safe to expose to the frontend — the secret key never leaves the backend.
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const stripeCurrency = (process.env.STRIPE_CURRENCY || "usd").toLowerCase();
const stripe = stripeSecretKey ? require("stripe")(stripeSecretKey) : null;

function requireStripe(next) {
  if (!stripe) {
    next(new ErrorHandler("Stripe is not configured on the server (STRIPE_SECRET_KEY missing)", 503));
    return false;
  }
  return true;
}

/**
 * Recompute the order amount on the backend.
 * NEVER trusts prices coming from the frontend: product prices are read from the
 * database, and the coupon discount is validated against the CouponCode collection.
 */
async function computeAmount(cartItems, couponCode) {
  let subtotal = 0;
  const resolvedItems = [];

  for (const item of cartItems) {
    const product = await Product.findById(item.productId);
    if (!product) {
      throw new ErrorHandler(`Product not found: ${item.productId}`, 400);
    }
    const qty = Math.max(1, parseInt(item.qty, 10) || 1);
    if (product.stock < qty) {
      throw new ErrorHandler(`Insufficient stock for ${product.name}`, 400);
    }
    subtotal += product.discountPrice * qty;
    resolvedItems.push({ productId: product._id, qty, price: product.discountPrice });
  }

  const shipping = subtotal * 0.1; // matches frontend shipping rule (10%)

  let discount = 0;
  if (couponCode) {
    const coupon = await CouponCode.findOne({ name: couponCode });
    if (coupon) {
      // coupons are tied to one shop: sum eligible items of that shop
      const shopProducts = await Product.find({ shopId: coupon.shopId }).distinct("_id");
      const eligibleSum = resolvedItems
        .filter((i) => shopProducts.some((id) => String(id) === String(i.productId)))
        .reduce((acc, i) => acc + i.qty * i.price, 0);
      discount = (eligibleSum * coupon.value) / 100;
    }
  }

  const total = Math.max(0, subtotal + shipping - discount);
  return { subtotal, shipping, discount, total, resolvedItems };
}

// create a Stripe PaymentIntent — amount is calculated on the backend
router.post(
  "/create-payment-intent",
  isAuthenticated,
  catchAsyncErrors(async (req, res, next) => {
    if (!requireStripe(next)) return;
    try {
      const { cart, couponCode } = req.body;
      if (!Array.isArray(cart) || cart.length === 0) {
        return next(new ErrorHandler("Cart is empty", 400));
      }

      const { total, resolvedItems } = await computeAmount(cart, couponCode);
      const amount = Math.round(total * 100); // smallest currency unit

      const paymentIntent = await stripe.paymentIntents.create(
        {
          amount,
          currency: stripeCurrency,
          automatic_payment_methods: { enabled: true },
          metadata: {
            company: "Vendora",
            userId: String(req.user._id),
            items: JSON.stringify(resolvedItems.map((i) => ({ p: String(i.productId), q: i.qty }))),
          },
        },
        { idempotencyKey: req.headers["x-idempotency-key"] || undefined }
      );

      res.status(200).json({
        success: true,
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        amount,
        currency: stripeCurrency,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 400));
    }
  })
);

// create orders after a verified payment (or Cash On Delivery)
router.post(
  "/create-order",
  isAuthenticated,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { paymentIntentId, shippingAddress, cart, couponCode, paymentMethod } = req.body;

      let paymentInfo;
      let totalPrice;
      let resolvedCart;

      if (paymentMethod === "COD") {
        if (!Array.isArray(cart) || cart.length === 0) {
          return next(new ErrorHandler("Cart is empty", 400));
        }
        const { total } = await computeAmount(cart, couponCode);
        totalPrice = total;
        paymentInfo = { type: "Cash On Delivery", status: "Not Paid" };
        resolvedCart = cart;
      } else {
        // Stripe flow — verify the payment server-side before creating any order
        if (!requireStripe(next)) return;
        if (!paymentIntentId) {
          return next(new ErrorHandler("paymentIntentId is required", 400));
        }

        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

        if (paymentIntent.status !== "succeeded") {
          return next(new ErrorHandler(`Payment not completed (status: ${paymentIntent.status})`, 402));
        }
        if (String(paymentIntent.metadata.userId) !== String(req.user._id)) {
          return next(new ErrorHandler("Payment does not belong to this user", 403));
        }

        // Prevent duplicate order creation for the same payment
        const existing = await Order.findOne({ "paymentInfo.id": paymentIntent.id });
        if (existing) {
          return res.status(200).json({
            success: true,
            orders: [existing],
            message: "Order already exists for this payment",
          });
        }

        // Recompute the expected amount and compare against the verified payment
        const metaItems = JSON.parse(paymentIntent.metadata.items || "[]");
        const { total } = await computeAmount(
          metaItems.map((i) => ({ productId: i.p, qty: i.q })),
          couponCode
        );
        const expected = Math.round(total * 100);
        if (paymentIntent.amount !== expected) {
          return next(new ErrorHandler("Payment amount mismatch — order rejected", 400));
        }

        totalPrice = total;
        paymentInfo = { id: paymentIntent.id, status: "Succeeded", type: "Stripe" };
        resolvedCart = metaItems.map((i) => ({ _id: i.p, qty: i.q }));
      }

      // Resolve full product data from the DB (never trust the frontend cart payload)
      const resolved = [];
      for (const item of resolvedCart) {
        const product = await Product.findById(item._id || item.productId);
        if (!product) {
          return next(new ErrorHandler(`Product not found: ${item._id || item.productId}`, 400));
        }
        resolved.push({
          _id: product._id,
          name: product.name,
          images: product.images,
          discountPrice: product.discountPrice,
          qty: item.qty,
          shopId: product.shopId,
          isReviewed: false,
        });
      }

      // group cart items by shopId (multi-vendor: one order per shop)
      const shopItemsMap = new Map();
      for (const item of resolved) {
        if (!shopItemsMap.has(item.shopId)) {
          shopItemsMap.set(item.shopId, []);
        }
        shopItemsMap.get(item.shopId).push(item);
      }

      const buyer = {
        _id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        phoneNumber: req.user.phoneNumber,
        avatar: req.user.avatar,
      };

      const orders = [];
      for (const [shopId, items] of shopItemsMap) {
        const order = await Order.create({
          cart: items,
          shippingAddress,
          user: buyer,
          totalPrice,
          paymentInfo,
          paidAt: paymentMethod === "COD" ? undefined : Date.now(),
        });
        orders.push(order);

        // Order confirmation email to the buyer + notification to the seller (non-blocking)
        const shop = await Shop.findById(shopId).catch(() => null);
        (async () => {
          try {
            if (req.user.email) {
              await sendMail({
                email: req.user.email,
                subject: `Vendora — Order confirmed (#${order._id})`,
                html: templates.orderConfirmation({
                  user: buyer,
                  orderId: order._id,
                  items: items.map((i) => ({ name: i.name, qty: i.qty, price: i.discountPrice })),
                  totalPrice,
                }),
              });
            }
            if (shop?.email) {
              await sendMail({
                email: shop.email,
                subject: "Vendora — New order received",
                html: templates.sellerNewOrder({
                  shopName: shop.name,
                  items: items.map((i) => ({ name: i.name, qty: i.qty, price: i.discountPrice })),
                  totalPrice,
                }),
              });
            }
          } catch (mailErr) {
            console.error("Order email failed:", mailErr.message);
          }
        })();
      }

      res.status(201).json({ success: true, orders });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// Stripe webhook — the source of truth for payment status updates.
// Mounted with express.raw() in server.js BEFORE express.json() so the signature verifies.
router.post(
  "/webhook",
  catchAsyncErrors(async (req, res) => {
    if (!stripe || !process.env.STRIPE_WEBHOOK_SECRET) {
      return res.status(503).send("Stripe webhook is not configured");
    }

    const signature = req.headers["stripe-signature"];
    let event;
    try {
      event = stripe.webhooks.constructEvent(req.body, signature, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
      console.error("Webhook signature verification failed:", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    switch (event.type) {
      case "payment_intent.succeeded": {
        const pi = event.data.object;
        await Order.updateMany(
          { "paymentInfo.id": pi.id },
          { $set: { "paymentInfo.status": "Succeeded", paidAt: new Date() } }
        );
        break;
      }
      case "payment_intent.payment_failed": {
        const pi = event.data.object;
        await Order.updateMany(
          { "paymentInfo.id": pi.id },
          { $set: { "paymentInfo.status": "Failed" } }
        );
        break;
      }
      case "charge.refunded": {
        const charge = event.data.object;
        await Order.updateMany(
          { "paymentInfo.id": charge.payment_intent },
          { $set: { "paymentInfo.status": "Refunded" } }
        );
        break;
      }
      default:
        break;
    }

    res.status(200).json({ received: true });
  })
);

// only the publishable key is exposed to the frontend
router.get(
  "/stripeapikey",
  catchAsyncErrors(async (req, res) => {
    res.status(200).json({ stripeApikey: process.env.STRIPE_PUBLISHABLE_KEY || "" });
  })
);

module.exports = router;
