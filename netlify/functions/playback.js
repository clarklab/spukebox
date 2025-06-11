const SpotifyWebApi = require('spotify-web-api-node');

exports.handler = async function(event, context) {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    // Parse the request body
    const body = JSON.parse(event.body);
    const { action, trackId, accessToken } = body;

    console.log('Playback request:', { action, trackId, hasAccessToken: !!accessToken });

    if (!action || !trackId || !accessToken) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Allow-Methods': 'POST'
        },
        body: JSON.stringify({ error: 'Missing required parameters' })
      };
    }

    // Initialize Spotify API client with user's access token
    const spotifyApi = new SpotifyWebApi({
      accessToken: accessToken
    });

    // First, get available devices
    console.log('Getting available devices...');
    const devicesResponse = await spotifyApi.getMyDevices();
    console.log('Available devices:', devicesResponse.body.devices);

    if (!devicesResponse.body.devices || devicesResponse.body.devices.length === 0) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Allow-Methods': 'POST'
        },
        body: JSON.stringify({ error: 'No active devices found. Please open Spotify on a device.' })
      };
    }

    // Try to find an active device first
    let device = devicesResponse.body.devices.find(d => d.is_active);
    
    // If no active device, try to find a non-restricted device
    if (!device) {
      device = devicesResponse.body.devices.find(d => !d.is_restricted);
    }
    
    // If still no device, use the first one
    if (!device) {
      device = devicesResponse.body.devices[0];
    }

    console.log('Using device:', device);

    if (!device) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Allow-Methods': 'POST'
        },
        body: JSON.stringify({ error: 'No suitable device found for playback' })
      };
    }

    let response;
    switch (action) {
      case 'play':
        console.log('Attempting to play track:', trackId, 'on device:', device.id);
        try {
          response = await spotifyApi.play({
            uris: [`spotify:track:${trackId}`],
            device_id: device.id
          });
          console.log('Play response:', response);
        } catch (playError) {
          console.error('Error playing track:', playError);
          throw new Error(`Failed to play track: ${playError.message}`);
        }
        break;
      case 'pause':
        response = await spotifyApi.pause({
          device_id: device.id
        });
        break;
      case 'next':
        response = await spotifyApi.skipToNext({
          device_id: device.id
        });
        break;
      case 'previous':
        response = await spotifyApi.skipToPrevious({
          device_id: device.id
        });
        break;
      default:
        return {
          statusCode: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Allow-Methods': 'POST'
          },
          body: JSON.stringify({ error: 'Invalid action' })
        };
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST'
      },
      body: JSON.stringify({ success: true })
    };
  } catch (error) {
    console.error('Error in playback function:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST'
      },
      body: JSON.stringify({ 
        error: 'Playback failed',
        details: error.message,
        stack: error.stack
      })
    };
  }
}; 