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
          package_name: config.androidPackageName || 'ai.levantem.sirbro',
          sha256_cert_fingerprints: [
            '7e:5f:36:fb:27:5c:49:e2:68:58:a4:14:4d:84:c4:b2:47:2b:3f:ad:9d:30:37:71:89:cd:38:79:c8:57:9e:67'
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