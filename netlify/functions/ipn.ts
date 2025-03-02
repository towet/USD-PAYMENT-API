import { Handler } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl!, supabaseKey!);

const allowedOrigins = [
  'https://visa-expert.netlify.app',
  'https://global-visa-experts.netlify.app',
  'https://global-visa-experts-canada.netlify.app'
];

export const handler: Handler = async (event) => {
  const origin = event.headers.origin || '';
  
  // Check if origin is allowed
  if (!allowedOrigins.includes(origin)) {
    return {
      statusCode: 403,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ error: 'Origin not allowed' })
    };
  }

  // Handle OPTIONS preflight request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: {
        'Access-Control-Allow-Origin': origin,
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Max-Age': '86400'
      },
      body: ''
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': origin,
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
      },
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const data = JSON.parse(event.body || '{}');
    
    // Store the IPN notification in Supabase
    const { error } = await supabase
      .from('pesapal_notifications')
      .insert([
        {
          order_tracking_id: data.OrderTrackingId,
          order_merchant_reference: data.OrderMerchantReference,
          order_notification_type: data.OrderNotificationType,
          raw_data: data,
        },
      ]);

    if (error) throw error;

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': origin,
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
      },
      body: JSON.stringify({ status: 'success' }),
    };
  } catch (error) {
    console.error('Error processing IPN:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': origin,
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
      },
      body: JSON.stringify({ error: 'Failed to process IPN' }),
    };
  }
};
