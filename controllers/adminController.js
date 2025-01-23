import { connectDB } from '../lib/db.js'; // Import the connectDB function
import { Order } from '../models/order.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getAllOrders = asyncHandler(async (req, res) => {
  // Ensure database connection is established before proceeding
  await connectDB();

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
    throw new Error('Failed to fetch orders');
  }
});

export const AdmingetOrder = asyncHandler(async (req, res) => {
  // Ensure database connection is established before proceeding
  await connectDB();

  try {
    const { orderId } = req.query;
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
    throw new Error('Failed to fetch order');
  }
});

export const AdmindeleteOrder = asyncHandler(async (req, res) => {
  // Ensure database connection is established before proceeding
  await connectDB();

  try {
    const { orderId } = req.query;
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
    throw new Error('Failed to delete order');
  }
});

export const updateOrderStatus = asyncHandler(async (req, res) => {
  // Ensure database connection is established before proceeding
  await connectDB();

  try {
    const { orderId } = req.query;
    const { status } = req.body;

    if (!status) {
      throw new Error('Status is required');
    }

    const order = await Order.findByIdAndUpdate(orderId, { status }, { new: true });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.status(200).json(order);
  } catch (error) {
    console.error('Error updating order status:', error);
    throw new Error('Failed to update order status');
  }
});