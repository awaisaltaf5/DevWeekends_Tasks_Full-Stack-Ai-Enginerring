require('dotenv').config({ path: 'config/.env' });
const m = require('mongoose');
const P = require('../model/product');
(async () => {
  await m.connect(process.env.MONGODB_URI);
  const byShop = await P.aggregate([{ $group: { _id: '$shopId', n: { $sum: 1 } } }]);
  console.log('products per shop:', byShop.map(s => s.n).sort((a, b) => a - b).join(','));
  const noImg = await P.countDocuments({ $or: [{ images: { $exists: false } }, { images: { $size: 0 } }] });
  console.log('products without images:', noImg);
  const dupImgs = await P.aggregate([{ $unwind: '$images' }, { $group: { _id: '$images', c: { $sum: 1 } } }, { $match: { c: { $gt: 1 } } }]);
  console.log('duplicate images:', dupImgs.length);
  await m.disconnect();
})().catch(e => { console.error(e.message); process.exit(1); });
