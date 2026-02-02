import { NextResponse } from 'next/server';
import { getAppConfig } from '../../../lib/config';

export async function GET() {
  try {
    const config = getAppConfig();
    
    // Use placeholder if iOS Team ID is not set
    const teamId = config.iosTeamId;
    const bundleId = config.iosBundle || 'ai.levantem.sirbro';
    
    const appSiteAssociation = {
      applinks: {
        details: [
          {
            appIDs: [`${teamId}.${bundleId}`],
            components: [
              {
                "/": "/channels/join",
                "comment": "Channel join deep link"
              },
              {
                "/": "/*",
                "comment": "All other app links"
              }
            ]
          }
        ]
      },
      webcredentials: {
        apps: [`${teamId}.${bundleId}`]
      }
    };

    return NextResponse.json(appSiteAssociation, {
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
    console.error('Error serving apple-app-site-association:', error);
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