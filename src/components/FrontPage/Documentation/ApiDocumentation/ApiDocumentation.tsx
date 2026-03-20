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
      {
        status: '500 Internal Server Error',
        body: `{
  "error": "Internal server error"
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
      {
        status: '500 Internal Server Error',
        body: `{
  "error": "Internal server error"
}`,
      },
    ],
  },
  {
    method: 'POST',
    path: '/auth/refresh',
    authType: 'cookie',
    description:
      'Exchange refresh token cookie for a new access token. The refresh token is rotated.',
    requestNote:
      'Requires <code>refresh_token</code> httpOnly cookie (automatically sent by browser)',
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
        note: 'Also returned when <code>refresh_token</code> cookie is missing',
      },
      {
        status: '500 Internal Server Error',
        body: `{
  "error": "Internal server error"
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
        note: 'Returned when <code>refresh_token</code> cookie is missing',
      },
      {
        status: '500 Internal Server Error',
        body: `{
  "error": "Internal server error"
}`,
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
        body: `{
  "message": "Unauthorized"
}`,
        note: 'Returned when Authorization header is missing',
      },
      {
        status: '401 Unauthorized',
        body: `{
  "message": "Invalid or expired token"
}`,
        note: 'Returned when token is invalid or expired',
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
      {
        status: '401 Unauthorized',
        body: `{
  "message": "Unauthorized"
}`,
        note: 'Returned when Authorization header is missing or invalid',
      },
      {
        status: '401 Unauthorized',
        body: `{
  "message": "Invalid or expired token"
}`,
        note: 'Returned when token is invalid or expired',
      },
      {
        status: '500 Internal Server Error',
        body: `{
  "error": "Internal server error"
}`,
      },
    ],
  },
];

