import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const generateInvoice = (order, user) => {
  console.log('Generating invoice for order:', order, 'user:', user);
  const doc = new PDFDocument({ size: 'A4', margin: 40 }); // Globally reduced left margin

  // Load and register the NotoSans-Regular font for the rupee symbol
  const fontPathNotoSans = path.join(__dirname, 'NotoSans-Regular.ttf'); // Ensure the font file is in the same directory
  if (!fs.existsSync(fontPathNotoSans)) {
    console.error(`Font file not found: ${fontPathNotoSans}`);
    throw new Error('Failed to find NotoSans-Regular.ttf font file');
  }
  doc.registerFont('NotoSans', fontPathNotoSans);

  const addTableRow = (doc, y, cols, widths, alignments = [], backgroundColor = null) => {
    // Draw the background color first (if provided)
    if (backgroundColor) {
      doc.rect(38, y - 4, 530, 15) // Adjust height and y-position slightly for better alignment
         .fillColor(backgroundColor)
         .fill()
         .fillColor('black'); // Reset color to black for text
    }
  
    // Render the text after drawing the background
    cols.forEach((col, index) => {
      const x = 40 + widths.slice(0, index).reduce((a, b) => a + b, 0);
      const textOptions = {
        width: widths[index],
        align: alignments[index] || 'left',
      };
  
      // Check if the column contains the rupee symbol and switch fonts accordingly
      if (col.includes('₹')) {
        doc.font('NotoSans').fontSize(12).text(col, x, y-5, textOptions);
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

  // // **Added: Add Venture Future Logo**
  // const ventureFutureLogoPath = path.join(__dirname, 'venture_future_logo.jpeg'); // Ensure the logo file is in the same directory
  // if (!fs.existsSync(ventureFutureLogoPath)) {
  //   console.error(`Logo file not found: ${ventureFutureLogoPath}`);
  //   throw new Error('Failed to find venture_future_logo.jpeg logo file');
  // }
  // doc.image(ventureFutureLogoPath, 40, 20, { fit: [100, 100], align: 'left', valign: 'top' });

  // **Added: Add Ana Beauty Logo**
  const anaBeautyLogoPath = path.join(__dirname, 'ana_beauty_logo.png'); // Ensure the logo file is in the same directory
  if (!fs.existsSync(anaBeautyLogoPath)) {
    console.error(`Logo file not found: ${anaBeautyLogoPath}`);
    throw new Error('Failed to find ana_beauty_logo.png logo file');
  }
  doc.image(anaBeautyLogoPath, 450, 35, { fit: [100, 100], align: 'right', valign: 'top' });

  // Header
  doc.moveDown(3);
  doc.font('Helvetica-Bold').fontSize(20).text('ANA BEAUTY', { align: 'center' });
  doc.font('Helvetica').fontSize(10).text('No 619/2801/1182, Mattiga Complex, Police Station Road', { align: 'center' });
  doc.text('Kasaba Hobali, Tirthahalli, Shivamogga, Karnataka - 577432', { align: 'center' });
  doc.text('GST Reg #: 29HTXPS1735K1ZJ', { align: 'center' });
  doc.moveDown(2);

  // Invoice Details
  doc.font('Helvetica-Bold').fontSize(14).text(`Invoice #: ${order._id}`);
  doc.font('Helvetica').fontSize(12).text(`Invoice Issued: ${formatDate(new Date(order.createdAt))}`);
  doc.font('Helvetica').fontSize(12).text(`Invoice Amount: Rs.${(order.total || 0).toFixed(2)} (INR)`);
  doc.moveDown();

  // PAID Status
  doc.font('Helvetica-Bold').fontSize(16).fillColor('green').text('PAID', { align: 'right' });
  doc.fillColor('black');

  // Billed To Section
  doc.font('Helvetica-Bold').fontSize(14).text('BILLED TO:', 40, doc.y); // Align to the left
  doc.font('Helvetica').fontSize(12);
  doc.text(user.name, 40, doc.y);
  doc.text(order.shippingAddress, 40, doc.y);
  doc.text(user.email, 40, doc.y);
  doc.text(order.customerPhone, 40, doc.y);
  doc.moveDown(2);

  // Table Headers
  const headers = ['DESCRIPTION', 'PRICE', 'SALE PRICE', 'QUANTITY', 'TOTAL INCL. GST'];
  const headerWidths = [180, 60, 80, 90, 110];
  const headerY = doc.y;
  // **Modified: Added background color to headers**
  addTableRow(doc, headerY, headers, headerWidths, ['left', 'right', 'right', 'right', 'right'], '#f2f2f2'); // Light gray background
  doc.moveTo(40, headerY + 15).lineTo(570, headerY + 15).stroke(); // Adjusted line position for reduced left margin

  // Table Rows
  order.items.forEach((item, index) => {
    const rowY = doc.y + 5;
    const cols = [
      `${item.name}`,
      `₹${(item.price || 0).toFixed(2)}`,
      `₹${(item.salePrice || 0).toFixed(2)}`,
      `${(item.quantity || 0).toFixed(2)}`,
      `₹${((item.salePrice || 0) * (item.quantity || 0)).toFixed(2)}`,
    ];
    // **Modified: Added alternating row colors**
    const backgroundColor = index % 2 === 0 ? '#ffffff' : '#f9f9f9'; // Alternating row colors
    addTableRow(doc, rowY, cols, headerWidths, ['left', 'right', 'right', 'right', 'right'], backgroundColor);
  });

  // Totals
  doc.moveDown(2);
  doc.font('NotoSans').fontSize(14);
  const totalText = `Total incl. GST: ₹${(order.total || 0).toFixed(2)}`;

  // Draw the totalText
  doc.text(totalText, 40, doc.y);

  doc.moveDown();

  // Footer
  doc.moveDown(2);
  doc.font('Helvetica').fontSize(12).text('Thank you for shopping with ANA Beauty!', { align: 'center' });

  return doc;
};