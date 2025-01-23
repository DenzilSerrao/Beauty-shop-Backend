import PDFDocument from 'pdfkit';

export const generateInvoice = (order, user) => {
  console.log('Generating invoice for order:', order, 'user:', user);
  const doc = new PDFDocument();

  // Helper function to add a table row
  const addTableRow = (doc, y, cols, width) => {
    const colWidth = width / cols.length;
    cols.forEach((col, index) => {
      doc.text(col, index * colWidth + 50, y, { width: colWidth - 10, align: 'left' });
    });
  };

  // Header
  doc.fontSize(24).text('ANA Beauty', { align: 'center' });
  doc.moveDown();
  doc.fontSize(18).text('Invoice', { align: 'center' });
  doc.moveDown(2);

  // Invoice Details
  doc.fontSize(14).text(`Invoice #${order._id}`, { align: 'left' });
  doc.text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`, { align: 'left' });
  doc.moveDown();

  // User Details
  doc.fontSize(14).text('Bill To:', { underline: true });
  doc.moveDown();
  doc.fontSize(12);
  doc.text(`Name: ${user.name}`);
  doc.text(`Email: ${user.email}`);
  doc.text(`Phone: ${order.customerPhone}`);
  doc.text(`Shipping Address: ${order.shippingAddress}`);
  doc.moveDown(2);

  // Order Details
  doc.fontSize(14).text('Order Details:', { underline: true });
  doc.moveDown();

  // Table Headers
  const headers = ['Item Name', 'Quantity', 'Unit Price', 'Total'];
  const headerY = doc.y;
  addTableRow(doc, headerY, headers, 500);
  doc.moveDown();

  // Draw horizontal line for headers
  doc.moveTo(50, headerY + 20).lineTo(550, headerY + 20).stroke();

  // Table Rows
  order.items.forEach((item, index) => {
    const rowY = doc.y;
    const cols = [
      item.name,
      item.quantity.toString(),
      `$${item.price.toFixed(2)}`,
      `$${(item.quantity * item.price).toFixed(2)}`
    ];
    addTableRow(doc, rowY, cols, 500);
    doc.moveDown();
  });

  // Total
  doc.moveDown();
  doc.fontSize(14).text(`Total Amount: $${order.total.toFixed(2)}`, { align: 'right' });

  // Footer
  doc.moveDown(2);
  doc.fontSize(12).text('Thank you for shopping with ANA Beauty!', { align: 'center' });

  doc.end();
  return doc;
};

