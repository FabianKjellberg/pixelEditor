import React from 'react';
import ChangelogEntry from './ChangelogEntry/ChangelogEntry';

const Changelog = () => {
  return (
    <div>
      <h2>Changelog</h2>
      <br />
      <p>
        Version history and what I&apos;ve been up to. Point form, but I&apos;ll keep it readable.
      </p>
      <br />
      <ChangelogEntry date="2026-02-10" title="Tool overlay">
        <li>
          <p>
            <b>Tools overlay correct cursor.</b> When having a selected tool your cursor now matches
            what the cursor will do on the canvas. For Pen and Eraser, it shows an overlay over the
            area that will be affected by your stroke. Other cursors also show more representative
            cursor types.
          </p>
        </li>
      </ChangelogEntry>

      <ChangelogEntry date="2026-02-08" title="Cloud sync, autosave & file menu">
        <li>
          <p>
            <b>Autosave—how it works.</b> When a project is synced (loaded from cloud or created
            with &quot;sync to cloud&quot; checked), every layer edit—pen, eraser, move, rename,
            add, delete—schedules a debounced save. Five seconds after you stop editing, the client
            calls the backend for signed upload URLs, then uploads the changed layer pixels and a
            fresh preview to R2. No manual save needed. <code>AutoSaveContext</code> tracks which
            layers are dirty and whether a save is in flight; <code>LayerContext</code> wires{' '}
            <code>debounceSave</code> into <code>setActiveLayer</code>, <code>deleteLayer</code>,{' '}
            <code>moveLayer</code>, <code>renameLayer</code>, and <code>addLayer</code>. The sync
            status in the top menu shows green when everything&apos;s synced, yellow when there are
            unsaved changes or a save running, and prompts you to log in if you&apos;re not.
          </p>
        </li>
        <li>
          <p>
            <b>File menu.</b> New Project: pick name, width, height; optional sync-to-cloud checkbox
            (disabled when not logged in). Save to Cloud: uploads project + layers + preview. Open
            from Cloud: lists your projects with previews; Open is disabled when dirty or saving.
            Change canvas size syncs dimensions to the backend when the project is synced.
          </p>
        </li>
        <li>
          <p>
            Checkbox component, logout disabled when dirty/saving + reset to blank 64×64 on success,{' '}
            <code>resetToBlankProject</code> in LayerContext.
          </p>
        </li>
        <li>
          <p>
            <b>Bug fixes.</b> The checkered transparency background wasn&apos;t updating when you
            zoomed—it stayed white or checkered based on the initial pixel size. Added{' '}
            <code>pixelSize</code> to the backing canvas effect deps so it redraws correctly. Layers
            were also drawing in the wrong order: lower layers appeared on top. Fixed by drawing in
            reverse array order so the first layer in the list appears underneath and the last on
            top, as expected.
          </p>
        </li>
        <li>
          <p>
            Backend endpoints for this release: <code>POST /auth/register</code>,{' '}
            <code>POST /auth/login</code>, <code>POST /auth/refresh</code>,{' '}
            <code>POST /auth/logout</code>, <code>GET /auth/test-auth</code>,{' '}
            <code>GET /user/me</code>, <code>POST /project/create</code>,{' '}
            <code>GET /project/previews</code>, <code>GET /project/:id</code>,{' '}
            <code>PUT /project/size</code>, <code>PUT /layer/save</code>,{' '}
            <code>DELETE /layer/delete</code>, <code>POST /layer/create</code>,{' '}
            <code>PUT /layer/name</code>, <code>PUT /layer/move</code>. API docs updated with full
            response coverage.
          </p>
        </li>
      </ChangelogEntry>

      <ChangelogEntry date="2026-02-02" title="User accounts">
        <li>
          <p>
            <b>You can sign up and log in now.</b> The pixel editor has a Login button in the top
            menu; click it to register or sign in.
          </p>
        </li>
        <li>
          <p>
            Backend: register and login handlers, bcrypt for password hashing, JWT access tokens and
            httpOnly refresh-token cookies so sessions stay secure.
          </p>
        </li>
        <li>
          <p>
            Refresh flow: when the access token expires, the frontend automatically calls the
            refresh endpoint (with cookies), gets a new access token, and retries the request so you
            stay logged in without extra clicks.
          </p>
        </li>
        <li>
          <p>
            Logout clears the refresh token on the server and drops the access token in the client.
            Rotating refresh tokens (migration 0002) so old tokens are invalidated when you refresh.
          </p>
        </li>
        <li>
          <p>
            Frontend: <code>UserContextProvider</code> holds the current user and loading state;{' '}
            <code>api/client</code> attaches the Bearer token and handles 401 + refresh; login modal
            and user dropdown (with logout) in the sprite creator top menu.
          </p>
        </li>
        <li>
          <p>
            <code>/user/me</code> returns the logged-in user; auth middleware on the backend
            protects routes that need it.
          </p>
        </li>
      </ChangelogEntry>

      <ChangelogEntry date="2026-01-24" title="Selection + pen/eraser optimization">
        <li>
          <p>
            <b>Selection tool.</b> You can draw a rectangle on the canvas to select pixels. Pen and
            eraser only affect pixels inside the selection; the move tool can drag the selection
            (and its pixels) around.
          </p>
        </li>
        <li>
          <p>
            Selection is stored as a <code>SelectionLayer</code> (rect + Uint8Array mask) in{' '}
            <code>CanvasContext</code>; the rectangle selector tool creates/combines rectangles (add
            or replace mode).
          </p>
        </li>
        <li>
          <p>
            Rendering: <code>SelectionUtil.getPath</code> turns the mask into outline edges, then we
            draw them as a dashed SVG path in <code>Selection.tsx</code> so you see the marching
            ants.
          </p>
        </li>
        <li>
          <p>
            Pen and eraser both use <code>clipLayerToSelection</code> so only pixels inside the
            selection get drawn or erased. Move tool: if you click inside the selection it extracts
            those pixels into a &quot;floating&quot; layer, clears them from the base, and moves
            both the pixels and the selection rect until you release.
          </p>
        </li>
        <li>
          <p>Top menu has &quot;Clear selection&quot; when a selection is active.</p>
        </li>
        <li>
          <p>
            <b>Refactor (pen &amp; eraser):</b> Drawing used to stamp the whole brush (size × size)
            at every step along the stroke. That&apos;s O(stroke length × size²), which gets nasty
            for big brushes. Now we only draw the <b>edges</b> of each step: along the line we
            advance one pixel at a time and only write the leading row or column of the brush (the
            edge that&apos;s &quot;new&quot;). So we go from O(stroke length × size²) down to
            O(stroke length × size + size): one pass along the stroke with size pixels per step,
            plus the first stamp. Same idea for the eraser. We also keep a stroke matrix and stroke
            number so we don&apos;t double-write overlapping pixels within a stroke.
          </p>
        </li>
      </ChangelogEntry>

      <ChangelogEntry date="2026-01-10">
        <li>
          <p>
            Changelog started. This is when I began keeping a proper log of what goes into the site
            and the pixel editor.
          </p>
        </li>
      </ChangelogEntry>
    </div>
  );
};

export default Changelog;
