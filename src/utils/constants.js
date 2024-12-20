export const ORDER_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered'
};

export const PAYMENT_STATUS = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  FAILED: 'failed'
};

export const AUTH_CONFIG = {
  TOKEN_EXPIRY: '24h',
  SALT_ROUNDS: 10
};

export const RAZORPAY_CONFIG = {
  CURRENCY: 'INR',
  MULTIPLY_FACTOR: 100 // Convert to paise
};