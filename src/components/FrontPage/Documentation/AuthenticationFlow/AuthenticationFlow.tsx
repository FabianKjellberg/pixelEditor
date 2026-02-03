import React from 'react';
import DocumentationSection from '../DocumentationSection/DocumentationSection';
import FlowchartItem, { FlowchartItemProps } from '../FlowchartItem/FlowchartItem';

const flowcharts: Omit<FlowchartItemProps, 'showDivider'>[] = [
  {
    stepNumber: 1,
    title: 'Login Flow (POST /auth/login)',
    description:
      'When a user logs in, the server validates their credentials against the database. If everything checks out, it creates a new session and generates both a short-lived JWT access token (returned in the response body) and a refresh token (stored as an httpOnly cookie for security).',
    imageSrc: '/flowcharts/Login_FLow.jpg',
    imageAlt: 'Login Flow',
  },
  {
    stepNumber: 2,
    title: 'Server Auth Middleware',
    description:
      "Every incoming request passes through the server's routing logic. Public routes skip authentication entirely, while protected routes run through middleware that validates the JWT access token. Valid tokens proceed to the handler; invalid or expired tokens get a 401 response.",
    imageSrc: '/flowcharts/Server_Handler.jpg',
    imageAlt: 'Server Auth Middleware Flow',
  },
  {
    stepNumber: 3,
    title: 'API Client (Token Expiry Handling)',
    description:
      'The frontend API client has built-in retry logic for handling expired tokens. If any request returns a 401, it automatically attempts to refresh the access token. On success, it retries the original request once. If the refresh fails, the user gets logged out.',
    imageSrc: '/flowcharts/API_Client.jpg',
    imageAlt: 'API Client Flow',
  },
  {
    stepNumber: 4,
    title: 'Refresh Flow (POST /auth/refresh)',
    description:
      'The refresh endpoint uses rotating refresh tokens for added security. When called, it validates the current refresh token, immediately invalidates it, and issues a brand new pair of tokens. This means each refresh token can only be used once, limiting the damage if one gets compromised.',
    imageSrc: '/flowcharts/Refresh_FLow.jpg',
    imageAlt: 'Refresh Flow',
  },
  {
    stepNumber: 5,
    title: 'Logout Flow (POST /auth/logout)',
    description:
      "Logging out properly cleans up the server-side session. The handler invalidates both the session and any associated refresh tokens in the database, then clears the httpOnly cookie. This ensures the tokens can't be reused even if someone had captured them.",
    imageSrc: '/flowcharts/Logout_Flow.jpg',
    imageAlt: 'Logout Flow',
  },
];

const securityNotes = [
  'Access tokens are short-lived (minutes) and stored only in memory',
  'Refresh tokens are httpOnly cookies (not accessible via JavaScript)',
  'Refresh tokens rotate on each use (old tokens become invalid)',
  'Passwords are hashed with bcrypt before storage',
];

const AuthenticationFlow = () => {
  return (
    <DocumentationSection title="Authentication Flow">
      <p>
        The authentication system uses short-lived JWT access tokens combined with rotating
        refresh tokens stored in httpOnly cookies for security.
      </p>

      {flowcharts.map((flowchart, index) => (
        <FlowchartItem
          key={flowchart.stepNumber}
          {...flowchart}
          showDivider={index < flowcharts.length - 1}
        />
      ))}

      <p style={{ marginTop: '16px' }}>
        <b>Security notes:</b>
      </p>
      <ul style={{ marginLeft: '30px', marginTop: '8px' }}>
        {securityNotes.map((note, index) => (
          <li key={index}>
            <p>{note}</p>
          </li>
        ))}
      </ul>
    </DocumentationSection>
  );
};

export default AuthenticationFlow;
