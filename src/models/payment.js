import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  orderId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Order', 
    required: true 
  },
  razorpayOrderId: { 
    type: String, 
    required: true 
  },
  razorpayPaymentId: { 
    type: String, 
    required: true 
  },
  amount: { 
    type: Number, 
    required: true 
  },
  status: { 
    type: String, 
    enum: ['pending', 'completed', 'failed'],
    default: 'pending'
  }
}, {
  timestamps: true
});

export const Payment = mongoose.model('Payment', paymentSchema);