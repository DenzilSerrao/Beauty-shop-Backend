import { connectDB } from '../lib/db.js'; // Import the connectDB function
import { Order } from '../models/order.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import mongoose from 'mongoose';

export const getAllOrders = asyncHandler(async (req, res) => {
  try {
    const processingAndShippingOrders = await Order.find({
      $or: [{ status: 'processing' }, { status: 'shipped' }]
    }).populate('userId', 'name email');

    const deliveredOrders = await Order.find({ status: 'delivered' })
      .sort({ createdAt: -1 })
      .limit(20)
      .populate('userId', 'name email');

    const orders = [...processingAndShippingOrders, ...deliveredOrders];

    res.json({
      status: 'success',
      data: { orders }
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ status: 'fail', message: 'Failed to fetch orders' });
  }
});

export const AdmingetOrder = asyncHandler(async (orderId, req, res) => {
  try {
    // Validate orderId
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({ status: 'fail', message: 'Invalid order ID' });
    }

    const order = await Order.findById(orderId).populate('userId', 'name email');

    if (!order) {
      return res.status(404).json({ status: 'fail', message: 'Order not found' });
    }

    res.json({
      status: 'success',
      data: { order }
    });
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ status: 'fail', message: 'Failed to fetch order' });
  }
});

export const AdmindeleteOrder = asyncHandler(async (orderId, req, res) => {
  try {
    // Validate orderId
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({ status: 'fail', message: 'Invalid order ID' });
    }

    const order = await Order.findByIdAndDelete(orderId);

    if (!order) {
      return res.status(404).json({ status: 'fail', message: 'Order not found' });
    }

    res.json({
      status: 'success',
      message: 'Order deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting order:', error);
    res.status(500).json({ status: 'fail', message: 'Failed to delete order' });
  }
});

export const updateOrderStatus = asyncHandler(async (orderId, req, res) => {
  // Ensure database connection is established before proceeding
  await connectDB();

  try {
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ status: 'fail', message: 'Status is required' });
    }

    // Validate orderId
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({ status: 'fail', message: 'Invalid order ID' });
    }

    const order = await Order.findByIdAndUpdate(orderId, { status }, { new: true });

    if (!order) {
      return res.status(404).json({ status: 'fail', message: 'Order not found' });
    }

    res.status(200).json({
      status: 'success',
      data: { order }
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ status: 'fail', message: 'Failed to update order status' });
  }
});