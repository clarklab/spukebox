# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Spukebox is a web-based Spotify jukebox application that allows users to search for tracks, manage a queue, and control playback through an intuitive interface. It's built as a static site with serverless functions, deployed on Netlify.

## Technology Stack

- **Frontend**: Vanilla JavaScript, HTML, CSS with Tailwind CSS v4 (CDN)
- **Backend**: Netlify Functions (serverless)
- **APIs**: Spotify Web API, Spotify Web Playback SDK
- **Deployment**: Netlify static hosting + serverless functions

## Essential Commands

```bash
# Install dependencies
npm install

# Run local development server (requires Netlify CLI)
netlify dev

# Build for production
npm run build
```

## Environment Setup

Create a `.env` file with the following Spotify app credentials:
```
SPOTIFY_CLIENT_ID=your_client_id
SPOTIFY_CLIENT_SECRET=your_client_secret
SPOTIFY_REDIRECT_URI=http://localhost:8888
```

## Architecture

### Frontend (index.html)
Single-page application with all logic in one HTML file:
- Spotify Web Playback SDK for in-browser streaming
- Color Thief for dynamic background colors from album art
- LocalStorage for queue and token persistence
- Custom Circular Std font family

### Backend (netlify/functions/)
Three serverless endpoints:
- **auth.js**: Handles Spotify OAuth 2.0 flow (authorization, token exchange, refresh)
- **search.js**: Track search using client credentials flow
- **playback.js**: Controls playback on Spotify devices

### Key Workflows

1. **Authentication**: OAuth 2.0 authorization code flow with automatic token refresh
2. **Search**: Debounced search (300ms) with 10-result limit
3. **Queue Management**: LocalStorage-based queue with add/remove functionality
4. **Playback**: Web Playback SDK integration with real-time progress updates

## Development Guidelines

### State Management
- Use localStorage for persistent data (tokens, queue)
- Global variables for runtime state
- No state management libraries - keep it vanilla

### UI Updates
- Dynamic background colors extracted from album artwork
- Animated SVG elements during playback
- Progress bar updates every 100ms during playback
- Modal confirmations for user actions

### Error Handling
- Always handle token expiry with automatic refresh
- Provide user-friendly error messages
- Check for Spotify Premium requirement (Web Playback SDK)

### Performance
- Debounce search input (300ms)
- Minimize DOM manipulation
- Use efficient selectors when updating UI

## Important Notes

- Spotify Web Playback SDK requires a Spotify Premium account
- The app requires users to have the Spotify app open on at least one device
- All Spotify API interactions go through the serverless functions
- The build process simply copies files to dist/ - no bundling or transpilation