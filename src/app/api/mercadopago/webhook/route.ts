import { NextRequest, NextResponse } from "next/server";

import { syncPreapproval } from "@/lib/mercadopago/sync";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    console.log("========== WEBHOOK ==========");
    console.dir(body, {
      depth: null,
    });

    if (
      body.type === "subscription_preapproval" &&
      body.data?.id
    ) {
      await syncPreapproval(body.data.id);
    }

    return NextResponse.json({
      ok: true,
    });

  } catch (error) {

    console.error(error);

    return NextResponse.json(
      {
        ok: false,
      },
      {
        status: 500,
      }
    );
  }
}