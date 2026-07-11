import { NextResponse } from 'next/server';
import { products } from '@/app/lib/products';

export async function GET() {
  return NextResponse.json({ products });
}
