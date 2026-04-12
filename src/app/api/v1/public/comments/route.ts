import { NextResponse } from "next/server";
import { createCommentAction, getCommentsByPostAction } from "@/app/actions/comment.actions";

function getCorsHeaders(origin: string | null) {
  return {
    "Access-Control-Allow-Origin": origin || "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };
}

export async function OPTIONS(request: Request) {
  const origin = request.headers.get("origin");
  return new NextResponse(null, {
    status: 204,
    headers: getCorsHeaders(origin),
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Pass the payload to the server action, which encapsulates validation,
    // reCAPTCHA verification, and DB insertion logically.
    const result = await createCommentAction(body);

    if (!result.success) {
      const origin = request.headers.get("origin");
      return NextResponse.json(
        { error: result.error },
        { status: 400, headers: getCorsHeaders(origin) }
      );
    }

    const origin = request.headers.get("origin");
    return NextResponse.json({ success: true, data: result.data }, {
      headers: getCorsHeaders(origin),
    });
  } catch (error: any) {
    console.error("Public comments API Error:", error);
    const origin = request.headers.get("origin");
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500, headers: getCorsHeaders(origin) }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const postId = searchParams.get('postId');

    if (!postId) {
      return NextResponse.json({ error: "postId is required" }, { status: 400 });
    }

    const result = await getCommentsByPostAction(postId);

    if (!result.success) {
      const origin = request.headers.get("origin");
      return NextResponse.json({ error: result.error }, { status: 400, headers: getCorsHeaders(origin) });
    }

    const origin = request.headers.get("origin");
    return NextResponse.json({ success: true, data: result.data }, {
      headers: getCorsHeaders(origin),
    });
  } catch (error: any) {
    console.error("Public comments GET API Error:", error);
    const origin = request.headers.get("origin");
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500, headers: getCorsHeaders(origin) }
    );
  }
}
