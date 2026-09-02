const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");
const sendMail = require("../utils/sendMail");
const Shop = require("../model/shop");
const { isAuthenticated, isSeller, isAdmin } = require("../middleware/auth");
const { upload } = require("../multer");
const { uploadBuffer, deleteAsset } = require("../config/cloudinary");
const templates = require("../utils/emailTemplates");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const ErrorHandler = require("../utils/ErrorHandler");

const sendShopToken = require("../utils/shopToken");

// create shop
router.post("/create-shop", upload.single("file"), async (req, res, next) => {
  try {
    const { email } = req.body;
    const sellerEmail = await Shop.findOne({ email });

    if (sellerEmail) {
      return next(new ErrorHandler("Shop already exists with this email", 400));
    }

    let avatar;
    if (req.file) {
      const result = await uploadBuffer(req.file.buffer, "vendora/shops");
      avatar = result.secure_url;
    }

    const seller = {
      name: req.body.name,
      email: email,
      password: req.body.password,
      avatar: avatar,
      address: req.body.address,
      phoneNumber: req.body.phoneNumber,
      zipCode: req.body.zipCode,
    };

    const activationToken = createActivationToken(seller);

    const activationUrl = `${process.env.CLIENT_URL}/seller/activation/${activationToken}`;

    // Email is sent in a FAIL-SOFT way: a transient SMTP outage must not block
    // registration. sendMail() retries internally; if it still fails we log it and
    // still return 201 so the seller can be created & the email re-attempted.
    await sendMail({
      email: seller.email,
      subject: "Activate your Vendora Shop",
      html: templates.shopActivation({ name: seller.name, activationUrl }),
      message: `Hello ${seller.name}, please click on the link to activate your shop: ${activationUrl}`,
    });

    res.status(201).json({
      success: true,
      message: `please check your email:- ${seller.email} to activate your shop!`,
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 400));
  }
});

// create activation token
const createActivationToken = (seller) => {
  return jwt.sign(seller, process.env.ACTIVATION_SECRET, {
    expiresIn: "5m",
  });
};

// Sign up as a seller with Google — the email is verified by Google, so the
// shop is created and activated immediately (no activation email needed).
router.post(
  "/google-shop-signup",
  upload.single("file"),
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { credential, name, address, zipCode, phoneNumber } = req.body;
      if (!credential) {
        return next(new ErrorHandler("Google credential is required", 400));
      }
      if (!name || !address || !zipCode || !phoneNumber) {
        return next(
          new ErrorHandler("Please fill in your shop name, address, phone and zip code", 400)
        );
      }

      // verify the Google ID token server-side
      const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
      const ticket = await client.verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      const payload = ticket.getPayload();
      if (!payload || !payload.email) {
        return next(new ErrorHandler("Invalid Google token", 400));
      }

      const existingShop = await Shop.findOne({ email: payload.email });
      if (existingShop) {
        // already a seller — just log them in
        return sendShopToken(existingShop, 200, res);
      }

      let avatar = payload.picture || "";
      if (req.file) {
        const result = await uploadBuffer(req.file.buffer, "vendora/shops");
        avatar = result.secure_url;
      }

      const shop = await Shop.create({
        name,
        email: payload.email, // use the Google-verified email, never the body
        password: jwt.sign({ g: payload.sub }, process.env.JWT_SECRET), // unusable random password
        avatar,
        address,
        phoneNumber,
        zipCode,
      });

      try {
        await sendMail({
          email: shop.email,
          subject: "Welcome to Vendora — your shop is live!",
          html: templates.welcomeSeller ? templates.welcomeSeller({ name: shop.name }) : undefined,
          message: `Welcome to Vendora, ${shop.name}! Your seller account has been created successfully.`,
        });
      } catch (_) {
        // email is best-effort — never block seller onboarding on SMTP
      }

      return sendShopToken(shop, 201, res);
    } catch (error) {
      return next(new ErrorHandler(error.message || "Google seller signup failed", 400));
    }
  })
);

// activate user
router.post(
  "/activation",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { activation_token } = req.body;

      const newSeller = jwt.verify(
        activation_token,
        process.env.ACTIVATION_SECRET
      );

      if (!newSeller) {
        return next(new ErrorHandler("Invalid token", 400));
      }
      const { name, email, password, avatar, zipCode, address, phoneNumber } =
        newSeller;

      let seller = await Shop.findOne({ email });

      if (seller) {
        return next(new ErrorHandler("User already exists", 400));
      }

      seller = await Shop.create({
        name,
        email,
        avatar,
        password,
        zipCode,
        address,
        phoneNumber,
      });

      sendShopToken(seller, 201, res);
    } catch (error) {
      // invalid/expired activation tokens are a client error → 400, not 500
      const isTokenError =
        error.name === "JsonWebTokenError" || error.name === "TokenExpiredError";
      const status = isTokenError ? 400 : 500;
      const message = isTokenError
        ? error.name === "TokenExpiredError"
          ? "Activation link has expired. Please register again."
          : "Invalid activation token."
        : error.message;
      return next(new ErrorHandler(message, status));
    }
  })
);

