// filepath: /c:/Users/win10/Desktop/mern/project-bolt-sb1-8tfedy (18)/project/server/src/controllers/adminController.js
import { asyncHandler } from '../utils/asyncHandler.js';
import { Order } from '../models/order.js';

export const getAllOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ status: 'processing' }).populate('userId', 'name email');
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