import { NextResponse } from "next/server";

export type ApiResponse<T = any> = {
  success: boolean;
  data: T | null;
  error: string | null;
};

export function successResponse<T>(data: T, status = 200) {
  return NextResponse.json(
    {
      success: true,
      data,
      error: null,
    },
    { status }
  );
}

export function errorResponse(message: string, status = 400) {
  return NextResponse.json(
    {
      success: false,
      data: null,
      error: message,
    },
    { status }
  );
}
