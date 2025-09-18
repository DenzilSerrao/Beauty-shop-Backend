import { connectDB } from "../lib/db.js";
import { Order } from "../models/order.js";
import { User } from "../models/user.js";
import { Product } from "../models/product.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { NotFoundError, ValidationError } from "../utils/errors.js";
import { generateInvoice } from "../utils/invoice.js";
import mongoose from "mongoose";
import { logger } from "../utils/logger.js";

export const getOrders = asyncHandler(async (req, res) => {
  await connectDB();

  try {
    const userId = req.user.id;

    // Validate userId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      const error = new ValidationError("Invalid user ID");
      await logger.error(error, req);
      return res.status(400).json({ status: "fail", message: error.message });
    }

    logger.info("Fetching orders for user", { userId });

    const orders = await Order.findByUser(userId).exec();

    if (!orders || orders.length === 0) {
      logger.info("No orders found for user", { userId });
      return res
        .status(404)
        .json({ status: "fail", message: "No orders found for this user" });
    }

    // Extract product names from order items
    const productNames = new Set(
      orders.flatMap((order) => order.items.map((item) => item.name.trim()))
    );

    logger.info("Fetching product details", {
      productNames: Array.from(productNames),
    });

    const products = await Product.find({
      name: { $in: Array.from(productNames) },
    }).exec();

    // Create product map for quick lookup
    const productMap = new Map(
      products.map((product) => [product.name.trim(), product])
    );

    // Attach image1 path to each order item
    const enrichedOrders = orders.map((order) => ({
      ...order.toObject(),
      items: order.items.map((item) => {
        const product = productMap.get(item.name.trim());
        if (!product) {
          logger.warn("Product not found for item", { itemName: item.name });
        }
        return {
          ...item.toObject(),
          image1: product?.image1 || null,
        };
      }),
    }));

    logger.info("Successfully fetched and enriched orders", {
      userId,
      orderCount: enrichedOrders.length,
    });

    return res.status(200).json({
      status: "success",
      data: { orders: enrichedOrders },
    });
  } catch (error) {
    await logger.error(error, req);
    throw error;
  }
});

export const getOrder = asyncHandler(async (orderId, req, res) => {
  await connectDB();

  try {
    logger.info("Fetching order details", { orderId });

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      const error = new ValidationError("Invalid order ID");
      await logger.error(error, req);
      return res.status(400).json({ status: "fail", message: error.message });
    }

    const order = await Order.findById(orderId).populate(
      "userId",
      "name email"
    );

    if (!order) {
      const error = new NotFoundError("Order not found");
      await logger.error(error, req);
      return res.status(404).json({ status: "fail", message: error.message });
    }

    // Check ownership
    if (order.userId.toString() !== req.user.id) {
      const error = new NotFoundError(
        "Forbidden: User does not own this order"
      );
      error.statusCode = 403;
      await logger.error(error, req);
      return res.status(403).json({ status: "fail", message: error.message });
    }

    logger.info("Successfully fetched order", { orderId });

    return res.status(200).json({
      status: "success",
      data: { order },
    });
  } catch (error) {
    await logger.error(error, req);
    throw error;
  }
});

export const deleteOrder = asyncHandler(async (req, res) => {
  await connectDB();

  try {
    const { orderId } = req.params; // Get orderId from URL parameters
    logger.info("Attempting to delete order", { orderId });

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      const error = new ValidationError("Invalid order ID");
      await logger.error(error, req);
      return res.status(400).json({ status: "fail", message: error.message });
    }

    const order = await Order.findByIdAndDelete(orderId);

    if (!order) {
      const error = new NotFoundError("Order not found");
      await logger.error(error, req);
      return res.status(404).json({ status: "fail", message: error.message });
    }

    logger.info("Successfully deleted order", { orderId });

    return res.status(200).json({
      status: "success",
      message: "Order Successfully Deleted",
      success: true,
    });
  } catch (error) {
    await logger.error(error, req);

    return res.status(500).json({
      status: "error",
      message: "Internal server error",
      success: false,
    });
  }
});

export const s_createOrder = async (orderData, req = null) => {
  const {
    userId,
    items,
    total,
    shippingAddress,
    customerEmail,
    customerPhone,
  } = orderData;

  try {
    logger.info("Creating new order", { userId });

    // Validate input
    if (!items || !total || !shippingAddress || !customerPhone) {
      const error = new ValidationError("Invalid order data");
      error.orderData = orderData;
      await logger.error(error, req);
      throw error;
    }

    // Convert items to proper ObjectId format
    const itemsWithObjectId = items.map((item) => ({
      ...item,
      _id: new mongoose.Types.ObjectId(item._id),
    }));

    // Validate userId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      const error = new ValidationError("Invalid userId");
      error.userId = userId;
      await logger.error(error, req);
      throw error;
    }

    const order = await Order.create({
      userId: new mongoose.Types.ObjectId(userId),
      items: itemsWithObjectId,
      total,
      shippingAddress,
      customerEmail,
      customerPhone,
    });

    logger.info("Order created successfully", {
      orderId: order._id,
      userId,
      itemCount: items.length,
      total,
    });

    return {
      status: "success",
      data: { order },
    };
  } catch (error) {
    await logger.error(error, req);
    throw error;
  }
};

export const generateOrderInvoice = asyncHandler(async (req, res) => {
  await connectDB();

  try {
    const { orderId, userId } = req.query;
    logger.info("Generating invoice", { orderId, userId });

    // Validate IDs
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      const error = new ValidationError("Invalid order ID");
      await logger.error(error, req);
      return res.status(400).json({ error: error.message });
    }
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      const error = new ValidationError("Invalid user ID");
      await logger.error(error, req);
      return res.status(400).json({ error: error.message });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      const error = new NotFoundError("Order not found");
      await logger.error(error, req);
      return res.status(404).json({ error: error.message });
    }

    const user = await User.findById(userId);
    if (!user) {
      const error = new NotFoundError("User not found");
      await logger.error(error, req);
      return res.status(404).json({ error: error.message });
    }

    // Check ownership
    if (order.userId.toString() !== userId) {
      const error = new NotFoundError(
        "Forbidden: User does not own this order"
      );
      error.statusCode = 403;
      await logger.error(error, req);
      return res.status(403).json({ error: error.message });
    }

    const invoice = generateInvoice(order, user);
    logger.info("Invoice generated successfully", { orderId, userId });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=invoice-${order._id}.pdf`
    );

    invoice.pipe(res);
    invoice.end();
  } catch (error) {
    await logger.error(error, req);
    return res.status(500).json({ error: "Failed to generate invoice" });
  }
});
