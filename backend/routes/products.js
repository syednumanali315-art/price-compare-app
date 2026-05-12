const express = require("express");
const router = express.Router();
const {
  ScanCommand,
  PutCommand,
  UpdateCommand,
  DeleteCommand,
  GetCommand,
} = require("@aws-sdk/lib-dynamodb");
const { dynamoDB } = require("../config/dynamodb");
const { SNSClient, PublishCommand } = require("@aws-sdk/client-sns");
const { v4: uuidv4 } = require("uuid");
const logger = require("../config/logger");

const TABLE_NAME = process.env.DYNAMODB_TABLE_NAME || "Products";

const snsClient = new SNSClient({ region: process.env.AWS_REGION || "ap-south-1" });

// ─── GET /api/products/search?q=shoes&platform=amazon ────────
router.get("/search", async (req, res) => {
  const { q, platform, category, sort } = req.query;

  if (!q) {
    return res.status(400).json({ error: "Query parameter 'q' is required" });
  }

  try {
    const searchTerm = q.toLowerCase().trim();

    // DynamoDB full-table scan with filter (for demo — use ElasticSearch in prod)
    const params = {
      TableName: TABLE_NAME,
      FilterExpression:
        "contains(#name, :search) OR contains(#category, :search) OR contains(#brand, :search)",
      ExpressionAttributeNames: {
        "#name": "name",
        "#category": "category",
        "#brand": "brand",
      },
      ExpressionAttributeValues: {
        ":search": searchTerm,
      },
    };

    const data = await dynamoDB.send(new ScanCommand(params));
    let items = data.Items || [];

    // Filter by platform if provided
    if (platform && platform !== "all") {
      items = items.filter((item) => item.platform === platform.toLowerCase());
    }

    // Filter by category if provided
    if (category && category !== "all") {
      items = items.filter((item) => item.category === category.toLowerCase());
    }

    // Sort results
    if (sort === "price_asc") {
      items.sort((a, b) => a.price - b.price);
    } else if (sort === "price_desc") {
      items.sort((a, b) => b.price - a.price);
    } else if (sort === "rating") {
      items.sort((a, b) => b.rating - a.rating);
    } else {
      // Default: lowest price first
      items.sort((a, b) => a.price - b.price);
    }

    // Group by product name for comparison view
    const grouped = {};
    items.forEach((item) => {
      const key = item.name.toLowerCase();
      if (!grouped[key]) {
        grouped[key] = {
          name: item.name,
          category: item.category,
          brand: item.brand,
          imageUrl: item.imageUrl,
          platforms: [],
        };
      }
      grouped[key].platforms.push({
        productId: item.productId,
        platform: item.platform,
        price: item.price,
        originalPrice: item.originalPrice,
        rating: item.rating,
        reviewCount: item.reviewCount,
        delivery: item.delivery,
        productUrl: item.productUrl,
        discount: item.originalPrice
          ? Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)
          : 0,
      });
    });

    // Sort platforms within each group by price
    Object.values(grouped).forEach((g) => {
      g.platforms.sort((a, b) => a.price - b.price);
      g.lowestPrice = g.platforms[0]?.price;
      g.highestPrice = g.platforms[g.platforms.length - 1]?.price;
    });

    logger.info(`Search: "${q}" → ${items.length} results`);

    res.json({
      success: true,
      query: q,
      totalResults: items.length,
      grouped: Object.values(grouped),
      items,
    });
  } catch (err) {
    logger.error("Search error", { error: err.message });
    res.status(500).json({ error: "Search failed", details: err.message });
  }
});

