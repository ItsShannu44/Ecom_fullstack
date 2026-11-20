const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ecom';

const SAMPLE_PRODUCTS = [
  {
    name: 'Wireless Noise-Canceling Headphones',
    description: 'Immersive sound with 30-hour battery life and ultra-comfortable ear cushions.',
    price: 2999,
    category: 'Electronics',
    stock: 15,
    emoji: '🎧',
  },
  {
    name: 'RGB Mechanical Gaming Keyboard',
    description: 'Customizable RGB backlighting with clicky mechanical blue switches.',
    price: 3499,
    category: 'Electronics',
    stock: 8,
    emoji: '⌨️',
  },
  {
    name: 'Ergonomic Wireless Mouse',
    description: 'High precision 4000 DPI sensor with silent click buttons and ergonomic grip.',
    price: 999,
    category: 'Electronics',
    stock: 25,
    emoji: '🖱️',
  },
  {
    name: 'Smart Fitness Tracker Watch',
    description: 'Track your heart rate, sleep quality, daily steps, and workout sessions.',
    price: 4299,
    category: 'Electronics',
    stock: 12,
    emoji: '⌚',
  },
  {
    name: '27-inch 4K UHD Monitor',
    description: 'Crisp IPS display with 99% sRGB color gamut and USB-C connectivity.',
    price: 18500,
    category: 'Electronics',
    stock: 5,
    emoji: '🖥️',
  },
  {
    name: 'Waterproof Laptop Backpack',
    description: 'Durable water-resistant polyester with padded 15.6 inch laptop compartment.',
    price: 1499,
    category: 'Accessories',
    stock: 20,
    emoji: '🎒',
  },
  {
    name: 'Adjustable Aluminum Laptop Stand',
    description: 'Foldable ergonomic riser to elevate your screen and improve posture.',
    price: 899,
    category: 'Accessories',
    stock: 30,
    emoji: '💻',
  },
  {
    name: 'Fast Qi Wireless Charging Pad',
    description: '15W rapid charging compatible with iPhone, Samsung, and AirPods.',
    price: 799,
    category: 'Accessories',
    stock: 18,
    emoji: '🔋',
  },
  {
    name: 'Premium Cotton Crewneck T-Shirt',
    description: '100% breathable organic cotton with durable stitching and soft feel.',
    price: 599,
    category: 'Apparel',
    stock: 35,
    emoji: '👕',
  },
  {
    name: 'Lightweight Running Shoes',
    description: 'Cushioned foam midsole for all-day comfort during sports and walking.',
    price: 2199,
    category: 'Apparel',
    stock: 10,
    emoji: '👟',
  },
];

async function seed() {
  console.log('Connecting to MongoDB at:', MONGODB_URI);
  await mongoose.connect(MONGODB_URI);
  console.log('Connected!');

  const Product =
    mongoose.models.Product ||
    mongoose.model(
      'Product',
      new mongoose.Schema(
        {
          name: String,
          description: String,
          price: Number,
          category: String,
          stock: Number,
          emoji: String,
        },
        { timestamps: true }
      )
    );

  const User =
    mongoose.models.User ||
    mongoose.model(
      'User',
      new mongoose.Schema(
        {
          name: String,
          email: { type: String, unique: true },
          password: String,
          role: String,
        },
        { timestamps: true }
      )
    );

  // Check products
  const productCount = await Product.countDocuments();
  if (productCount === 0) {
    await Product.insertMany(SAMPLE_PRODUCTS);
    console.log(`✅ Seeded ${SAMPLE_PRODUCTS.length} sample products.`);
  } else {
    console.log(`ℹ️ Catalog already has ${productCount} products.`);
  }

  // Seed Admin
  const adminEmail = 'admin@store.com';
  let admin = await User.findOne({ email: adminEmail });
  if (!admin) {
    const hashed = await bcrypt.hash('admin123', 10);
    await User.create({
      name: 'Demo Admin',
      email: adminEmail,
      password: hashed,
      role: 'admin',
    });
    console.log('✅ Created Demo Admin (admin@store.com / admin123)');
  } else {
    console.log('ℹ️ Demo Admin exists (admin@store.com / admin123)');
  }

  // Seed User
  const userEmail = 'user@store.com';
  let customer = await User.findOne({ email: userEmail });
  if (!customer) {
    const hashed = await bcrypt.hash('user123', 10);
    await User.create({
      name: 'Student Customer',
      email: userEmail,
      password: hashed,
      role: 'user',
    });
    console.log('✅ Created Demo Customer (user@store.com / user123)');
  } else {
    console.log('ℹ️ Demo Customer exists (user@store.com / user123)');
  }

  console.log('\n🎉 Seeding complete! Database is ready.');
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('Seeding error:', err);
  process.exit(1);
});
