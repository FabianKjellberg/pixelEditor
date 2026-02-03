import React from 'react';
import DocumentationSection from '../DocumentationSection/DocumentationSection';
import ApiEndpoint, { ApiEndpointProps } from '../ApiEndpoint/ApiEndpoint';

const authEndpoints: ApiEndpointProps[] = [
  {
    method: 'POST',
    path: '/auth/register',
    authType: 'credentials',
    description: 'Create a new user account with username and password.',
    requestBody: `{
  "username": "string",
  "password": "string"
}`,
    responses: [
      {
        status: '200 OK',
        body: `{
  "message": "user created successfully"
}`,
      },
      {
        status: '409 Conflict',
        body: `{
  "error": "username already exists"
}`,
      },
    ],
  },
  {
    method: 'POST',
    path: '/auth/login',
    authType: 'credentials',
    description: 'Authenticate and receive an access token. Sets a httpOnly refresh token cookie.',
    requestBody: `{
  "username": "string",
  "password": "string"
}`,
    responses: [
      {
        status: '200 OK',
        body: `{
  "message": "successfully logged in",
  "accessToken": "eyJhbGciOiJIUzI1NiIs..."
}`,
        note: 'Also sets <code>refresh_token</code> httpOnly cookie',
      },
      {
        status: '401 Unauthorized',
        body: `{
  "error": "invalid credentials"
}`,
      },
    ],
  },
  {
    method: 'POST',
    path: '/auth/refresh',
    authType: 'cookie',
    description: 'Exchange refresh token cookie for a new access token. The refresh token is rotated.',
    requestNote: 'Requires <code>refresh_token</code> httpOnly cookie (automatically sent by browser)',
    responses: [
      {
        status: '200 OK',
        body: `{
  "message": "refreshed succesfull",
  "accessToken": "eyJhbGciOiJIUzI1NiIs..."
}`,
        note: 'Sets new rotated <code>refresh_token</code> httpOnly cookie',
      },
      {
        status: '401 Unauthorized',
        body: `{
  "message": "no valid refreshToken found, unauthorized"
}`,
      },
    ],
  },
  {
    method: 'POST',
    path: '/auth/logout',
    authType: 'cookie',
    description: 'Invalidate the current session and clear the refresh token cookie.',
    requestNote: 'Requires <code>refresh_token</code> httpOnly cookie',
    responses: [
      {
        status: '200 OK',
        body: `{
  "message": "logout succesffully"
}`,
        note: 'Clears <code>refresh_token</code> cookie',
      },
      {
        status: '400 Bad Request',
        body: `"no cookie found"`,
      },
    ],
  },
  {
    method: 'GET',
    path: '/auth/test-auth',
    authType: 'bearer',
    description: 'Test endpoint to verify authentication is working correctly.',
    responses: [
      {
        status: '200 OK',
        body: `{
  "message": "authenticated correctly",
  "userId": "uuid-string"
}`,
      },
      {
        status: '401 Unauthorized',
        note: 'Returned when token is missing, invalid, or expired',
      },
    ],
  },
];

const userEndpoints: ApiEndpointProps[] = [
  {
    method: 'GET',
    path: '/user/me',
    authType: 'bearer',
    description: "Get the currently authenticated user's profile information.",
    responses: [
      {
        status: '200 OK',
        body: `{
  "userId": "uuid-string",
  "username": "string",
  "createdAt": "2026-01-15T12:00:00.000Z",
  "latestActivity": "2026-02-01T15:30:00.000Z" | null
}`,
      },
    ],
  },
];

const ApiDocumentation = () => {
  return (
    <DocumentationSection title="API Documentation">
      <p>
        The backend is built with Hono and runs on Cloudflare Workers. Click on any endpoint
        to expand and see request/response details.
      </p>

      <h4 style={{ marginTop: '20px', marginBottom: '12px' }}>Auth Endpoints</h4>
      {authEndpoints.map((endpoint) => (
        <ApiEndpoint key={`${endpoint.method}-${endpoint.path}`} {...endpoint} />
      ))}

      <h4 style={{ marginTop: '20px', marginBottom: '12px' }}>User Endpoints</h4>
      {userEndpoints.map((endpoint) => (
        <ApiEndpoint key={`${endpoint.method}-${endpoint.path}`} {...endpoint} />
      ))}
    </DocumentationSection>
  );
};

export default ApiDocumentation;
