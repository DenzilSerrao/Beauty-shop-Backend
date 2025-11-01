import { sendOrderEmails } from './orderEmails.js';
import readline from 'readline';
import dotenv from 'dotenv';

dotenv.config();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

// Email validation function
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

async function collectOrderDetails() {
  try {
    console.log('\n📦 Order Email Sender\n');

    // Collect customer details
    const customerName = await question('Enter customer name: ');
    let customerEmail;
    do {
      customerEmail = await question('Enter customer email (must be valid email address): ');
      if (!isValidEmail(customerEmail)) {
        console.log('❌ Invalid email format. Please enter a valid email address (e.g., name@example.com)');
      }
    } while (!isValidEmail(customerEmail));
    
    // Collect order details
    const orderId = await question('Enter order ID: ');
    
    // Collect items
    const items = [];
    console.log('\nEnter order items (enter empty name to finish):');
    
    while (true) {
      const name = await question('\nProduct name (or press enter to finish): ');
      if (!name) break;
      
      const quantity = parseInt(await question('Quantity: '));
      const price = parseFloat(await question('Price per item (₹): '));
      
      items.push({ name, quantity, price });
      console.log(`Added: ${quantity}x ${name} at ₹${price} each`);
    }

    // Calculate total
    const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    console.log('\n📝 Order Summary:');
    console.log(`Customer: ${customerName} (${customerEmail})`);
    console.log(`Order ID: ${orderId}`);
    console.log('\nItems:');
    items.forEach(item => {
      console.log(`- ${item.quantity}x ${item.name} at ₹${item.price} each = ₹${item.quantity * item.price}`);
    });
    console.log(`\nTotal Amount: ₹${totalAmount}`);

    const confirm = await question('\nSend emails? (yes/no): ');
    if (confirm.toLowerCase() === 'yes') {
      const order = {
        _id: orderId,
        userId: {
          name: customerName,
          email: customerEmail
        },
        items
      };

      console.log('\nSending emails...');
      await sendOrderEmails(order, totalAmount);
      console.log('✅ Emails sent successfully!\n');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    rl.close();
  }
}

collectOrderDetails();