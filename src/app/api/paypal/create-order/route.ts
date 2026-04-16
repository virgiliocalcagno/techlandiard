import { NextResponse } from "next/server";

const BASE = process.env.PAYPAL_BASE_URL!;
const CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID!;
const SECRET = process.env.PAYPAL_SECRET!;

async function getAccessToken(): Promise<string> {
  const creds = Buffer.from(`${CLIENT_ID}:${SECRET}`).toString("base64");
  const res = await fetch(`${BASE}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${creds}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  if (!res.ok) {
    const body = await res.text();
    console.error(`[PayPal] Auth failed ${res.status}:`, body);
    throw new Error(`PayPal auth failed: ${res.status} — ${body}`);
  }

  const data = await res.json();
  return data.access_token as string;
}

export async function POST(request: Request) {
  try {
    const { amount, estimateNumber, estimateId } = await request.json();

    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    const token = await getAccessToken();

    const res = await fetch(`${BASE}/v2/checkout/orders`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "PayPal-Request-Id": `TECH-${estimateId}-${Date.now()}`, // idempotency key
      },
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [
          {
            reference_id: estimateId,
            description: `Cotización ${estimateNumber} — Techlandiard`,
            amount: {
              currency_code: "USD",
              value: Number(amount).toFixed(2),
            },
          },
        ],
        application_context: {
          brand_name: "Techlandiard",
          landing_page: "NO_PREFERENCE",
          user_action: "PAY_NOW",
          shipping_preference: "NO_SHIPPING",
        },
      }),
    });

    const order = await res.json();

    if (!res.ok) {
      console.error("[PayPal] Create order failed:", JSON.stringify(order, null, 2));
      return NextResponse.json(
        { error: "Failed to create PayPal order", details: order },
        { status: 500 }
      );
    }

    return NextResponse.json({ orderId: order.id });
  } catch (err) {
    console.error("create-order route error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
