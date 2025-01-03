// filepath: /c:/Users/win10/Desktop/mern/project-bolt-sb1-8tfedy (18)/project/server/src/utils/invoice.js
import PDFDocument from 'pdfkit';

export const generateInvoice = (order, user) => {
  const doc = new PDFDocument();

  // Header
  doc.fontSize(20).text('ANA Beauty', { align: 'center' });
  doc.moveDown();
  doc.fontSize(16).text('Invoice', { align: 'center' });
  doc.moveDown();

  // User Details
  doc.fontSize(12);
  doc.text(`Name: ${user.name}`);
  doc.text(`Email: ${user.email}`);
  doc.moveDown();

  // Order Details
  doc.text(`Order ID: ${order._id}`);
  doc.text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`);
  doc.text(`Status: ${order.status}`);
  doc.moveDown();

  // Shipping Address
  doc.text('Shipping Address:');
  doc.text(order.shippingAddress);
  doc.moveDown();

  // Items Table
  doc.text('Items:', { underline: true });
  doc.moveDown();

  order.items.forEach(item => {
    doc.text(`${item.name}`);
    doc.text(`Quantity: ${item.quantity} x $${item.price} = $${item.quantity * item.price}`, {
      indent: 20
    });
    doc.moveDown();
  });

  // Total
  doc.moveDown();
  doc.fontSize(14).text(`Total Amount: $${order.total}`, { align: 'right' });

  // Footer
  doc.moveDown(2);
  doc.fontSize(10).text('Thank you for shopping with ANA Beauty!', { align: 'center' });

  return doc;
};