const projectEndpoints: ApiEndpointProps[] = [
  {
    method: 'POST',
    path: '/project/create',
    authType: 'bearer',
    description:
      'Create a new project. Returns signed upload URLs for the preview image and each layer; client uploads binary data to those URLs.',
    requestBody: `{
  "project": {
    "id": "uuid-string",
    "name": "string",
    "width": number,
    "height": number
  },
  "layers": [
    {
      "type": "layer",
      "id": "uuid-string",
      "name": "string",
      "width": number,
      "height": number,
      "x": number,
      "y": number,
      "zIndex": number,
      "length": number,
      "visible": boolean,
      "opacity": number
    },
    {
      "type": "group-start",
      "id": "uuid-string",
      "zIndex": number,
      "name": "string",
      "collapsed": boolean
    },
    {
      "type": "group-end",
      "id": "uuid-string",
      "zIndex": number
    }
  ]
}`,
    responses: [
      {
        status: '200 OK',
        body: `{
  "projectId": "uuid-string",
  "preview": {
    "key": "string",
    "uploadUrl": "string",
    "headers": { "Content-Type": "string" }
  },
  "layers": [
    {
      "layerId": "uuid-string",
      "key": "string",
      "uploadUrl": "string",
      "headers": { "Content-Type": "string" }
    }
  ],
  "expiration": "string"
}`,
      },
      {
        status: '401 Unauthorized',
        body: `{
  "message": "Unauthorized"
}`,
        note: 'Returned when Authorization header is missing or invalid',
      },
      {
        status: '401 Unauthorized',
        body: `{
  "message": "Invalid or expired token"
}`,
        note: 'Returned when token is invalid or expired',
      },
      {
        status: '409 Conflict',
        body: `"project already exists"`,
      },
      {
        status: '500 Internal Server Error',
        body: `{
  "error": "Internal server error"
}`,
      },
    ],
  },
  {
    method: 'GET',
    path: '/project/previews',
    authType: 'bearer',
    description: 'Get previews of all projects belonging to the authenticated user.',
    responses: [
      {
        status: '200 OK',
        body: `[
  {
    "id": "uuid-string",
    "name": "string",
    "signedPreviewUrl": "string",
    "createdAt": "ISO8601",
    "latestActivity": "ISO8601" | null
  }
]`,
      },
      {
        status: '401 Unauthorized',
        body: `{
  "message": "Unauthorized"
}`,
        note: 'Returned when Authorization header is missing or invalid',
      },
      {
        status: '401 Unauthorized',
        body: `{
  "message": "Invalid or expired token"
}`,
        note: 'Returned when token is invalid or expired',
      },
      {
        status: '500 Internal Server Error',
        body: `{
  "error": "Internal server error"
}`,
      },
    ],
  },
  {
    method: 'GET',
    path: '/project/:projectId',
    authType: 'bearer',
    description:
      'Get a single project with its layers (metadata and signed blob URLs for layer data).',
    responses: [
      {
        status: '200 OK',
        body: `{
  "project": {
    "id": "uuid-string",
    "name": "string",
    "width": number,
    "height": number,
    "createdAt": "ISO8601",
    "latestActivity": "ISO8601" | null
  },
  "layers": [
    {
      "type": "layer",
      "id": "uuid-string",
      "name": "string",
      "signedBlobUrl": "string",
      "width": number,
      "height": number,
      "x": number,
      "y": number,
      "zIndex": number,
      "opacity": number,
      "visible": boolean
    },
    {
      "type": "group-start",
      "id": "uuid-string",
      "projectId": "uuid-string",
      "name": "string",
      "collapsed": boolean,
      "zIndex": number
    },
    {
      "type": "group-end",
      "id": "uuid-string",
      "projectId": "uuid-string",
      "zIndex": number
    }
  ]
}`,
      },
      {
        status: '401 Unauthorized',
        body: `{
  "message": "Unauthorized"
}`,
        note: 'Returned when Authorization header is missing or invalid',
      },
      {
        status: '401 Unauthorized',
        body: `{
  "message": "Invalid or expired token"
}`,
        note: 'Returned when token is invalid or expired',
      },
      {
        status: '404 Not Found',
        body: `{
  "message": "project not found"
}`,
      },
      {
        status: '500 Internal Server Error',
        body: `{
  "error": "Internal server error"
}`,
      },
    ],
  },
  {
    method: 'PUT',
    path: '/project/size',
    authType: 'bearer',
    description:
      'Update canvas dimensions of a synced project. Returns signed preview upload URL; client uploads new preview image.',
    requestBody: `{
  "projectId": "uuid-string",
  "width": number,
  "height": number
}`,
    responses: [
      {
        status: '200 OK',
        body: `{
  "previewUrl": "string"
}`,
      },
      {
        status: '401 Unauthorized',
        body: `{
  "message": "Unauthorized"
}`,
        note: 'Returned when Authorization header is missing or invalid',
      },
      {
        status: '401 Unauthorized',
        body: `{
  "message": "Invalid or expired token"
}`,
        note: 'Returned when token is invalid or expired',
      },
      {
        status: '404 Not Found',
        body: `{
  "message": "not found"
}`,
      },
      {
        status: '500 Internal Server Error',
        body: `{
  "error": "Internal server error"
}`,
      },
    ],
  },
  {
    method: 'PUT',
    path: '/project/order',
    authType: 'bearer',
    description: 'Update the ordering (layer z-index/ranges) of layers and groups in a project.',
    requestBody: `{
  "projectId": "uuid-string",
  "order": [
    { "type": "layer", "id": "uuid-string", "index": number },
    { "type": "group-start", "id": "uuid-string", "index": number },
    { "type": "group-end", "id": "uuid-string", "index": number }
  ]
}`,
    responses: [
      {
        status: '200 OK',
        body: `{
  "message": "updated order successfully"
}`,
      },
      {
        status: '401 Unauthorized',
        body: `{
  "message": "Unauthorized"
}`,
        note: 'Returned when Authorization header is missing or invalid',
      },
      {
        status: '404 Not Found',
        body: `{
  "message": "unable to find project"
}`,
      },
      {
        status: '500 Internal Server Error',
        body: `{
  "error": "Internal server error"
}`,
      },
    ],
  },
  {
    method: 'DELETE',
    path: '/project/delete-items',
    authType: 'bearer',
    description: 'Delete one or more layers and/or groups from a project. Optionally returns a signed preview upload URL.',
    requestBody: `{
  "ids": ["uuid-string"],
  "shouldPreview": boolean,
  "projectId": "uuid-string"
}`,
    responses: [
      {
        status: '200 OK',
        body: `{
  "previewUrl": "string"
}`,
      },
      {
        status: '401 Unauthorized',
        body: `{
  "message": "Unauthorized"
}`,
        note: 'Returned when Authorization header is missing or invalid',
      },
      {
        status: '404 Not Found',
        body: `{
  "message": "one or more items not found"
}`,
      },
      {
        status: '500 Internal Server Error',
        body: `{
  "error": "Internal server error"
}`,
      },
    ],
  },
  {
    method: 'PUT',
    path: '/project/update-metadata',
    authType: 'bearer',
    description: 'Update layer/group metadata (visibility, opacity, collapse and rename) in a single batch.',
    requestBody: `{
  "projectId": "uuid-string",
  "changes": [
    { "type": "name", "id": "uuid-string", "name": "string" },
    { "type": "visible", "id": "uuid-string", "visible": boolean },
    { "type": "opacity", "id": "uuid-string", "opacity": number },
    { "type": "collapse", "id": "uuid-string", "collapsed": boolean }
  ]
}`,
    responses: [
      {
        status: '200 OK',
        body: `{
  "message": "successfully update metadata"
}`,
      },
      {
        status: '401 Unauthorized',
        body: `{
  "message": "Unauthorized"
}`,
      },
      {
        status: '404 Not Found',
        body: `{
  "message": "not found"
}`,
      },
      {
        status: '500 Internal Server Error',
        body: `{
  "error": "internal server error"
}`,
      },
    ],
  },
];

