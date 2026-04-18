import { NextResponse } from "next/server";
import Razorpay from "razorpay";

export async function POST(req: Request) {
  // Initialize Razorpay inside the request to prevent build-time crashes
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
     console.error("RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET is missing in environment variables.");
     return NextResponse.json({ error: "Payment system not configured" }, { status: 500 });
  }

  const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });

  try {
    const { amount } = await req.json();

    const options = {
      amount: Math.round(amount * 100), // amount in smallest currency unit (paise)
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);
    return NextResponse.json(order);
  } catch (error: any) {
    console.error("Razorpay Order Creation Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
