import { Handler } from '@netlify/functions';
import fetch from 'node-fetch';

const HEYREACH_API = process.env.HEYREACH_API_URL || 'https://api.heyreach.io/api/public';

const handler: Handler = async (event) => {
  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, X-API-KEY',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers
    };
  }

  const apiKey = event.headers['x-api-key'];
  if (!apiKey) {
    return {
      statusCode: 401,
      headers,
      body: JSON.stringify({ error: 'API key is required' })
    };
  }

  try {
    // Get the endpoint from the path
    const endpoint = event.path.replace('/.netlify/functions/heyreach-proxy', '');
    const url = `${HEYREACH_API}${endpoint}`;

    const response = await fetch(url, {
      method: event.httpMethod,
      headers: {
        'X-API-KEY': apiKey,
        'Content-Type': 'application/json',
        'Accept': 'text/plain'
      },
      body: event.body || undefined
    });

    const data = await response.text();

    return {
      statusCode: response.status,
      headers: {
        ...headers,
        'Content-Type': 'application/json'
      },
      body: data
    };
  } catch (error) {
    console.error('Proxy error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
};

export { handler };
