import { Handler } from '@netlify/functions';
import axios from 'axios';

const PESAPAL_URL = 'https://pay.pesapal.com/v3';
const consumer_key = '94lXZNXKZK5RG43dF0qeb4wcPkzmutYG';
const consumer_secret = 'XWnqyb3y0rNi08lT7MgSLL3j1mU=';

const allowedOrigins = [
  'https://visa-expert.netlify.app',
  'https://global-visa-experts.netlify.app',
  'https://global-visa-experts-canada.netlify.app'
];

export const handler: Handler = async (event) => {
  const origin = event.headers.origin || '';
  const allowedOrigin = allowedOrigins.includes(origin) ? origin : allowedOrigins[0];

  // Handle OPTIONS preflight request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: {
        'Access-Control-Allow-Origin': allowedOrigin,
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Credentials': 'true',
        'Access-Control-Max-Age': '86400'
      },
      body: ''
    };
  }

  try {
    console.log('Getting token with credentials:', {
      consumer_key,
      consumer_secret_length: consumer_secret.length
    });

    const response = await axios.post(
      `${PESAPAL_URL}/api/Auth/RequestToken`,
      {
        consumer_key,
        consumer_secret,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      }
    );

    console.log('Token response:', response.data);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': allowedOrigin,
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Credentials': 'true'
      },
      body: JSON.stringify(response.data)
    };
  } catch (error) {
    console.error('Error getting token:', {
      error_message: error.message,
      response_data: error.response?.data,
      response_status: error.response?.status
    });
    
    return {
      statusCode: error.response?.status || 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': allowedOrigin,
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Credentials': 'true'
      },
      body: JSON.stringify({
        error: 'Failed to get token',
        details: error.response?.data || error.message
      })
    };
  }
};