// ─── GET /api/products ────────────────────────────────────────
router.get("/", async (req, res) => {
  try {
    const data = await dynamoDB.send(new ScanCommand({ TableName: TABLE_NAME }));
    res.json({ success: true, count: data.Count, items: data.Items });
  } catch (err) {
    logger.error("Get all products error", { error: err.message });
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

// ─── GET /api/products/:id ────────────────────────────────────
router.get("/:id", async (req, res) => {
  try {
    const data = await dynamoDB.send(
      new GetCommand({ TableName: TABLE_NAME, Key: { productId: req.params.id } })
    );
    if (!data.Item) return res.status(404).json({ error: "Product not found" });
    res.json({ success: true, item: data.Item });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch product" });
  }
});

// ─── POST /api/products ───────────────────────────────────────
router.post("/", async (req, res) => {
  const {
    name, category, platform, price, originalPrice,
    imageUrl, rating, reviewCount, delivery, productUrl, brand,
  } = req.body;

  if (!name || !platform || !price) {
    return res.status(400).json({ error: "name, platform, and price are required" });
  }

  const product = {
    productId: uuidv4(),
    name: name.trim(),
    category: (category || "general").toLowerCase(),
    platform: platform.toLowerCase(),
    price: Number(price),
    originalPrice: originalPrice ? Number(originalPrice) : null,
    imageUrl: imageUrl || "",
    rating: rating ? Number(rating) : 0,
    reviewCount: reviewCount ? Number(reviewCount) : 0,
    delivery: delivery || "Standard delivery",
    productUrl: productUrl || "#",
    brand: brand || "",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  try {
    await dynamoDB.send(new PutCommand({ TableName: TABLE_NAME, Item: product }));
    logger.info(`Product created: ${product.productId} - ${product.name}`);
    res.status(201).json({ success: true, item: product });
  } catch (err) {
    logger.error("Create product error", { error: err.message });
    res.status(500).json({ error: "Failed to create product" });
  }
});

// ─── PUT /api/products/:id ────────────────────────────────────
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  const previousPrice = updates.previousPrice;

  // Build update expression dynamically
  const updateFields = Object.keys(updates).filter(
    (k) => k !== "productId" && k !== "previousPrice"
  );
  if (updateFields.length === 0) {
    return res.status(400).json({ error: "No fields to update" });
  }

  const UpdateExpression =
    "SET " + updateFields.map((k) => `#${k} = :${k}`).join(", ") + ", #updatedAt = :updatedAt";
  const ExpressionAttributeNames = { "#updatedAt": "updatedAt" };
  const ExpressionAttributeValues = { ":updatedAt": new Date().toISOString() };

  updateFields.forEach((k) => {
    ExpressionAttributeNames[`#${k}`] = k;
    ExpressionAttributeValues[`:${k}`] = updates[k];
  });

  try {
    await dynamoDB.send(
      new UpdateCommand({
        TableName: TABLE_NAME,
        Key: { productId: id },
        UpdateExpression,
        ExpressionAttributeNames,
        ExpressionAttributeValues,
      })
    );

    // Send SNS price drop alert if price decreased
    if (
      updates.price &&
      previousPrice &&
      Number(updates.price) < Number(previousPrice) &&
      process.env.SNS_TOPIC_ARN
    ) {
      try {
        await snsClient.send(
          new PublishCommand({
            TopicArn: process.env.SNS_TOPIC_ARN,
            Message: `🔔 Price Drop Alert!\nProduct: ${updates.name || id}\nOld Price: ₹${previousPrice}\nNew Price: ₹${updates.price}\nSavings: ₹${previousPrice - updates.price}`,
            Subject: "PriceCompareHub - Price Drop Alert!",
          })
        );
        logger.info(`SNS price alert sent for product ${id}`);
      } catch (snsErr) {
        logger.warn("SNS alert failed", { error: snsErr.message });
      }
    }

    logger.info(`Product updated: ${id}`);
    res.json({ success: true, message: "Product updated successfully" });
  } catch (err) {
    logger.error("Update product error", { error: err.message });
    res.status(500).json({ error: "Failed to update product" });
  }
});

// ─── DELETE /api/products/:id ─────────────────────────────────
router.delete("/:id", async (req, res) => {
  try {
    await dynamoDB.send(
      new DeleteCommand({ TableName: TABLE_NAME, Key: { productId: req.params.id } })
    );
    logger.info(`Product deleted: ${req.params.id}`);
    res.json({ success: true, message: "Product deleted successfully" });
  } catch (err) {
    logger.error("Delete product error", { error: err.message });
    res.status(500).json({ error: "Failed to delete product" });
  }
});

module.exports = router;
