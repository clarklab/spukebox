const SpotifyWebApi = require('spotify-web-api-node');

exports.handler = async (event, context) => {
  // Only allow GET requests
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { query, type = 'all' } = event.queryStringParameters;
    
    if (!query) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Query parameter is required' })
      };
    }

    // Initialize Spotify API client
    const spotifyApi = new SpotifyWebApi({
      clientId: process.env.SPOTIFY_CLIENT_ID,
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
    });

    // Get client credentials
    const data = await spotifyApi.clientCredentialsGrant();
    spotifyApi.setAccessToken(data.body['access_token']);

    let searchResults;
    const searchOptions = {
      limit: 20,
      market: 'US'
    };

    // Search based on type parameter
    switch (type) {
      case 'artist':
        // Search for tracks where the artist name matches
        searchResults = await spotifyApi.searchTracks(`artist:${query}`, searchOptions);
        break;
      case 'title':
        // Search for tracks where the track name matches
        searchResults = await spotifyApi.searchTracks(`track:${query}`, searchOptions);
        break;
      case 'all':
      default:
        // General search
        searchResults = await spotifyApi.searchTracks(query, searchOptions);
        break;
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET'
      },
      body: JSON.stringify(searchResults.body)
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to search tracks' })
    };
  }
}; 