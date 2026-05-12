const { PutCommand } = require("@aws-sdk/lib-dynamodb");
const { dynamoDB } = require("../config/dynamodb");
const { v4: uuidv4 } = require("uuid");
require("dotenv").config();

const TABLE_NAME = process.env.DYNAMODB_TABLE_NAME || "Products";

const sampleProducts = [
  // ─── SHOES ───────────────────────────────────────────────────
  {
    productId: uuidv4(),
    name: "Nike Air Max 270",
    category: "shoes",
    platform: "amazon",
    price: 8995,
    originalPrice: 12995,
    imageUrl:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80",
    rating: 4.5,
    reviewCount: 2341,
    delivery: "Free delivery by Tomorrow",
    productUrl: "https://www.amazon.in/s?k=Nike+Air+Max+270",
    brand: "Nike",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    productId: uuidv4(),
    name: "Nike Air Max 270",
    category: "shoes",
    platform: "flipkart",
    price: 8499,
    originalPrice: 12995,
    imageUrl:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80",
    rating: 4.3,
    reviewCount: 1892,
    delivery: "Free delivery in 2 days",
    productUrl: "https://www.flipkart.com/search?q=Nike+Air+Max+270",
    brand: "Nike",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    productId: uuidv4(),
    name: "Nike Air Max 270",
    category: "shoes",
    platform: "myntra",
    price: 9299,
    originalPrice: 12995,
    imageUrl:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80",
    rating: 4.4,
    reviewCount: 987,
    delivery: "Free delivery in 3-5 days",
    productUrl: "https://www.myntra.com/nike",
    brand: "Nike",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  // ─── LAPTOP ──────────────────────────────────────────────────
  {
    productId: uuidv4(),
    name: "Apple MacBook Air M2",
    category: "laptops",
    platform: "amazon",
    price: 99900,
    originalPrice: 119900,
    imageUrl:
      "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=400&q=80",
    rating: 4.8,
    reviewCount: 5612,
    delivery: "Free delivery by Tomorrow",
    productUrl: "https://www.amazon.in/s?k=MacBook+Air+M2",
    brand: "Apple",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    productId: uuidv4(),
    name: "Apple MacBook Air M2",
    category: "laptops",
    platform: "flipkart",
    price: 97990,
    originalPrice: 119900,
    imageUrl:
      "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=400&q=80",
    rating: 4.7,
    reviewCount: 4231,
    delivery: "Free delivery in 2 days",
    productUrl: "https://www.flipkart.com/search?q=MacBook+Air+M2",
    brand: "Apple",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  // ─── PHONE ───────────────────────────────────────────────────
  {
    productId: uuidv4(),
    name: "Samsung Galaxy S24",
    category: "phones",
    platform: "amazon",
    price: 74999,
    originalPrice: 79999,
    imageUrl:
      "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=400&q=80",
    rating: 4.4,
    reviewCount: 8901,
    delivery: "Free delivery by Tomorrow",
    productUrl: "https://www.amazon.in/s?k=Samsung+Galaxy+S24",
    brand: "Samsung",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    productId: uuidv4(),
    name: "Samsung Galaxy S24",
    category: "phones",
    platform: "flipkart",
    price: 72999,
    originalPrice: 79999,
    imageUrl:
      "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=400&q=80",
    rating: 4.3,
    reviewCount: 7654,
    delivery: "Free delivery in 1 day",
    productUrl: "https://www.flipkart.com/search?q=Samsung+Galaxy+S24",
    brand: "Samsung",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  // ─── T-SHIRT ─────────────────────────────────────────────────
  {
    productId: uuidv4(),
    name: "Adidas Originals T-Shirt",
    category: "clothing",
    platform: "amazon",
    price: 1299,
    originalPrice: 2499,
    imageUrl:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&q=80",
    rating: 4.2,
    reviewCount: 3421,
    delivery: "Free delivery in 3 days",
    productUrl: "https://www.amazon.in/s?k=Adidas+Originals+T-Shirt",
    brand: "Adidas",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    productId: uuidv4(),
    name: "Adidas Originals T-Shirt",
    category: "clothing",
    platform: "flipkart",
    price: 1199,
    originalPrice: 2499,
    imageUrl:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&q=80",
    rating: 4.1,
    reviewCount: 2876,
    delivery: "Free delivery in 2 days",
    productUrl: "https://www.flipkart.com/search?q=Adidas+Originals+T-Shirt",
    brand: "Adidas",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    productId: uuidv4(),
    name: "Adidas Originals T-Shirt",
    category: "clothing",
    platform: "myntra",
    price: 1099,
    originalPrice: 2499,
    imageUrl:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&q=80",
    rating: 4.0,
    reviewCount: 5123,
    delivery: "Free delivery in 3-5 days",
    productUrl: "https://www.myntra.com/adidas",
    brand: "Adidas",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  // ─── HEADPHONES ──────────────────────────────────────────────
  {
    productId: uuidv4(),
    name: "Sony WH-1000XM5 Headphones",
    category: "electronics",
    platform: "amazon",
    price: 24990,
    originalPrice: 34990,
    imageUrl:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=80",
    rating: 4.7,
    reviewCount: 12543,
    delivery: "Free delivery by Tomorrow",
    productUrl: "https://www.amazon.in/s?k=Sony+WH-1000XM5",
    brand: "Sony",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    productId: uuidv4(),
    name: "Sony WH-1000XM5 Headphones",
    category: "electronics",
    platform: "flipkart",
    price: 23990,
    originalPrice: 34990,
    imageUrl:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=80",
    rating: 4.6,
    reviewCount: 9876,
    delivery: "Free delivery in 2 days",
    productUrl: "https://www.flipkart.com/search?q=Sony+WH-1000XM5",
    brand: "Sony",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  // ─── WATCH ───────────────────────────────────────────────────
  {
    productId: uuidv4(),
    name: "Fossil Gen 6 Smartwatch",
    category: "watches",
    platform: "amazon",
    price: 14995,
    originalPrice: 22995,
    imageUrl:
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80",
    rating: 4.1,
    reviewCount: 3201,
    delivery: "Free delivery in 2 days",
    productUrl: "https://www.amazon.in/s?k=Fossil+Gen+6",
    brand: "Fossil",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    productId: uuidv4(),
    name: "Fossil Gen 6 Smartwatch",
    category: "watches",
    platform: "flipkart",
    price: 13999,
    originalPrice: 22995,
    imageUrl:
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80",
    rating: 4.0,
    reviewCount: 2765,
    delivery: "Free delivery in 3 days",
    productUrl: "https://www.flipkart.com/search?q=Fossil+Gen+6",
    brand: "Fossil",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    productId: uuidv4(),
    name: "Fossil Gen 6 Smartwatch",
    category: "watches",
    platform: "myntra",
    price: 14499,
    originalPrice: 22995,
    imageUrl:
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80",
    rating: 4.2,
    reviewCount: 1543,
    delivery: "Free delivery in 4-6 days",
    productUrl: "https://www.myntra.com/fossil",
    brand: "Fossil",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

async function seedData() {
  console.log("🌱 Seeding sample products into DynamoDB...\n");
  let success = 0;
  for (const product of sampleProducts) {
    try {
      await dynamoDB.send(
        new PutCommand({ TableName: TABLE_NAME, Item: product })
      );
      console.log(`  ✅ ${product.platform.toUpperCase()} - ${product.name}`);
      success++;
    } catch (err) {
      console.error(`  ❌ Failed: ${product.name}`, err.message);
    }
  }
  console.log(`\n🎉 Seeded ${success}/${sampleProducts.length} products!`);
}

seedData().catch(console.error);
