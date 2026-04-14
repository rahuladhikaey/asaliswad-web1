import { NextResponse } from "next/server";

const KNOWLEDGE_BASE = `
Asali Swad Business & Product Information:

📦 Return Policy:
- Returns accepted within 24 hours of delivery.
- Product must be unused and in original packaging.
- Return allowed only if product is damaged or wrong item is delivered.
- No return for opened/used food items for safety reasons.

💰 Refund Policy:
- Refund processed within 3–5 business days.
- Refund method: Same as payment method or Store Credit.
- PAYMENTS: We support Cash on Delivery AND Online Payment via Link. After placing an order, the customer will receive a secure Payment Link (Razorpay/UPI) directly on WhatsApp. Once paid, the order is confirmed for delivery.

🚚 Delivery Policy:
- Delivery time: 2–5 days (local), 5–7 days (other areas).
- Free delivery on bulk orders.

🌿 Product Information (Urad Dal Bori):
- 100% natural and organic with no artificial preservatives or chemicals.
- Made from premium quality urad dal using a traditional handmade process.
- Sun-dried for natural preservation.
- Rich in protein and healthy.
- Usage: Fry until golden brown then add to curries (aloo bori, lau bori, palak bori etc.).
- Storage: Store in a cool, dry place in an airtight container; avoid moisture.

🏭 Manufacturing:
- Small-batch production, handmade by skilled workers, quality checked before packaging.
`;

const fallbackResponse = (prompt: string) => {
  const normalized = prompt.toLowerCase();

  if (/(hello|hi|hey|greetings)/i.test(normalized)) {
    return "Hello! I'm Asali Swad's AI Assistant. I can help you with our premium Urad Dal Bori, orders, delivery, or policies.";
  }

  if (/(bori|urad|dal|cook|dish|healthy|last|storage|moisture|natural|sun-dried|handmade)/i.test(normalized)) {
    return "Our Urad Dal Bori is 100% natural, handmade, and sun-dried. You can fry it until golden brown for curries like aloo bori. It lasts several months in an airtight container.";
  }

  if (/(return|refund|damage|wrong|opened|safety|policy)/i.test(normalized)) {
    return "We accept returns within 24 hours if the item is damaged or wrong. Opened food items cannot be returned. Refunds take 3-5 business days.";
  }

  if (/(delivery|shipping|time|days|bulk|local)/i.test(normalized)) {
    return "Local delivery takes 2-5 days, while other areas take 5-7 days. We offer free delivery on bulk orders!";
  }

  if (/(bulk|retail|restaurant|order)/i.test(normalized)) {
    return "Yes! We support bulk orders for households, retailers, and restaurants. Contact us for special pricing.";
  }

  return "I can help with details about our Urad Dal Bori, return policies, delivery times, and bulk orders. Try asking 'Is the bori organic?' or 'What is your refund policy?'";
};

export async function POST(request: Request) {
  const body = await request.json();
  const prompt = String(body.prompt || "").trim();

  if (!prompt) {
    return NextResponse.json({ error: "Prompt is required." }, { status: 400 });
  }

  const openAiKey = process.env.OPENAI_API_KEY;

  if (!openAiKey) {
    return NextResponse.json({ reply: fallbackResponse(prompt) });
  }

  try {
    const openAiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${openAiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are an AI assistant for the Asali Swad grocery app. 
            User Knowledge Base:
            ${KNOWLEDGE_BASE}
            
            Instructions:
            - Answer user questions in a friendly, concise way using only the provided facts.
            - If you don't know the answer, ask them to email connect.asaliswad2026@gmail.com.
            - Ensure you highlight the traditional, handmade, and preservative-free nature of the products.`,
          },
          { role: "user", content: prompt },
        ],
        max_tokens: 400,
      }),
    });

    const data = await openAiResponse.json();

    if (!openAiResponse.ok) {
      const message = data?.error?.message ?? "Unable to retrieve an assistant response.";
      return NextResponse.json({ error: message }, { status: openAiResponse.status });
    }

    const reply = data?.choices?.[0]?.message?.content?.trim();

    if (!reply) {
      return NextResponse.json({ reply: fallbackResponse(prompt) });
    }

    return NextResponse.json({ reply });
  } catch (error) {
    return NextResponse.json({ reply: fallbackResponse(prompt) });
  }
}