// login shop
router.post(
  "/login-shop",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return next(new ErrorHandler("Please provide the all fields!", 400));
      }

      const user = await Shop.findOne({ email }).select("+password");

      if (!user) {
        return next(new ErrorHandler("User doesn't exists!", 400));
      }

      const isPasswordValid = await user.comparePassword(password);

      if (!isPasswordValid) {
        return next(
          new ErrorHandler("Please provide the correct information", 400)
        );
      }

      if (user.status === "Suspended") {
        return next(
          new ErrorHandler(
            "Your shop account has been suspended. Please contact support.",
            403
          )
        );
      }

      sendShopToken(user, 201, res);
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// load shop
router.get(
  "/getSeller",
  isSeller,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const seller = await Shop.findById(req.seller._id);

      if (!seller) {
        return next(new ErrorHandler("User doesn't exists", 400));
      }

      res.status(200).json({
        success: true,
        seller,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// log out from shop
router.get(
  "/logout",
  catchAsyncErrors(async (req, res, next) => {
    try {
      res.cookie("seller_token", null, {
        expires: new Date(Date.now()),
        httpOnly: true,
      });
      res.status(201).json({
        success: true,
        message: "Log out successful!",
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// get shop info
router.get(
  "/get-shop-info/:id",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const shop = await Shop.findById(req.params.id);
      res.status(201).json({
        success: true,
        shop,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// update shop profile picture
router.put(
  "/update-shop-avatar",
  isSeller,
  upload.single("image"),
  catchAsyncErrors(async (req, res, next) => {
    try {
      const existsUser = await Shop.findById(req.seller._id);

      // Delete the previous Cloudinary shop avatar (no-ops for legacy/local paths)
      await deleteAsset(existsUser.avatar);

      const result = await uploadBuffer(req.file.buffer, "vendora/shops");

      const seller = await Shop.findByIdAndUpdate(
        req.seller._id,
        { avatar: result.secure_url },
        { new: true }
      );

      res.status(200).json({
        success: true,
        seller,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// update seller info
router.put(
  "/update-seller-info",
  isSeller,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { name, description, address, phoneNumber, zipCode } = req.body;

      const shop = await Shop.findOne(req.seller._id);

      if (!shop) {
        return next(new ErrorHandler("User not found", 400));
      }

      shop.name = name;
      shop.description = description;
      shop.address = address;
      shop.phoneNumber = phoneNumber;
      shop.zipCode = zipCode;

      await shop.save();

      res.status(201).json({
        success: true,
        shop,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// all sellers --- for admin
router.get(
  "/admin-all-sellers",
  isAuthenticated,
  isAdmin("Admin"),
  catchAsyncErrors(async (req, res, next) => {
    try {
      const sellers = await Shop.find().sort({
        createdAt: -1,
      });
      res.status(201).json({
        success: true,
        sellers,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// delete seller ---admin
router.delete(
  "/delete-seller/:id",
  isAuthenticated,
  isAdmin("Admin"),
  catchAsyncErrors(async (req, res, next) => {
    try {
      const seller = await Shop.findById(req.params.id);

      if (!seller) {
        return next(
          new ErrorHandler("Seller is not available with this id", 400)
        );
      }

      await Shop.findByIdAndDelete(req.params.id);

      res.status(201).json({
        success: true,
        message: "Seller deleted successfully!",
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// update seller withdraw methods --- sellers
router.put(
  "/update-payment-methods",
  isSeller,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { withdrawMethod } = req.body;

      const seller = await Shop.findByIdAndUpdate(req.seller._id, {
        withdrawMethod,
      });

      res.status(201).json({
        success: true,
        seller,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// delete seller withdraw merthods --- only seller
router.delete(
  "/delete-withdraw-method/",
  isSeller,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const seller = await Shop.findById(req.seller._id);

      if (!seller) {
        return next(new ErrorHandler("Seller not found with this id", 400));
      }

      seller.withdrawMethod = null;

      await seller.save();

      res.status(201).json({
        success: true,
        seller,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

module.exports = router;
