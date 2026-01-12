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
            '7e:5f:36:fb:27:5c:49:e2:68:58:a4:14:4d:84:c4:b2:47:2b:3f:ad:9d:30:37:71:89:cd:38:79:c8:57:9e:67',
            'D1:2B:7F:E0:B4:7D:2B:18:15:3A:4B:75:3F:4E:F4:AC:C1:D9:F1:17:76:4A:DB:9C:70:2C:64:C2:8D:9D:02:60',
            'de:ae:7c:24:44:df:73:56:24:f6:ae:30:e1:cd:ef:89:18:6a:02:10:b6:62:e5:4e:4e:fe:75:a3:03:d1:bd:9b'
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