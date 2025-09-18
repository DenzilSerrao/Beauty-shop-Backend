import { getOrder, deleteOrder } from "../../../controllers/orders.js";
import { corsMiddleware } from "../../../middleware/corsMiddleware.js";
import userAuth from "../../../middleware/userAuth.js";
import { connectDB } from "../../../lib/db.js";

export default async function handler(req, res) {
  // Apply CORS middleware
  if (corsMiddleware(req, res)) {
    return;
  }

  console.log("Applying CORS middleware successfully");

  try {
    console.log("Attempting to connect to the database...");
    await connectDB();
    console.log("Database connection established successfully");
  } catch (dbError) {
    console.error("Database connection failed:", dbError);
    return res.status(500).json({ error: "Failed to connect to the database" });
  }

  const authResult = await userAuth(req, res);
  if (authResult?.error) {
    console.error("User authentication failed:", authResult.error);
    return res.status(401).json({ error: authResult.error });
  }
  console.log("User authentication successful");

  const { orderId } = req.query;

  if (!orderId) {
    return res.status(400).json({ error: "Order ID is required" });
  }

  try {
    switch (req.method) {
      case "GET":
        console.log("Handling GET request for order:", orderId);
        const orderResult = await getOrder(orderId, req);
        console.log("Order fetched successfully:", orderResult);
        return res.status(200).json(orderResult);

      case "DELETE":
        console.log("Handling DELETE request for order:", orderId);
        const deleteResult = await deleteOrder(orderId, req);
        console.log("Order deleted successfully:", deleteResult);
        return res.status(200).json(deleteResult);

      default:
        console.log("Method not allowed:", req.method);
        return res.status(405).json({ error: "Method Not Allowed" });
    }
  } catch (error) {
    console.error("Order error:", error);

    // Handle different error types
    if (error.name === "ValidationError") {
      return res.status(400).json({ error: error.message });
    }

    if (error.name === "NotFoundError") {
      const statusCode = error.statusCode || 404;
      return res.status(statusCode).json({ error: error.message });
    }

    return res
      .status(500)
      .json({ error: error.message || "Internal server error" });
  }
}
