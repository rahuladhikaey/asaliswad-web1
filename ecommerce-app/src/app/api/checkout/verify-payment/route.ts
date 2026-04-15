import { NextResponse } from "next/server";
import crypto from "crypto";
import { supabaseServer } from "@/lib/supabaseServer";

export async function POST(req: Request) {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      customer_name,
      phone,
      address,
      items,
      total,
    } = await req.json();

    // 1. Verify Signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(body.toString())
      .digest("hex");

    const isAuthentic = expectedSignature === razorpay_signature;

    if (!isAuthentic) {
      return NextResponse.json({ success: false, message: "Invalid signature" }, { status: 400 });
    }

    // 2. Save Order to Supabase with "Payment Complete"
    const { data, error } = await supabaseServer.from("orders").insert([
      {
        customer_name,
        phone,
        address,
        product_details: JSON.stringify(items),
        total_amount: total,
        payment_method: "ONLINE",
        payment_status: "COMPLETE",
        order_status: "PENDING",
        razorpay_order_id,
        razorpay_payment_id,
      },
    ]).select().single();

    if (error) {
      console.error("Supabase Order Creation Error:", error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, orderId: data.id });
  } catch (error: any) {
    console.error("Verification Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
