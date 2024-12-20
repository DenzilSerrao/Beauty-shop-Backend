import { Request } from 'express';
import { Document } from 'mongoose';

export interface UserDocument extends Document {
  name: string;
  email: string;
  password: string;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

export interface OrderDocument extends Document {
  userId: string;
  items: Array<{
    productId: number;
    name: string;
    price: number;
    quantity: number;
  }>;
  total: number;
  shippingAddress: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered';
  createdAt: Date;
}

export interface PaymentDocument extends Document {
  orderId: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  createdAt: Date;
}

export interface AuthRequest extends Request {
  user?: {
    userId: string;
  };
}