from fpdf import FPDF

class PDF(FPDF):
    def header(self):
        self.set_font('DejaVu', '', 12)
        self.cell(0, 10, 'VENTURE FUTURE', align='C', ln=1)
        self.cell(0, 10, 'No 619/2801/1182, Mattiga Complex, Police Station Road', align='C', ln=1)
        self.cell(0, 10, 'Kasaba Hobali, Tirthahalli, Shivamogga, Karnataka - 577432', align='C', ln=1)
        self.cell(0, 10, 'GST Reg #: 29HTXPS1735K1ZJ', align='C', ln=1)
        self.ln(10)

    def footer(self):
        self.set_y(-15)
        self.set_font('DejaVu', 'I', 8)
        self.cell(0, 10, 'Thank you for shopping with us!', align='C')

# Dummy data
order = {
    "_id": "6772fa57dc18fa97a2722c6c",
    "userId": "67651ce778a862759dee0de9",
    "items": [
        {
            "_id": "00000002dc18fa97a2722c6b",
            "name": "Unisex Face Beauty Cream(35g)",
            "salePrice": 1000,
            "quantity": 3,
            "gstAmount": 180
        }
    ],
    "customerPhone": "9591958760",
    "total": 3000,
    "shippingAddress": "Puttur",
    "status": "processing",
    "createdAt": "2024-12-30T19:53:59.762+00:00",
    "nextBillingDate": "2025-01-30T19:53:59.762+00:00",
    "totalExclGST": 2820,
    "amountDue": 0
}

user = {
    "name": "Denzil Serrao",
    "email": "denzilserrao77@gmail.com",
}

# Generate PDF
pdf = PDF()
pdf.add_page()
pdf.add_font('DejaVu', '', 'DejaVuSans.ttf', uni=True)
pdf.set_font('DejaVu', '', 10)

# Invoice Details
pdf.cell(0, 10, f"Invoice #: {order['_id']}", ln=1)
pdf.cell(0, 10, f"Invoice Issued: {order['createdAt']}", ln=1)
pdf.cell(0, 10, f"Invoice Amount: ₹{order['total']:.2f}", ln=1)
pdf.cell(0, 10, f"Next Billing Date: {order['nextBillingDate']}", ln=1)
pdf.ln(5)

# Billed To Section
pdf.cell(0, 10, "BILLED TO:", ln=1)
pdf.cell(0, 10, f"Name: {user['name']}", ln=1)
pdf.cell(0, 10, f"Email: {user['email']}", ln=1)
pdf.cell(0, 10, f"Phone: {order['customerPhone']}", ln=1)
pdf.cell(0, 10, f"Shipping Address: {order['shippingAddress']}", ln=1)
pdf.ln(10)

# Table Header
headers = ['DESCRIPTION', 'PRICE', 'DISCOUNT', 'TOTAL EXCL. GST', 'GST AMOUNT']
widths = [60, 40, 40, 50, 40]
for i, header in enumerate(headers):
    pdf.cell(widths[i], 10, header, border=1, align='C')
pdf.ln()

# Table Rows
for item in order['items']:
    pdf.cell(60, 10, item['name'], border=1)
    pdf.cell(40, 10, f"₹{item['salePrice']:.2f}", border=1, align='R')
    pdf.cell(40, 10, "₹0.00", border=1, align='R')
    pdf.cell(50, 10, f"₹{item['salePrice'] * item['quantity']:.2f}", border=1, align='R')
    pdf.cell(40, 10, f"₹{item['gstAmount']:.2f}", border=1, align='R')
    pdf.ln()

# Totals
pdf.ln(5)
pdf.cell(0, 10, f"Total excl. GST: ₹{order['totalExclGST']}", ln=1, align='R')
pdf.cell(0, 10, f"Total incl. GST: ₹{order['total']}", ln=1, align='R')
pdf.cell(0, 10, f"Amount Due (INR): ₹{order['amountDue']}", ln=1, align='R')

# Output PDF
pdf.output("invoice_test.pdf")
print("PDF generated: invoice_test.pdf")
