import { NextResponse } from 'next/server';
import { getAppConfig } from '../../../lib/config';

export async function GET() {
  try {
    const config = getAppConfig();
    
    const assetLinks = [
      {
        relation: ['delegate_permission/common.handle_all_urls'],
        target: {
          namespace: 'android_app',
          package_name: config.androidPackageName || 'ai.levantem.tipsterbro',
          sha256_cert_fingerprints: [
            'DE:AE:7C:24:44:DF:73:56:24:F6:AE:30:E1:CD:EF:89:18:6A:02:10:B6:62:E5:4E:4E:FE:75:A3:03:D1:BD:9B'
          ]
        }
      }
    ];

    return NextResponse.json(assetLinks, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=300',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    });
  } catch (error) {
    console.error('Error serving assetlinks.json:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        }
      }
    );
  }
}

// Ensure only GET method is allowed
export async function POST() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}

export async function PUT() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}