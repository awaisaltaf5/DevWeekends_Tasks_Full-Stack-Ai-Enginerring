/**
 * Vendora — mock seller shops used by the seed system.
 * Schema-compatible with backend/model/shop.js.
 * Passwords are hashed by the model's pre-save hook.
 */
const FALLBACK_AVATAR = "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=400&fit=crop";

module.exports = [
  { name: "TechNova Electronics", email: "technova@vendora.test", description: "Laptops, monitors and pro computing gear from trusted brands.", category: "Computers and Laptops", address: "12 Innovation Drive, Austin", phoneNumber: 15120001, zipCode: 73301 },
  { name: "GlowLuxe Beauty", email: "glowluxe@vendora.test", description: "Skincare, cosmetics and body care essentials for everyday radiance.", category: "Cosmetics and Body Care", address: "88 Blossom Ave, Los Angeles", phoneNumber: 15120002, zipCode: 90001 },
  { name: "UrbanGear Accessories", email: "urbangear@vendora.test", description: "Watches, bags, wallets and everyday carry done right.", category: "Accessories", address: "5 Market Street, Chicago", phoneNumber: 15120003, zipCode: 60601 },
  { name: "VogueThread Apparel", email: "voguethread@vendora.test", description: "Modern fashion for men and women — casual to formal.", category: "Clothes and Fashion", address: "42 Runway Rd, New York", phoneNumber: 15120004, zipCode: 10001 },
  { name: "StrideFootwear", email: "stride@vendora.test", description: "Running, casual and formal footwear for every stride.", category: "Shoes", address: "7 Sprint Lane, Portland", phoneNumber: 15120005, zipCode: 97201 },
  { name: "JoyCraft Gifts", email: "joycraft@vendora.test", description: "Thoughtful gifts, decor and keepsakes for every occasion.", category: "Gifts", address: "19 Celebration Ct, Denver", phoneNumber: 15120006, zipCode: 80014 },
  { name: "PawPerfect Pet Care", email: "pawperfect@vendora.test", description: "Everything happy pets need — food, toys, beds and grooming.", category: "Pet Care", address: "3 Wagging Tail Way, Seattle", phoneNumber: 15120007, zipCode: 98101 },
  { name: "MobileHub Store", email: "mobilehub@vendora.test", description: "Smartphones, tablets and the accessories that power them.", category: "Mobile and Tablets", address: "256 Signal Blvd, Miami", phoneNumber: 15120008, zipCode: 33101 },
  { name: "GameZone Central", email: "gamezone@vendora.test", description: "Gaming gear, audio and streaming equipment for players.", category: "Music and Gaming", address: "77 Pixel Plaza, Dallas", phoneNumber: 15120009, zipCode: 75201 },
  { name: "HomeEssence Living", email: "homeessence@vendora.test", description: "Home, kitchen, office and travel essentials for daily life.", category: "Others", address: "64 Hearthstone Way, Phoenix", phoneNumber: 15120010, zipCode: 85001 },
].map((s) => ({ ...s, password: "vendora123", avatar: FALLBACK_AVATAR }));
