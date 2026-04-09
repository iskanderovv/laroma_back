const mongoose = require('mongoose');

async function run() {
  await mongoose.connect('mongodb://localhost:27017/laroma');
  console.log('Connected to MongoDB');

  const Order = mongoose.model('Order', new mongoose.Schema({}, { strict: false }));
  const Product = mongoose.model('Product', new mongoose.Schema({}, { strict: false }));
  const Category = mongoose.model('Category', new mongoose.Schema({}, { strict: false }));

  try {
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29);
    thirtyDaysAgo.setHours(0, 0, 0, 0);

    const salesRaw = await Order.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo, $lte: today }, status: { $ne: 'cancelled' } } },
      { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, revenue: { $sum: "$totalPrice" }, orders: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);
    console.log('Sales Raw:', salesRaw);

    const categoryDataRaw = await Product.aggregate([
      { $group: { _id: "$categoryId", count: { $sum: 1 } } },
      { 
        $lookup: {
          from: "categories",
          localField: "_id",
          foreignField: "_id",
          as: "categoryDetails"
        }
      },
      { $unwind: { path: "$categoryDetails", preserveNullAndEmptyArrays: true } }
    ]);
    console.log('Category Data Raw:', categoryDataRaw);

  } catch (err) {
    console.error('Error:', err);
  } finally {
    mongoose.connection.close();
  }
}

run();
