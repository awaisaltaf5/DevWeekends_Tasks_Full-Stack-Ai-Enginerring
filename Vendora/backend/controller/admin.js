const express = require("express");
const router = express.Router();
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const ErrorHandler = require("../utils/ErrorHandler");
const { isAuthenticated, isAdmin } = require("../middleware/auth");
const User = require("../model/user");
const Shop = require("../model/shop");
const Product = require("../model/product");
const Event = require("../model/event");
const Order = require("../model/order");
const Withdraw = require("../model/withdraw");
const { deleteAsset } = require("../config/cloudinary");

// Middleware applied once for every route in this controller: admin-only APIs.
router.use(isAuthenticated, isAdmin("Admin"));

// GET /api/v2/admin/stats — dashboard statistics + platform earnings
router.get(
  "/stats",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const [
        totalUsers,
        totalSellers,
        activeSellers,
        suspendedSellers,
        totalProducts,
        totalEvents,
        totalOrders,
        paidAgg,
        pendingWithdrawsAgg,
      ] = await Promise.all([
        User.countDocuments(),
        Shop.countDocuments(),
        Shop.countDocuments({ status: { $ne: "Suspended" } }),
        Shop.countDocuments({ status: "Suspended" }),
        Product.countDocuments(),
        Event.countDocuments(),
        Order.countDocuments(),
        Order.aggregate([
          { $match: { "paymentInfo.status": "Succeeded" } },
          { $group: { _id: null, total: { $sum: "$totalPrice" }, count: { $sum: 1 } } },
        ]),
        Withdraw.aggregate([
          { $match: { status: { $ne: "succeed" } } },
          { $group: { _id: null, total: { $sum: "$amount" }, count: { $sum: 1 } } },
        ]),
      ]);

      const totalSales = paidAgg[0]?.total || 0;
      const paidOrders = paidAgg[0]?.count || 0;

      res.status(200).json({
        success: true,
        stats: {
          totalUsers,
          totalSellers,
          activeSellers,
          suspendedSellers,
          totalProducts,
          totalEvents,
          totalOrders,
          paidOrders,
          totalSales,
          // platform commission: 10% of verified paid sales (server-authoritative)
          platformEarnings: totalSales * 0.1,
          sellerEarnings: totalSales * 0.9,
          pendingWithdrawals: pendingWithdrawsAgg[0]?.count || 0,
          pendingWithdrawalsAmount: pendingWithdrawsAgg[0]?.total || 0,
        },
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// GET /api/v2/admin/activity — recent platform activity feed
router.get(
  "/activity",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const [users, shops, products, orders, withdraws] = await Promise.all([
        User.find().sort({ createdAt: -1 }).limit(5).select("name email role createdAt avatar"),
        Shop.find().sort({ createdAt: -1 }).limit(5).select("name email status createdAt avatar"),
        Product.find().sort({ createdAt: -1 }).limit(5).select("name discountPrice shopId createdAt images"),
        Order.find().sort({ createdAt: -1 }).limit(5).select("totalPrice status paymentInfo.status createdAt"),
        Withdraw.find().sort({ createdAt: -1 }).limit(5).select("amount status createdAt"),
      ]);
      res.status(200).json({ success: true, activity: { users, shops, products, orders, withdraws } });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// PUT /api/v2/admin/update-seller-status/:id — suspend / activate a seller account
router.put(
  "/update-seller-status/:id",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { status } = req.body;
      if (!["Active", "Suspended"].includes(status)) {
        return next(new ErrorHandler("Status must be Active or Suspended", 400));
      }
      const seller = await Shop.findByIdAndUpdate(
        req.params.id,
        { status },
        { new: true }
      ).select("-password");
      if (!seller) {
        return next(new ErrorHandler("Seller not found with this id", 400));
      }
      res.status(200).json({ success: true, seller });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// DELETE /api/v2/admin/delete-product/:id — moderation: remove product + its Cloudinary images
router.delete(
  "/delete-product/:id",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const product = await Product.findById(req.params.id);
      if (!product) {
        return next(new ErrorHandler("Product not found with this id", 400));
      }
      for (const imageUrl of product.images || []) {
        await deleteAsset(imageUrl).catch(() => {});
      }
      await Product.findByIdAndDelete(req.params.id);
      res.status(200).json({ success: true, message: "Product deleted successfully!" });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// DELETE /api/v2/admin/delete-event/:id — moderation: remove event + its Cloudinary images
router.delete(
  "/delete-event/:id",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const event = await Event.findById(req.params.id);
      if (!event) {
        return next(new ErrorHandler("Event not found with this id", 400));
      }
      for (const imageUrl of event.images || []) {
        await deleteAsset(imageUrl).catch(() => {});
      }
      await Event.findByIdAndDelete(req.params.id);
      res.status(200).json({ success: true, message: "Event deleted successfully!" });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

module.exports = router;
