// SPDX-License-Identifier: MIT
import { NextRequest, NextResponse } from 'next/server';

export function GET(request: NextRequest) {
  const target = new URL('/ui/', request.url);
  target.search = request.nextUrl.search;
  return NextResponse.redirect(target, 307);
}