const groupEndpoints: ApiEndpointProps[] = [
  {
    method: 'POST',
    path: '/group/create',
    authType: 'bearer',
    description: 'Create a new collapsible layer group and define its range in the layer tree.',
    requestBody: `{
  "projectId": "uuid-string",
  "id": "uuid-string",
  "collapsed": boolean,
  "name": "string",
  "startIndex": number,
  "endIndex": number
}`,
    responses: [
      {
        status: '200 OK',
        body: `{
  "message": "successfully added group"
}`,
      },
      {
        status: '401 Unauthorized',
        body: `{
  "message": "Unauthorized"
}`,
        note: 'Returned when Authorization header is missing or invalid',
      },
      {
        status: '404 Not Found',
        body: `{
  "message": "not found"
}`,
      },
      {
        status: '500 Internal Server Error',
        body: `{
  "error": "Internal server error"
}`,
      },
    ],
  },
];

const layerEndpoints: ApiEndpointProps[] = [
  {
    method: 'PUT',
    path: '/layer/save',
    authType: 'bearer',
    description:
      'Save a layer. Returns signed upload URLs for the layer pixels and project preview; client uploads binary data to those URLs.',
    requestBody: `{
  "layerId": "uuid-string",
  "x": number,
  "y": number,
  "width": number,
  "height": number,
  "length": number
}`,
    responses: [
      {
        status: '200 OK',
        body: `{
  "layerUrl": "string",
  "previewUrl": "string"
}`,
      },
      {
        status: '401 Unauthorized',
        body: `{
  "message": "Unauthorized"
}`,
        note: 'Returned when Authorization header is missing or invalid',
      },
      {
        status: '401 Unauthorized',
        body: `{
  "message": "Invalid or expired token"
}`,
        note: 'Returned when token is invalid or expired',
      },
      {
        status: '404 Not Found',
        body: `"not found"`,
        note: 'Returned when layer or project is not found or not owned by user',
      },
      {
        status: '500 Internal Server Error',
        body: `{
  "error": "Internal server error"
}`,
      },
    ],
  },
  {
    method: 'DELETE',
    path: '/layer/delete',
    authType: 'bearer',
    description:
      'Delete a layer. If shouldPreview is true, returns a signed preview upload URL; client uploads new preview image.',
    requestBody: `{
  "layerId": "uuid-string",
  "shouldPreview": boolean
}`,
    responses: [
      {
        status: '200 OK',
        body: `{
  "previewUrl": "string"
}`,
      },
      {
        status: '401 Unauthorized',
        body: `{
  "message": "Unauthorized"
}`,
        note: 'Returned when Authorization header is missing or invalid',
      },
      {
        status: '401 Unauthorized',
        body: `{
  "message": "Invalid or expired token"
}`,
        note: 'Returned when token is invalid or expired',
      },
      {
        status: '404 Not Found',
        body: `{
  "message": "not found"
}`,
      },
      {
        status: '500 Internal Server Error',
        body: `{
  "error": "Internal server error"
}`,
      },
    ],
  },
  {
    method: 'POST',
    path: '/layer/create',
    authType: 'bearer',
    description:
      'Create a new layer. Returns signed upload URLs for the layer pixels and optionally preview; client uploads binary data.',
    requestBody: `{
  "projectId": "uuid-string",
  "layerId": "uuid-string",
  "name": "string",
  "x": number,
  "y": number,
  "width": number,
  "height": number,
  "length": number,
  "zIndex": number (optional)
}`,
    responses: [
      {
        status: '200 OK',
        body: `{
  "layerUrL": "string",
  "previewUrl": "string"
}`,
      },
      {
        status: '401 Unauthorized',
        body: `{
  "message": "Unauthorized"
}`,
        note: 'Returned when Authorization header is missing or invalid',
      },
      {
        status: '401 Unauthorized',
        body: `{
  "message": "Invalid or expired token"
}`,
        note: 'Returned when token is invalid or expired',
      },
      {
        status: '404 Not Found',
        body: `{
  "message": "not found"
}`,
      },
      {
        status: '500 Internal Server Error',
        body: `{
  "error": "Internal server error"
}`,
      },
    ],
  },
  {
    method: 'PUT',
    path: '/layer/name',
    authType: 'bearer',
    description: 'Rename a layer.',
    requestBody: `{
  "layerId": "uuid-string",
  "name": "string"
}`,
    responses: [
      {
        status: '200 OK',
        body: `{
  "message": "successfully changed name"
}`,
      },
      {
        status: '401 Unauthorized',
        body: `{
  "message": "Unauthorized"
}`,
        note: 'Returned when Authorization header is missing or invalid',
      },
      {
        status: '401 Unauthorized',
        body: `{
  "message": "Invalid or expired token"
}`,
        note: 'Returned when token is invalid or expired',
      },
      {
        status: '404 Not Found',
        body: `{
  "message": "not found"
}`,
      },
      {
        status: '500 Internal Server Error',
        body: `{
  "error": "Internal server error"
}`,
      },
    ],
  },
  {
    method: 'PUT',
    path: '/layer/move',
    authType: 'bearer',
    description:
      'Reorder layers. Returns a signed preview upload URL; client uploads new preview image.',
    requestBody: `{
  "layerIndexes": [
    { "layerId": "uuid-string", "zIndex": number }
  ]
}`,
    responses: [
      {
        status: '200 OK',
        body: `{
  "previewUrl": "string"
}`,
      },
      {
        status: '401 Unauthorized',
        body: `{
  "message": "Unauthorized"
}`,
        note: 'Returned when Authorization header is missing or invalid',
      },
      {
        status: '401 Unauthorized',
        body: `{
  "message": "Invalid or expired token"
}`,
        note: 'Returned when token is invalid or expired',
      },
      {
        status: '404 Not Found',
        body: `{
  "message": "not found"
}`,
      },
      {
        status: '500 Internal Server Error',
        body: `{
  "error": "Internal server error"
}`,
      },
    ],
  },
];

