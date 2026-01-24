/**
 * Netlify Function para obtener el Client ID de Google Drive
 * Solo disponible cuando hay OWNER_TOKEN (verificado en el cliente)
 * Controlado por variable de entorno:
 * - GM_VAULT_GOOGLE_CLIENT_ID: Client ID de OAuth
 */

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET, OPTIONS'
};

exports.handler = async (event, context) => {
  // Manejar CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: ''
    };
  }

  // Solo permitir método GET
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    // Obtener el Client ID desde variable de entorno
    const clientId = process.env.GM_VAULT_GOOGLE_CLIENT_ID;
    
    // Si no hay Client ID configurado, retornar null
    if (!clientId) {
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          ...CORS_HEADERS
        },
        body: JSON.stringify({ 
          clientId: null,
          error: 'Google Drive Client ID not configured'
        })
      };
    }
    
    // Retornar el Client ID
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        ...CORS_HEADERS
      },
      body: JSON.stringify({ 
        clientId
      })
    };
  } catch (error) {
    console.error('Error getting Google Drive Client ID:', error);
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({ 
        error: error.message || 'Internal server error',
        clientId: null
      })
    };
  }
};
