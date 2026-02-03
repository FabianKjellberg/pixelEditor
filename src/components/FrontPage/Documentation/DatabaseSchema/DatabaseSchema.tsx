import React from 'react';
import DocumentationSection from '../DocumentationSection/DocumentationSection';
import SchemaTable, { TableColumn } from '../SchemaTable/SchemaTable';

const usersColumns: TableColumn[] = [
  { name: 'id', type: 'TEXT', constraints: 'PRIMARY KEY', description: 'UUID identifier' },
  { name: 'username', type: 'TEXT', constraints: 'NOT NULL, UNIQUE', description: "User's display name" },
  { name: 'password_hash', type: 'TEXT', constraints: 'NOT NULL', description: 'Bcrypt hashed password' },
  { name: 'latest_activity', type: 'TEXT', constraints: 'NULLABLE', description: 'Timestamp of last activity' },
  { name: 'created_at', type: 'TEXT', constraints: 'NOT NULL, DEFAULT NOW', description: 'Account creation timestamp' },
];

const projectColumns: TableColumn[] = [
  { name: 'id', type: 'TEXT', constraints: 'PRIMARY KEY', description: 'UUID identifier' },
  { name: 'user_id', type: 'TEXT', constraints: 'NOT NULL, FK -> users', description: 'Owner of the project' },
  { name: 'name', type: 'TEXT', constraints: 'NOT NULL', description: 'Project name' },
  { name: 'preview_key', type: 'TEXT', constraints: 'NULLABLE', description: 'Key for preview image in storage' },
  { name: 'created_at', type: 'TEXT', constraints: 'NOT NULL, DEFAULT NOW', description: 'Creation timestamp' },
  { name: 'latest_activity', type: 'TEXT', constraints: 'NULLABLE', description: 'Last modification timestamp' },
];

const layerColumns: TableColumn[] = [
  { name: 'id', type: 'TEXT', constraints: 'PRIMARY KEY', description: 'UUID identifier' },
  { name: 'blob_key', type: 'TEXT', constraints: 'NULLABLE', description: 'Key for layer data in blob storage' },
  { name: 'project_id', type: 'TEXT', constraints: 'NOT NULL, FK -> project', description: 'Parent project' },
  { name: 'name', type: 'TEXT', constraints: 'NULLABLE', description: 'Layer name' },
  { name: 'width', type: 'INTEGER', constraints: 'NULLABLE', description: 'Layer width in pixels' },
  { name: 'height', type: 'INTEGER', constraints: 'NULLABLE', description: 'Layer height in pixels' },
  { name: 'length', type: 'INTEGER', constraints: 'NULLABLE', description: 'Data length' },
  { name: 'z_index', type: 'INTEGER', constraints: 'NOT NULL, DEFAULT 0', description: 'Stacking order' },
];

const refreshSessionColumns: TableColumn[] = [
  { name: 'id', type: 'TEXT', constraints: 'PRIMARY KEY', description: 'UUID identifier' },
  { name: 'user_id', type: 'TEXT', constraints: 'NOT NULL, FK -> users', description: 'Session owner' },
  { name: 'invalidated_at', type: 'TEXT', constraints: 'NULLABLE', description: 'When session was invalidated' },
  { name: 'valid_to', type: 'TEXT', constraints: 'NOT NULL', description: 'Session expiry (30 days)' },
  { name: 'created_at', type: 'TEXT', constraints: 'NOT NULL, DEFAULT NOW', description: 'Session creation timestamp' },
];

const refreshTokenColumns: TableColumn[] = [
  { name: 'id', type: 'TEXT', constraints: 'PRIMARY KEY', description: 'UUID identifier' },
  { name: 'refresh_session_id', type: 'TEXT', constraints: 'NOT NULL, FK -> refresh_session', description: 'Parent session' },
  { name: 'token_hash', type: 'TEXT', constraints: 'NOT NULL, UNIQUE', description: 'Hashed refresh token' },
  { name: 'invalidated_at', type: 'TEXT', constraints: 'NULLABLE', description: 'When token was rotated/invalidated' },
  { name: 'valid_to', type: 'TEXT', constraints: 'NOT NULL', description: 'Token expiry (7 days)' },
  { name: 'created_at', type: 'TEXT', constraints: 'NOT NULL, DEFAULT NOW', description: 'Token creation timestamp' },
];

const DatabaseSchema = () => {
  return (
    <DocumentationSection title="Database Schema">
      <p>
        The backend uses SQLite (via Cloudflare D1) with the following tables. Foreign keys
        cascade on delete and update.
      </p>

      <SchemaTable tableName="users" columns={usersColumns} />
      <SchemaTable tableName="project" columns={projectColumns} />
      <SchemaTable tableName="layer" columns={layerColumns} />
      <SchemaTable tableName="refresh_session" columns={refreshSessionColumns} />
      <SchemaTable tableName="refresh_token" columns={refreshTokenColumns} />
    </DocumentationSection>
  );
};

export default DatabaseSchema;
