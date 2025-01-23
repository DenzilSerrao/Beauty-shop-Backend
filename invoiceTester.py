import json
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from reportlab.lib.units import inch

def create_pdf_from_json(json_data, output_path):
    c = canvas.Canvas(output_path, pagesize=letter)
    width, height = letter

    # Set font and initial position
    c.setFont("Helvetica-Bold", 16)
    c.drawString(72, height - 50, "ANA Beauty")
    c.setFont("Helvetica-Bold", 14)
    c.drawString(72, height - 75, "Invoice")

    # Invoice Details
    c.setFont("Helvetica", 12)
    c.drawString(72, height - 100, f"Invoice #{json_data['order']['_id']}")
    c.drawString(72, height - 125, f"Date: {json_data['order']['createdAt'][:10]}")
    c.moveDown()

    # User Details
    c.setFont("Helvetica-Bold", 14)
    c.drawString(72, height - 150, "Bill To:")
    c.setFont("Helvetica", 12)
    c.drawString(72, height - 175, f"Name: {json_data['user']['name']}")
    c.drawString(72, height - 200, f"Email: {json_data['user']['email']}")
    c.drawString(72, height - 225, f"Phone: {json_data['order']['customerPhone']}")
    c.drawString(72, height - 250, f"Shipping Address: {json_data['order']['shippingAddress']}")
    c.moveDown()

    # Order Details
    c.setFont("Helvetica-Bold", 14)
    c.drawString(72, height - 275, "Order Details:")
    c.moveDown()

    # Table Headers
    c.setFont("Helvetica-Bold", 12)
    headers = ["Item Name", "Quantity", "Unit Price", "Total"]
    header_widths = [250, 80, 100, 100]
    y_position = height - 300
    for i, header in enumerate(headers):
        c.drawString(72 + sum(header_widths[:i]), y_position, header)
    c.line(72, y_position - 5, 72 + sum(header_widths), y_position - 5)
    c.moveDown()

    # Table Rows
    c.setFont("Helvetica", 12)
    y_position -= 20
    for item in json_data['order']['items']:
        c.drawString(72, y_position, item['name'])
        c.drawString(72 + header_widths[0], y_position, str(item['quantity']))
        c.drawString(72 + header_widths[0] + header_widths[1], y_position, f"${item['salePrice']:.2f}")
        c.drawString(72 + header_widths[0] + header_widths[1] + header_widths[2], y_position, f"${(item['quantity'] * item['salePrice']):.2f}")
        y_position -= 20

    # Total
    c.setFont("Helvetica-Bold", 14)
    c.drawString(72 + sum(header_widths) - header_widths[-1], y_position, f"Total Amount: ${json_data['order']['total']:.2f}")

    # Footer
    c.setFont("Helvetica", 12)
    c.drawString(72, y_position - 30, "Thank you for shopping with ANA Beauty!")

    c.save()
    print(f"PDF saved successfully: {output_path}")

# Example JSON data
json_data = {
    "order": {
        "_id": "6772fa57dc18fa97a2722c6c",
        "userId": "67651ce778a862759dee0de9",
        "items": [
            {
                "_id": "00000002dc18fa97a2722c6b",
                "name": "Unisex Face Beauty Cream(35g)",
                "salePrice": 1000,
                "quantity": 3
            }
        ],
        "customerPhone": "9591958760",
        "total": 3000,
        "shippingAddress": "Puttur",
        "status": "processing",
        "createdAt": "2024-12-30T19:53:59.762+00:00",
        "updatedAt": "2024-12-30T19:54:21.923+00:00",
        "__v": 0
    },
    "user": {
        "_id": "67651ce778a862759dee0de9",
        "name": "Denzil Serrao",
        "email": "denzilserrao77@gmail.com",
        "role": "user",
        "createdAt": "2024-12-20T07:29:43.011+00:00",
        "updatedAt": "2024-12-20T07:29:43.011+00:00",
        "__v": 0
    }
}

# Run the function to create the PDF
create_pdf_from_json(json_data, "invoice.pdf")