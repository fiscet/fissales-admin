import { NextResponse } from 'next/server';
import { getApiServerType, getServerTypeDisplay } from '@/lib/api-config';

export async function GET() {
  try {
    const serverType = getApiServerType();
    const displayName = getServerTypeDisplay();

    return NextResponse.json({
      success: true,
      data: {
        serverType,
        displayName,
      },
    });
  } catch (error) {
    console.error('Error getting server type:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
