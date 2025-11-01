import { sendEmail } from '../services/email.service.js';

/**
 * Formats order items into an HTML list
 * @param {Array} items - Array of order items with name, quantity, and price
 * @returns {string} HTML formatted list of items
 */
const formatOrderItems = (items) => {
  return items
    .map(
      (item) => `<li>${item.name} - ${item.quantity} x ₹${item.price.toFixed(2)}</li>`
    )
    .join('');
};

/**
 * Sends order confirmation email to customer
 * @param {Object} params
 * @param {string} params.customerName - Name of the customer
 * @param {string} params.customerEmail - Email of the customer
 * @param {Array} params.orderItems - Array of items in the order
 * @param {number} params.totalAmount - Total order amount
 * @returns {Promise<void>}
 */
export const sendCustomerOrderEmail = async ({
  customerName,
  customerEmail,
  orderItems,
  totalAmount
}) => {
  const itemsList = formatOrderItems(orderItems);
  const emailBody = `
    <h2>Order Confirmation</h2>
    <p>Hi ${customerName},</p>
    <p>Thank you for your purchase! Your order has been confirmed and will be shipped soon.</p>
    <p><strong>Order Details:</strong></p>
    <ul>${itemsList}</ul>
    <p><strong>Total Amount:</strong> ₹${totalAmount.toFixed(2)}</p>
    <p><strong>Estimated Delivery:</strong> 5-7 days</p>
    <p>We appreciate your business!</p>
  `;

  await sendEmail(customerEmail, 'Order Confirmation', '', emailBody);
};

/**
 * Sends new order notification email to shop owner
 * @param {Object} params
 * @param {string} params.customerName - Name of the customer
 * @param {string} params.customerEmail - Email of the customer
 * @param {string} params.orderId - Order ID
 * @param {Array} params.orderItems - Array of items in the order
 * @param {number} params.totalAmount - Total order amount
 * @returns {Promise<void>}
 */
// TODO: REMOVE BEFORE PRODUCTION!
const SHOP_CONFIG = {
  ownerEmail: 'anaofficialproduct@gmail.com'  // Replace with shop owner's email
};

export const sendOwnerOrderEmail = async ({
  customerName,
  customerEmail,
  orderId,
  orderItems,
  totalAmount
}) => {
  // Use the hardcoded owner email
  const ownerEmail = SHOP_CONFIG.ownerEmail;
  
  const itemsList = formatOrderItems(orderItems);
  const emailBody = `
    <h2>New Order Received</h2>
    <p><strong>Customer:</strong> ${customerName} (${customerEmail})</p>
    <p><strong>Order ID:</strong> ${orderId}</p>
    <p><strong>Amount:</strong> ₹${totalAmount.toFixed(2)}</p>
    <p><strong>Items Ordered:</strong></p>
    <ul>${itemsList}</ul>
  `;

  if (!ownerEmail) {
    throw new Error('Shop owner email not configured');
  }

  await sendEmail(ownerEmail, 'New Order Received', '', emailBody);
};

/**
 * Sends both customer and owner emails for a new order
 * @param {Object} order - Order object with items, userId, and _id
 * @param {number} amount - Total order amount
 * @returns {Promise<void>}
 */
export const sendOrderEmails = async (order, amount) => {
  const emailParams = {
    customerName: order.userId.name,
    customerEmail: order.userId.email,
    orderId: order._id,
    orderItems: order.items,
    totalAmount: amount
  };

  await Promise.all([
    sendCustomerOrderEmail(emailParams),
    sendOwnerOrderEmail(emailParams)
  ]);
};