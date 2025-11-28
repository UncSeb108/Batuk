import { connectDB } from "@/src/backend/lib/mongodb";
import Order from "@/src/backend/models/Order";
import Gallery from "@/src/backend/models/Gallery";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    await connectDB();
    const orderData = await req.json();

    console.log("📦 Received order data:", {
      user: orderData.user?.name,
      itemsCount: Array.isArray(orderData.items) ? orderData.items.length : 'not array',
      paymentMethod: orderData.paymentMethod,
      hasTransactionCode: !!orderData.shippingInfo?.transactionCode,
      total: orderData.total
    });

    // Validate required fields
    if (!orderData.user || !orderData.items || !orderData.shippingInfo || !orderData.total) {
      return NextResponse.json(
        { success: false, message: "Missing required order fields" },
        { status: 400 }
      );
    }

    // Ensure items is an array
    let items = orderData.items;
    if (!Array.isArray(items)) {
      if (typeof items === 'string') {
        try {
          items = JSON.parse(items);
        } catch (error) {
          console.error("❌ Failed to parse items string:", error);
          return NextResponse.json(
            { success: false, message: "Invalid items format" },
            { status: 400 }
          );
        }
      }
      
      // If still not array, wrap in array
      if (!Array.isArray(items)) {
        items = [items];
      }
    }

    console.log("✅ Final items array:", items);

    // Generate unique order ID
    const orderId = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Determine payment status
    const paymentStatus = orderData.shippingInfo.transactionCode ? "paid" : "pending";
    const orderStatus = paymentStatus === "paid" ? "confirmed" : "pending";

    // Create order with proper item structure
    const orderPayload = {
      orderId,
      user: {
        userId: orderData.user.id,
        name: orderData.user.name,
        email: orderData.user.email,
        phone: orderData.shippingInfo.phone,
      },
      items: items.map((item: any) => ({
        uid: item.uid || 'unknown',
        title: item.title || 'Untitled Artwork',
        artist: item.artist || 'Batuk',
        price: item.price || '0',
        src: item.src || '',
        typeCode: item.typeCode || 'ART',
        materials: item.materials || 'Not specified',
        duration: item.duration || 'Not specified',
        type: item.type || 'Artwork',
        inspiration: item.inspiration || 'Not specified',
      })),
      shippingInfo: {
        fullName: orderData.shippingInfo.fullName,
        email: orderData.shippingInfo.email,
        phone: orderData.shippingInfo.phone,
        address: orderData.shippingInfo.address,
        city: orderData.shippingInfo.city,
        country: orderData.shippingInfo.country || "Kenya",
      },
      paymentInfo: {
        method: "mpesa",
        transactionCode: orderData.shippingInfo.transactionCode || undefined,
        status: paymentStatus,
        amount: orderData.total,
      },
      total: orderData.total,
      status: orderStatus,
    };

    console.log("📤 Creating order with payload:", orderPayload);

    const newOrder = await Order.create(orderPayload);

    console.log("✅ Order created successfully:", {
      orderId: newOrder.orderId,
      itemsCount: newOrder.items.length,
      paymentStatus: newOrder.paymentInfo?.status ?? "unknown",
      transactionCode: newOrder.paymentInfo?.transactionCode ?? null
    });

    // Update artwork status for paid orders
    if (paymentStatus === "paid") {
      for (const item of items) {
        await Gallery.findOneAndUpdate(
          { uid: item.uid },
          { 
            status: "Sold",
            soldDate: new Date(),
            orderId: orderId
          },
          { new: true }
        );
        console.log(`✅ Updated artwork ${item.uid} to Sold status`);
      }
    }

    return NextResponse.json(
      { 
        success: true, 
        message: "Order placed successfully",
        orderId: newOrder.orderId,
        order: newOrder
      },
      { status: 201 }
    );

  } catch (error: any) {
    console.error("❌ Order processing error:", error);
    
    // More detailed error information
    if (error.name === 'ValidationError') {
      console.error("Validation errors:", error.errors);
    }
    
    return NextResponse.json(
      { 
        success: false, 
        message: "Failed to process order",
        error: error.message
      },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    const filter: any = {};
    if (status && status !== "all") {
      filter.status = status;
    }

    const orders = await Order.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalOrders = await Order.countDocuments(filter);

    return NextResponse.json({
      orders,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalOrders / limit),
        totalOrders,
        hasNext: page < Math.ceil(totalOrders / limit),
        hasPrev: page > 1,
      }
    });

  } catch (error) {
    console.error("Failed to fetch orders:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get("orderId");
    
    if (!orderId) {
      return NextResponse.json(
        { success: false, message: "Order ID required" },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { status, paymentStatus } = body;

    if (!status && !paymentStatus) {
      return NextResponse.json(
        { success: false, message: "Status or paymentStatus is required" },
        { status: 400 }
      );
    }

    const updateData: any = {};
    
    if (status) {
      const validStatuses = ["pending", "confirmed", "shipped", "delivered", "cancelled"];
      if (!validStatuses.includes(status)) {
        return NextResponse.json(
          { success: false, message: "Invalid status" },
          { status: 400 }
        );
      }
      updateData.status = status;
    }

    if (paymentStatus) {
      const validPaymentStatuses = ["pending", "paid", "failed"];
      if (!validPaymentStatuses.includes(paymentStatus)) {
        return NextResponse.json(
          { success: false, message: "Invalid payment status" },
          { status: 400 }
        );
      }
      updateData["paymentInfo.status"] = paymentStatus;
    }

    const updatedOrder = await Order.findOneAndUpdate(
      { orderId },
      updateData,
      { new: true }
    );

    if (!updatedOrder) {
      return NextResponse.json(
        { success: false, message: "Order not found" },
        { status: 404 }
      );
    }

    // If payment status is updated to paid, mark artworks as sold
    if (paymentStatus === "paid") {
      for (const item of updatedOrder.items) {
        await Gallery.findOneAndUpdate(
          { uid: item.uid },
          { 
            status: "Sold",
            soldDate: new Date(),
            orderId: updatedOrder.orderId
          },
          { new: true }
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: "Order updated successfully",
      order: updatedOrder
    });

  } catch (error) {
    console.error("Failed to update order:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update order" },
      { status: 500 }
    );
  }
}
