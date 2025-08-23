import { NextResponse } from 'next/server';

export function apiResponse(
  data: any,
  status: number = 200,
  message?: string
) {
  return NextResponse.json(
    {
      success: status >= 200 && status < 300,
      message,
      data,
    },
    { status }
  );
}

export function errorResponse(
  error: string,
  status: number = 500,
  details?: any
) {
  return NextResponse.json(
    {
      success: false,
      error,
      details: process.env.NODE_ENV === 'development' ? details : undefined,
    },
    { status }
  );
}