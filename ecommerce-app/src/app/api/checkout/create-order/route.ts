import { NextResponse } from "next/server";

export const runtime = 'edge';

export async function POST(req: Request) {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
     console.error("RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET is missing.");
     return NextResponse.json({ error: "Payment system not configured" }, { status: 500 });
  }

  try {
    const { amount } = await req.json();
    const amountInPaise = Math.round(amount * 100);

    const response = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Basic " + btoa(keyId + ":" + keySecret),
      },
      body: JSON.stringify({
        amount: amountInPaise,
        currency: "INR",
        receipt: `receipt_${Date.now()}`,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.description || "Failed to create order");
    }

    const order = await response.json();
    return NextResponse.json(order);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error("Razorpay API Error:", error);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
