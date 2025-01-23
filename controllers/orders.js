import { connectDB } from '../lib/db.js'; // Import the connectDB function
import { Order } from '../models/order.js';
import { User } from '../models/user.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { NotFoundError, ValidationError } from '../utils/errors.js';
import { generateInvoice } from '../utils/invoice.js';
import mongoose from 'mongoose';

export const getOrders = asyncHandler(async (req, res) => {
  // Ensure database connection is established before proceeding
  await connectDB();

  try {
    const userId = req.user.id; // Adjust based on your auth setup

    // Validate userId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new ValidationError('Invalid user ID');
    }

    console.log('Fetching orders from:', userId);

    // Execute the query
    const orders = await Order.findByUser(userId).exec();

    console.log('Orders query executed:', orders);

    if (!orders || orders.length === 0) {
      console.log('No orders found for user:', userId);
      return res.status(404).json({ status: 'fail', message: 'No orders found for this user' });
    }

    console.log('Orders fetched successfully');

    return res.status(200).json({
      status: 'success',
      data: { orders },
    });
  } catch (error) {
    console.error('Error fetching user orders:', error);
    throw error; // Rethrow the error to be caught by asyncHandler
  }
});

export const getOrder = asyncHandler(async (req, res) => {
  // Ensure database connection is established before proceeding
  await connectDB();

  try {
    const { orderId } = req.query;

    // Validate orderId
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      throw new ValidationError('Invalid order ID');
    }

    const order = await Order.findById(orderId).populate('userId', 'name email');

    if (!order) {
      throw new NotFoundError('Order not found');
    }

    // Check if the user owns the order
    if (order.userId.toString() !== req.user.id) {
      throw new NotFoundError('Forbidden: User does not own this order');
    }

    res.status(200).json({
      status: 'success',
      data: { order }
    });
  } catch (error) {
    console.error('Error fetching order:', error);
    throw new Error('Failed to fetch order');
  }
});

export const deleteOrder = asyncHandler(async (req, res) => {
  // Ensure database connection is established before proceeding
  await connectDB();

  try {
    const { orderId } = req.query;

    // Validate orderId
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      throw new ValidationError('Invalid order ID');
    }

    const order = await Order.findByIdAndDelete(orderId);

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Check if the user owns the order
    if (order.userId.toString() !== req.user.id) {
      throw new NotFoundError('Forbidden: User does not own this order');
    }

    res.status(204).end();
  } catch (error) {
    console.error('Error deleting order:', error);
    throw new Error('Failed to delete order');
  }
});

export const s_createOrder = async (orderData) => {
  const { userId, items, total, shippingAddress, customerEmail, customerPhone } = orderData;

  // Validate input
  if (!items || !total || !shippingAddress || !customerPhone) {
    throw new ValidationError('Invalid order data');
  }

  // Ensure the _id field in the items array is set to an ObjectId
  const itemsWithObjectId = items.map(item => ({
    ...item,
    _id: new mongoose.Types.ObjectId(item._id),
  }));

  try {
    // Validate and convert userId to ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new ValidationError('Invalid userId');
    }

    // Create order in the database
    const order = await Order.create({
      userId: new mongoose.Types.ObjectId(userId), // Convert userId to ObjectId
      items: itemsWithObjectId,
      total,
      shippingAddress,
      customerEmail,
      customerPhone
    });
    console.log('Order created successfully in the database:', order);

    return {
      status: 'success',
      data: { order }
    };
  } catch (error) {
    console.error('Error creating order:', error);
    throw new Error('Order creation failed');
  }
};

export const generateOrderInvoice = asyncHandler(async (req, res) => {
  // Ensure database connection is established before proceeding
  await connectDB();

  try {
    const { orderId } = req.query;
    const { userId } = req.query;
    console.log('Fetching order invoice:', orderId, userId);
    // Validate orderId and userId
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      throw new Error('Invalid order ID');
    }
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new Error('Invalid user ID');
    }

    const order = await Order.findById(orderId);
    if (!order) {
      console.log('Order not found in database');
      throw new Error('Order not found');
    }

    console.log('Order fetched successfully:', order);

    console.log('Fetching user with ID:', userId);
    const user = await User.findById(userId);
    if (!user) {
      console.log('User not found in database');
      throw new Error('User not found');
    }

    console.log('User fetched successfully:', user);

    // Check if the user owns the order
    if (order.userId.toString() !== userId) {
      console.log('User does not own the order');
      throw new Error('Forbidden: User does not own this order');
    }

    const invoice = generateInvoice(order, user);
    console.log('Invoice generated successfully:', invoice);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=invoice-${order._id}.pdf`);

    invoice.pipe(res);
    invoice.end();
  } catch (error) {
    console.error('Error fetching order invoice:', error);
    res.status(500).json({ error: 'Failed to fetch order invoice' });
  }
});