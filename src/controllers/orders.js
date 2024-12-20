import { Order } from '../models/order.js';
import { generateInvoice } from '../utils/invoice.js';
import { NotFoundError, ValidationError } from '../utils/errors.js';
import { asyncHandler } from '../utils/asyncHandler.js';

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
  
  return ({
    status: 'success',
    data: { order }
  });
});

export const s_createOrder = async (orderData, userId) => {
  // Destructure required fields from orderData
  const { items, total, shippingAddress, customerEmail, customerPhone } = orderData.body;
  // Validate input
  if (!items || !total || !shippingAddress || !customerPhone) {
    throw new Error('Invalid order data');
  }

  try {
    // Create order in the database
    const order = await Order.create({
      userId: orderData.user.userId, // Pass the userId explicitly
      items,
      total,
      shippingAddress,
      customerEmail,
      customerPhone,
    });
    // Return success response
    return {
      status: 'success',
      data: { order }
    };    
  } catch (error) {
    console.error('Error creating order:', error.message);
    throw new Error('Order creation failed');
  }
};


export const generateOrderInvoice = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.orderId, req.user.userId);
  
  if (!order) {
    throw new NotFoundError('Order not found');
  }

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=invoice-${order.id}.pdf`);
  
  const stream = await generateInvoice(order);
  stream.pipe(res);
});