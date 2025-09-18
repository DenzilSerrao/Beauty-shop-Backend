import { corsMiddleware } from "../../../middleware/corsMiddleware.js";
import { connectDB } from "../../../lib/db.js";
import { Order } from "../../../models/order.js";
import { Payment } from "../../../models/payment.js";
import { User } from "../../../models/user.js"; // Add this line
import { sendEmail } from "../../../services/email.service.js";
import crypto from "crypto";
import { logErrorToDatabase } from "../../../lib/dbLogger.js";
import { ErrorLog } from "../../../models/error.js";

export default async function handler(req, res) {
  // Apply CORS middleware
  if (corsMiddleware(req, res)) {
    return;
  }

  // Webhook context for logging
  const webhookContext = {
    source: "razorpay_webhook",
    webhookId: req.headers["x-razorpay-event-id"],
    webhookTimestamp: req.headers["x-razorpay-timestamp"],
  };

  // Ensure database connection
  try {
    await connectDB();
  } catch (dbError) {
    console.error("Database connection failed:", dbError);
    await logErrorToDatabase(dbError, req, {
      ...webhookContext,
      context: "Webhook database connection",
    });
    // Return 200 to prevent webhook deactivation
    return res
      .status(200)
      .json({ status: "error", message: "Webhook processed with errors" });
  }

  if (req.method === "POST") {
    try {
      console.log("Handling Razorpay webhook");

      const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
      const signature = req.headers["x-razorpay-signature"];

      if (!signature) {
        console.error("Missing Razorpay signature");
        await logErrorToDatabase(new Error("Missing Razorpay signature"), req, {
          ...webhookContext,
          headers: Object.keys(req.headers),
        });
        return res
          .status(200)
          .json({ status: "error", message: "Missing signature" });
      }

      const body = JSON.stringify(req.body);
      console.log("Webhook signature:", signature);
      console.log("Webhook payload:", body);

      // Validate webhook signature
      const expectedSignature = crypto
        .createHmac("sha256", webhookSecret)
        .update(body)
        .digest("hex");

      if (signature !== expectedSignature) {
        console.error("Invalid webhook signature");
        await logErrorToDatabase(new Error("Invalid webhook signature"), req, {
          ...webhookContext,
          receivedSignature: signature.substring(0, 20) + "...",
          expectedSignature: expectedSignature.substring(0, 20) + "...",
        });
        return res
          .status(200)
          .json({ status: "error", message: "Invalid signature" });
      }

      console.log("Webhook signature verified");

      // Extract event data
      const event = req.body.event;
      const payload = req.body.payload;

      // Handle webhook verification ping
      if (event === "ping") {
        console.log("Received webhook verification ping");
        return res.status(200).json({ status: "ok" });
      }

      if (event === "payment.captured") {
        console.log("Processing payment.captured event");

        // Add defensive checks for payload structure
        const paymentEntity = payload?.payment?.entity;
        if (!paymentEntity) {
          console.error("Payment entity not found in payload");
          await logErrorToDatabase(new Error("Payment entity not found"), req, {
            ...webhookContext,
            payload: payload,
          });
          return res
            .status(200)
            .json({ status: "error", message: "Invalid payload" });
        }

        const razorpayOrderId = paymentEntity.order_id;
        const razorpayPaymentId = paymentEntity.id;
        const amount = paymentEntity.amount / 100;

        // Safely extract notes with fallback
        const notes = paymentEntity.notes || {};
        const orderId = notes.orderId;
        const userId = notes.userId;

        if (!orderId || !userId) {
          console.error("Missing orderId or userId in payment notes");
          await logErrorToDatabase(new Error("Missing order reference"), req, {
            ...webhookContext,
            notes: notes,
          });
          return res
            .status(200)
            .json({ status: "error", message: "Missing order reference" });
        }

        // Check if payment already processed
        const existingPayment = await Payment.findOne({ razorpayPaymentId });
        if (existingPayment) {
          console.log("Payment already processed");
          return res.status(200).json({ success: true });
        }

        // Find order
        const order = await Order.findOne({ _id: orderId }).populate("userId");
        if (!order) {
          console.error("Order not found");
          await logErrorToDatabase(new Error("Order not found"), req, {
            ...webhookContext,
            orderId: orderId,
          });
          return res
            .status(200)
            .json({ status: "error", message: "Order not found" });
        }

        if (!order.userId) {
          console.error("User not found for order");
          await logErrorToDatabase(new Error("User not found"), req, {
            ...webhookContext,
            orderId: orderId,
          });
          return res
            .status(200)
            .json({ status: "error", message: "User details not found" });
        }

        // Update order status
        order.status = "processing";
        await order.save();

        // Store payment details
        await Payment.create({
          orderId: order._id,
          razorpayOrderId,
          razorpayPaymentId,
          amount,
          status: "completed",
        });

        // Format order items for email
        const orderItems = order.items
          .map(
            (item) =>
              `<li>${item.name} - ${item.quantity} x ₹${(
                item.salePrice || 0
              ).toFixed(2)}</li>`
          )
          .join("");

        // Send email to customer
        const customerEmailBody = `
          <h2>Order Confirmation</h2>
          <p>Hi ${order.userId.name},</p>
          <p>Thank you for your purchase! Your order has been confirmed and will be shipped soon.</p>
          <p><strong>Order Details:</strong></p>
          <ul>${orderItems}</ul>
          <p><strong>Total Amount:</strong> ₹${amount.toFixed(2)}</p>
          <p><strong>Estimated Delivery:</strong> 5-7 days</p>
          <p>We appreciate your business!</p>
        `;

        try {
          await sendEmail(
            order.userId.email,
            "Order Confirmation",
            "",
            customerEmailBody
          );
          console.log("Customer email sent successfully");
        } catch (emailError) {
          console.error("Failed to send customer email:", emailError);
          await logErrorToDatabase(emailError, req, {
            ...webhookContext,
            context: "Customer email",
            orderId: orderId,
            customerEmail: order.userId.email,
          });
        }

        // Send email to owner
        const ownerEmailBody = `
          <h2>New Order Received</h2>
          <p><strong>Customer:</strong> ${order.userId.name} (${
          order.userId.email
        })</p>
          <p><strong>Order ID:</strong> ${order._id}</p>
          <p><strong>Amount:</strong> ₹${amount.toFixed(2)}</p>
          <p><strong>Items Ordered:</strong></p>
          <ul>${orderItems}</ul>
        `;

        try {
          await sendEmail(
            process.env.OWNER_EMAIL,
            "New Order Received",
            "",
            ownerEmailBody
          );
          console.log("Owner email sent successfully");
        } catch (emailError) {
          console.error("Failed to send owner email:", emailError);
          await logErrorToDatabase(emailError, req, {
            ...webhookContext,
            context: "Owner email",
            orderId: orderId,
            ownerEmail: process.env.OWNER_EMAIL,
          });
        }

        console.log("Payment processed successfully");
        return res
          .status(200)
          .json({ success: true, orderId: order._id, amount });
      }

      console.log("Unhandled event type:", event);
      return res.status(200).json({ status: "ok" });
    } catch (error) {
      console.error("Error processing Razorpay webhook:", error);
      await logErrorToDatabase(error, req, {
        ...webhookContext,
        context: "Webhook general processing",
      });
      // Return 200 to prevent webhook deactivation
      return res
        .status(200)
        .json({ status: "error", message: "Webhook processed with errors" });
    }
  } else {
    // Return 200 for non-POST requests to prevent webhook deactivation
    return res
      .status(200)
      .json({ status: "error", message: "Method not allowed" });
  }
}
