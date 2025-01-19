// filepath: /c:/Users/win10/Desktop/mern/project-bolt-sb1-8tfedy (18)/project/server/src/controllers/adminController.js
import { asyncHandler } from '../utils/asyncHandler.js';
import { Order } from '../models/order.js';

export const getAllOrders = asyncHandler(async (req, res) => {
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
});

export const AdmingetOrder = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const order = await Order.findById(orderId).populate('userId', 'name email');
  if (!order) {
    res.status(404).json({ status: 'fail', message: 'Order not found' });
    return;
  }
  res.json({
    status: 'success',
    data: { order }
  });
});

export const AdmindeleteOrder = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const order = await Order.findByIdAndDelete(orderId);
  if (!order) {
    res.status(404).json({ status: 'fail', message: 'Order not found' });
    return;
  }
  res.json({
    status: 'success',
    message: 'Order deleted successfully'
  });
});

export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(orderId, { status }, { new: true });
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