const ApiDocumentation = () => {
  return (
    <DocumentationSection title="API Documentation">
      <p>
        The backend is built with Hono and runs on Cloudflare Workers. Click on any endpoint to
        expand and see request/response details.
      </p>

      <h4 style={{ marginTop: '20px', marginBottom: '12px' }}>Auth Endpoints</h4>
      {authEndpoints.map((endpoint) => (
        <ApiEndpoint key={`${endpoint.method}-${endpoint.path}`} {...endpoint} />
      ))}

      <h4 style={{ marginTop: '20px', marginBottom: '12px' }}>User Endpoints</h4>
      {userEndpoints.map((endpoint) => (
        <ApiEndpoint key={`${endpoint.method}-${endpoint.path}`} {...endpoint} />
      ))}

      <h4 style={{ marginTop: '20px', marginBottom: '12px' }}>Project Endpoints</h4>
      {projectEndpoints.map((endpoint) => (
        <ApiEndpoint key={`${endpoint.method}-${endpoint.path}`} {...endpoint} />
      ))}

      <h4 style={{ marginTop: '20px', marginBottom: '12px' }}>Group Endpoints</h4>
      {groupEndpoints.map((endpoint) => (
        <ApiEndpoint key={`${endpoint.method}-${endpoint.path}`} {...endpoint} />
      ))}

      <h4 style={{ marginTop: '20px', marginBottom: '12px' }}>Layer Endpoints</h4>
      {layerEndpoints.map((endpoint) => (
        <ApiEndpoint key={`${endpoint.method}-${endpoint.path}`} {...endpoint} />
      ))}
    </DocumentationSection>
  );
};

export default ApiDocumentation;
