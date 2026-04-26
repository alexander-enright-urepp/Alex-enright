import { NextResponse } from 'next/server';

const ONESIGNAL_APP_ID = process.env.ONESIGNAL_APP_ID!;
const ONESIGNAL_API_KEY = process.env.ONESIGNAL_REST_API_KEY!;

export async function POST(request: Request) {
  // Log environment variables (remove after debugging)
  console.log('ONESIGNAL_APP_ID:', process.env.ONESIGNAL_APP_ID ? 'Set' : 'Missing');
  console.log('ONESIGNAL_API_KEY:', process.env.ONESIGNAL_REST_API_KEY ? 'Set' : 'Missing');
  
  try {
    const { title, body, data, targetSegment = 'All' } = await request.json();

    if (!title || !body) {
      return NextResponse.json(
        { error: 'Title and body are required' },
        { status: 400 }
      );
    }

    const response = await fetch('https://onesignal.com/api/v1/notifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${ONESIGNAL_API_KEY}`,
      },
      body: JSON.stringify({
        app_id: ONESIGNAL_APP_ID,
        headings: { en: title },
        contents: { en: body },
        included_segments: [targetSegment],
        data: data || {},
      }),
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
