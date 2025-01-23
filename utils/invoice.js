import PDFDocument from 'pdfkit';

export const generateInvoice = (order, user) => {
  console.log('Generating invoice for order:', order, 'user:', user);
  const doc = new PDFDocument({ size: 'A4', margin: 50 });

  // Helper function to add a table row
  const addTableRow = (doc, y, cols, widths, alignments = []) => {
    cols.forEach((col, index) => {
      const x = 50 + widths.slice(0, index).reduce((a, b) => a + b, 0);
      doc.text(col, x, y, {
        width: widths[index],
        align: alignments[index] || 'left',
      });
    });
  };

  // Header
  doc.font('Helvetica-Bold').fontSize(20).text('VENTURE FUTURE', { align: 'center' });
  doc.font('Helvetica').fontSize(10).text('No 619/2801/1182, Mattiga Complex, Police Station Road', { align: 'center' });
  doc.text('Kasaba Hobali, Tirthahalli, Shivamogga, Karnataka - 577432', { align: 'center' });
  doc.text('GST Reg #: 29HTXPS1735K1ZJ', { align: 'center' });
  doc.moveDown(2);

  // Invoice Details
  doc.font('Helvetica-Bold').fontSize(14).text(`Invoice #: ${order._id}`);
  doc.font('Helvetica').fontSize(12).text(`Invoice Issued: ${new Date(order.createdAt).toLocaleDateString()}`);
  doc.text(`Invoice Amount: ₹${order.total.toFixed(2)} (INR)`);
  doc.text(`Next Billing Date: ${order.nextBillingDate || 'N/A'}`);
  doc.moveDown();

  // PAID Status
  doc.font('Helvetica-Bold').fontSize(16).fillColor('green').text('PAID', { align: 'right' });
  doc.fillColor('black');

  // Billed To Section
  doc.font('Helvetica-Bold').fontSize(14).text('BILLED TO:');
  doc.font('Helvetica').fontSize(12);
  doc.text(user.name);
  doc.text(order.shippingAddress);
  doc.text(user.email);
  doc.text(order.customerPhone);
  doc.moveDown(2);

  // Table Headers
  const headers = ['DESCRIPTION', 'PRICE', 'DISCOUNT', 'QUANTITY', 'TOTAL INCL. GST'];
  const headerWidths = [200, 60, 60, 100, 100];
  const headerY = doc.y;
  addTableRow(doc, headerY, headers, headerWidths, ['left', 'right', 'right', 'right', 'right']);
  doc.moveTo(50, headerY + 15).lineTo(550, headerY + 15).stroke();

  // Table Rows
  order.items.forEach((item) => {
    const rowY = doc.y + 5;
    const cols = [
      `${item.name}`,
      `₹${(item.price|| 0).toFixed(2)}`,
      `₹${(item.price|| 0) - (item.salePrice|| 0).toFixed(2)}`,
      `₹${(item.quantity|| 0).toFixed(2)}`,
      `₹${(item.salePrice|| 0) * (item.quantity|| 0).toFixed(2)}`,
    ];
    addTableRow(doc, rowY, cols, headerWidths, ['left', 'right', 'right', 'right', 'right']);
    doc.moveDown();
  });

  // Totals
  doc.moveDown(2);
  doc.text(`Total incl. GST: ₹${(order.total|| 0).toFixed(2)}`, { align: 'right' });

  return doc;
};
