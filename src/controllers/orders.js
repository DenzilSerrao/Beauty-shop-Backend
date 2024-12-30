import { Order } from '../models/order.js';
import { User } from '../models/user.js';
import { generateInvoice } from '../utils/invoice.js';
import { NotFoundError, ValidationError } from '../utils/errors.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import mongoose from 'mongoose';

export const getOrders = asyncHandler(async (req, res) => {
  const orders = await Order.findByUser(req.user.userId);
  
  res.json({
    status: 'success',
    data: { orders }
  });
});

export const getOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.orderId, req.user.userId);
  if (!order) {
    throw new NotFoundError('Order not found');
  }
  
  res.status(200).json({
    status: 'success',
    data: { order }
  });
});

export const deleteOrder = asyncHandler(async (req, res) => {
  const order = await Order.findByIdAndDelete(req.params.orderId);
  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }

  res.status(204).json({
    status: 'success',
    data: null
  });
});

export const s_createOrder = async (orderData) => {
  const { userId, items, total, shippingAddress, customerEmail, customerPhone } = orderData;

  // Validate input
  if (!items || !total || !shippingAddress || !customerPhone) {
    throw new Error('Invalid order data');
  }
  // Ensure the _id field in the items array is set to an ObjectId
  const itemsWithObjectId = items.map(item => ({
    ...item,
    _id: new mongoose.Types.ObjectId(item._id),
  }));

  try {
    // Validate and convert userId to ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new Error('Invalid userId');
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

  const { orderId } = req.params;
  const { userId } = req.query;
  console.log({ orderId, userId });
  // const order = await Order.findById(orderId, userId);
  const order = await Order.findById(orderId);
  if (!order) {
    throw new NotFoundError('Order not found');
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new NotFoundError('User not found');
  }
  console.log({ order, user });
  const invoice = generateInvoice(order, user);

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=invoice-${order._id}.pdf`);

  invoice.pipe(res);
  invoice.end();
});