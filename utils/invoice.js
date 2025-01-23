import PDFDocument from 'pdfkit';

export const generateInvoice = (order, user) => {
  console.log('Generating invoice for order:', order, 'user:', user);
  const doc = new PDFDocument({ size: 'A4', margin: 50 });

  // Helper function to add a table row
  const addTableRow = (doc, y, cols, widths, styles = {}) => {
    cols.forEach((col, index) => {
      const style = styles[index] || {};
      doc.text(col, 50 + widths.slice(0, index).reduce((a, b) => a + b, 0), y, style);
    });
  };

  // Header
  doc.font('Helvetica-Bold').fontSize(24).text('ANA Beauty', { align: 'center' });
  doc.moveDown();
  doc.font('Helvetica-Bold').fontSize(18).text('Invoice', { align: 'center' });
  doc.moveDown(2);

  // Invoice Details
  doc.font('Helvetica-Bold').fontSize(14).text(`Invoice #${order._id}`, { align: 'left' });
  doc.font('Helvetica').fontSize(12).text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`, { align: 'left' });
  doc.moveDown();

  // User Details
  doc.font('Helvetica-Bold').fontSize(14).text('Bill To:', { underline: true });
  doc.moveDown();
  doc.font('Helvetica').fontSize(12);
  doc.text(`Name: ${user.name}`);
  doc.text(`Email: ${user.email}`);
  doc.text(`Phone: ${order.customerPhone}`);
  doc.text(`Shipping Address: ${order.shippingAddress}`);
  doc.moveDown(2);

  // Order Details
  doc.font('Helvetica-Bold').fontSize(14).text('Order Details:', { underline: true });
  doc.moveDown();

  // Table Headers
  const headers = ['Item Name', 'Quantity', 'Unit Price', 'Total'];
  const headerWidths = [250, 80, 100, 100];
  const headerStyles = [{ bold: true }, {}, {}, {}];
  const headerY = doc.y;
  addTableRow(doc, headerY, headers, headerWidths, headerStyles);
  doc.moveDown();

  // Draw horizontal line for headers
  doc.moveTo(50, headerY + 20).lineTo(550, headerY + 20).stroke();

  // Table Rows
  order.items.forEach((item, index) => {
    const rowY = doc.y;
    const cols = [
      item.name,
      item.quantity.toString(),
      `$${item.salePrice.toFixed(2)}`,
      `$${(item.quantity * item.salePrice).toFixed(2)}`
    ];
    const rowStyles = [{}, {}, {}, {}];
    addTableRow(doc, rowY, cols, headerWidths, rowStyles);
    doc.moveDown();
  });

  // Total
  doc.moveDown();
  doc.font('Helvetica-Bold').fontSize(14).text(`Total Amount: $${order.total.toFixed(2)}`, { align: 'right' });

  // Footer
  doc.moveDown(2);
  doc.font('Helvetica').fontSize(12).text('Thank you for shopping with ANA Beauty!', { align: 'center' });

  return doc;
};