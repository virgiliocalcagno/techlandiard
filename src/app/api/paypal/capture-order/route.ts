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

  if (!res.ok) throw new Error(`PayPal auth failed: ${res.status}`);
  const data = await res.json();
  return data.access_token as string;
}

export async function POST(request: Request) {
  try {
    const { orderId } = await request.json();

    if (!orderId) {
      return NextResponse.json({ error: "Missing orderId" }, { status: 400 });
    }

    const token = await getAccessToken();

    const res = await fetch(`${BASE}/v2/checkout/orders/${orderId}/capture`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const capture = await res.json();

    if (!res.ok) {
      console.error("PayPal capture error:", capture);
      return NextResponse.json({ error: "Capture failed", details: capture }, { status: 500 });
    }

    // Return the status and payer info for logging
    return NextResponse.json({
      status: capture.status,            // "COMPLETED" if successful
      orderId: capture.id,
      payerEmail: capture.payer?.email_address ?? null,
      payerName: `${capture.payer?.name?.given_name ?? ""} ${capture.payer?.name?.surname ?? ""}`.trim(),
    });
  } catch (err) {
    console.error("capture-order route error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
