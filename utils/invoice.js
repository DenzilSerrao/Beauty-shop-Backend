import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const generateInvoice = (order, user) => {
  console.log('Generating invoice for order:', order, 'user:', user);
  const doc = new PDFDocument({ size: 'A4', margin: { top: 50, left: 40, right: 40, bottom: 50 } }); // Reduced left margin

  // Load and register the DejaVuSerif and DejaVuSerif-Bold fonts for the rupee symbol
  const fontPathDejaVuSerif = path.join(__dirname, 'DejaVuSerif.ttf'); // Ensure the font file is in the same directory
  const fontPathDejaVuSerifBold = path.join(__dirname, 'DejaVuSerif-Bold.ttf'); // Ensure the font file is in the same directory
  doc.registerFont('DejaVuSerif', fontPathDejaVuSerif);
  doc.registerFont('DejaVuSerif-Bold', fontPathDejaVuSerifBold);

  // Helper function to add a table row
  const addTableRow = (doc, y, cols, widths, alignments = []) => {
    cols.forEach((col, index) => {
      const x = 40 + widths.slice(0, index).reduce((a, b) => a + b, 0); // Adjusted x position for reduced left margin
      const textOptions = {
        width: widths[index],
        align: alignments[index] || 'left',
      };

      // Check if the column contains the rupee symbol and switch fonts accordingly
      if (col.includes('₹')) {
        doc.font('DejaVuSerif-Bold').fontSize(12).text(col, x, y, textOptions);
      } else {
        doc.font('Helvetica').fontSize(12).text(col, x, y, textOptions);
      }
    });
  };

  // Helper function to format date as DD/MM/YYYY
  const formatDate = (date) => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Header
  doc.font('Helvetica-Bold').fontSize(20).text('VENTURE FUTURE', { align: 'center' });
  doc.font('Helvetica').fontSize(10).text('No 619/2801/1182, Mattiga Complex, Police Station Road', { align: 'center' });
  doc.text('Kasaba Hobali, Tirthahalli, Shivamogga, Karnataka - 577432', { align: 'center' });
  doc.text('GST Reg #: 29HTXPS1735K1ZJ', { align: 'center' });
  doc.moveDown(2);

  // Invoice Details
  doc.font('Helvetica-Bold').fontSize(14).text(`Invoice #: ${order._id}`);
  doc.font('Helvetica').fontSize(12).text(`Invoice Issued: ${formatDate(new Date(order.createdAt))}`);

  // Invoice Amount with DejaVuSerif-Bold for rupee symbol
  const invoiceAmountText = `Invoice Amount: ₹${(order.total || 0).toFixed(2)} (INR)`;
  const invoiceAmountParts = invoiceAmountText.split('₹');
  const invoiceAmountPart1 = invoiceAmountParts[0];
  const invoiceAmountPart2 = `₹${invoiceAmountParts[1]}`;

  const part1Width = doc.widthOfString(invoiceAmountPart1, { font: 'Helvetica', size: 12 });
  doc.font('Helvetica').fontSize(12).text(invoiceAmountPart1, 40, doc.y);
  doc.font('DejaVuSerif').fontSize(12).text(invoiceAmountPart2, 40 + part1Width, doc.y);
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
  const headerWidths = [180, 60, 80, 90, 110];
  const headerY = doc.y;
  addTableRow(doc, headerY, headers, headerWidths, ['left', 'right', 'right', 'right', 'right']);
  doc.moveTo(40, headerY + 15).lineTo(520, headerY + 15).stroke(); // Adjusted line position for reduced left margin

  // Table Rows
  order.items.forEach((item) => {
    const rowY = doc.y + 5;
    const cols = [
      `${item.name}`,
      `₹${(item.price || 0).toFixed(2)}`,
      `₹${((item.price || 0) - (item.salePrice || 0)).toFixed(2)}`,
      `${(item.quantity || 0).toString()}`,
      `₹${((item.salePrice || 0) * (item.quantity || 0)).toFixed(2)}`,
    ];
    addTableRow(doc, rowY, cols, headerWidths, ['left', 'right', 'right', 'right', 'right']);
    doc.moveDown();
  });

  // Totals
  doc.moveDown(2);
  doc.font('Helvetica-Bold').fontSize(14);
  const totalText = `Total incl. GST: `;
  const totalAmountText = `₹${(order.total || 0).toFixed(2)}`;
  const totalTextWidth = doc.widthOfString(totalText, { font: 'Helvetica-Bold', size: 14 });
  const totalAmountTextWidth = doc.widthOfString(totalAmountText, { font: 'DejaVuSerif-Bold', size: 14 });
  const totalX = 520 - totalAmountTextWidth - 40; // Align the amount to the right margin with reduced left margin
  doc.text(totalText, 520 - totalTextWidth - totalAmountTextWidth - 40, doc.y); // Position the text before the amount
  doc.font('DejaVuSerif-Bold').fontSize(14).text(totalAmountText, totalX, doc.y);

  // Footer
  doc.moveDown(2);
  doc.font('Helvetica').fontSize(12).text('Thank you for shopping with ANA Beauty!', { align: 'center' });

  return doc;
};