import { sendOrderEmails } from '../utils/orderEmails.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Sample order data for testing
const testOrder = {
  _id: 'TEST_ORDER_123',
  userId: {
    name: 'Test Customer',
    email: 'your-test-email@example.com' // Replace with your email for testing
  },
  items: [
    {
      name: 'Test Product 1',
      quantity: 2,
      price: 199.99
    },
    {
      name: 'Test Product 2',
      quantity: 1,
      price: 299.99
    }
  ]
};

const totalAmount = testOrder.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

// Execute the test
async function runTest() {
  try {
    console.log('Sending test order emails...');
    await sendOrderEmails(testOrder, totalAmount);
    console.log('✅ Test emails sent successfully!');
  } catch (error) {
    console.error('❌ Error sending test emails:', error);
  }
}

runTest();