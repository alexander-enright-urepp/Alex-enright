import { NextResponse } from 'next/server';

const ONESIGNAL_APP_ID = process.env.ONESIGNAL_APP_ID;
const ONESIGNAL_API_KEY = process.env.ONESIGNAL_REST_API_KEY;

export async function POST(request: Request) {
  // Debug: Check if env vars are loaded
  console.log('Env check:', {
    appId: process.env.ONESIGNAL_APP_ID ? 'Set' : 'Missing',
    apiKey: process.env.ONESIGNAL_REST_API_KEY ? 'Set' : 'Missing'
  });
  
  try {
    const { title, body, data, include_player_ids } = await request.json();

    if (!title || !body) {
      return NextResponse.json(
        { error: 'Title and body are required' },
        { status: 400 }
      );
    }

    // Build OneSignal payload
    const payload: any = {
      app_id: ONESIGNAL_APP_ID,
      headings: { en: title },
      contents: { en: body },
      data: data || {},
    };

    // If player IDs provided, target them directly, otherwise use segments
    if (include_player_ids && include_player_ids.length > 0) {
      payload.include_player_ids = include_player_ids;
    } else {
      payload.included_segments = ['All', 'Active Users', 'Subscribed'];
    }

    const response = await fetch('https://onesignal.com/api/v1/notifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${ONESIGNAL_API_KEY}`,
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('OneSignal error:', result);
      return NextResponse.json(
        { error: 'Failed to send notification', details: result },
        { status: response.status }
      );
    }

    return NextResponse.json({
      success: true,
      recipients: result.recipients || 0,
      id: result.id,
    });
  } catch (error) {
    console.error('Push send error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
