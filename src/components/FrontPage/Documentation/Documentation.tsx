import React from 'react';
import DatabaseSchema from './DatabaseSchema/DatabaseSchema';
import ApiDocumentation from './ApiDocumentation/ApiDocumentation';
import AuthenticationFlow from './AuthenticationFlow/AuthenticationFlow';

const Documentation = () => {
  return (
    <>
      <h2>Documentation</h2>
      <br />
      <p>
        Technical documentation for the pixel editor project. Here you&apos;ll find the database schema,
        API endpoints, and authentication flow.
      </p>
      <br />

      <DatabaseSchema />
      <ApiDocumentation />
      <AuthenticationFlow />
    </>
  );
};

export default Documentation;
