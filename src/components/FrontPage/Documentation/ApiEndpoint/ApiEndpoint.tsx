'use client';

import React, { useState } from 'react';
import styles from '../Documentation.module.css';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';
export type AuthType = 'credentials' | 'bearer' | 'cookie' | 'public';

export type ResponseExample = {
  status: string;
  body?: string;
  note?: string;
};

export type ApiEndpointProps = {
  method: HttpMethod;
  path: string;
  authType: AuthType;
  description: string;
  requestBody?: string;
  requestNote?: string;
  responses: ResponseExample[];
};

const methodStyles: Record<HttpMethod, string> = {
  GET: styles.methodGet,
  POST: styles.methodPost,
  PUT: styles.methodPut,
  DELETE: styles.methodDelete,
};

const authBadgeStyles: Record<AuthType, string> = {
  credentials: styles.authBadgeCredentials,
  bearer: styles.authBadgeBearer,
  cookie: styles.authBadgeCookie,
  public: styles.authBadgePublic,
};

const authBadgeLabels: Record<AuthType, string> = {
  credentials: 'Credentials',
  bearer: 'Bearer Token',
  cookie: 'Refresh Cookie',
  public: 'Public',
};

const ApiEndpoint = ({
  method,
  path,
  authType,
  description,
  requestBody,
  requestNote,
  responses,
}: ApiEndpointProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className={styles.endpoint}>
      <button
        type="button"
        className={styles.endpointHeaderBtn}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <span className={`${styles.method} ${methodStyles[method]}`}>{method}</span>
        <span className={styles.path}>{path}</span>
        <span className={authBadgeStyles[authType]}>{authBadgeLabels[authType]}</span>
        <span className={`${styles.expandIcon} ${isExpanded ? styles.expandIconOpen : ''}`}>▶</span>
      </button>
      <div className={`${styles.detailsWrapper} ${isExpanded ? styles.detailsWrapperOpen : ''}`}>
        <div className={styles.detailsInner}>
          <div className={styles.endpointDetails}>
            <p>{description}</p>

            {requestBody && (
              <>
                <h5>Request Body</h5>
                <pre className={styles.codeBlock}>{requestBody}</pre>
              </>
            )}

            {requestNote && (
              <>
                <h5>Request</h5>
                <p className={styles.responseNote} dangerouslySetInnerHTML={{ __html: requestNote }} />
              </>
            )}

            {authType === 'bearer' && !requestBody && !requestNote && (
              <>
                <h5>Request Headers</h5>
                <pre className={styles.codeBlock}>{'Authorization: Bearer <accessToken>'}</pre>
              </>
            )}

            {responses.map((response, index) => (
              <React.Fragment key={index}>
                <h5>Response ({response.status})</h5>
                {response.body && (
                  <pre className={styles.codeBlock}>{response.body}</pre>
                )}
                {response.note && (
                  <p className={styles.responseNote} dangerouslySetInnerHTML={{ __html: response.note }} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApiEndpoint;
