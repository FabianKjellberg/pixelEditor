'use client';

import React, { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import style from '../FrontPage.module.css';
import VideoContainer from '../VideoContainer/VideoContainer';

const HomeContent = () => {
  const router = useRouter();

  const handleButtonClick = useCallback(() => {
    router.push('/CreateSprite');
  }, [router]);

  return (
    <>
      <div className={style.hero}>
        <h2 className={style.heroTitle}>Pixel Art Editor</h2>
        <p className={style.heroSubtitle}>
          Browser-native. AI-powered. Full layer system built from scratch.
        </p>

        <div className={style.videoContainer}>
          <iframe
            src="https://www.youtube.com/embed/3GUG_09OSc0?vq=hd1080"
            title="Pixel Art AI – Robot Generation"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>
        <p className={style.videoCaption}>
          The AI assistant receiving a prompt and drawing a robot character step by step, using the
          same tool system available to the user.
        </p>

        <div className={style.createPixelButtonContainer} style={{ marginTop: '20px' }}>
          <button className={style.createPixelButton} onClick={handleButtonClick}>
            Try it out
          </button>
        </div>
      </div>

      <hr className={style.breakRowLine} />

      <section>
        <h3 className={style.sectionTitle}>What it can do</h3>
        <p className={style.sectionSubtitle}>
          Built entirely from scratch, no canvas libraries. Direct pixel manipulation with typed
          arrays, dirty-rect rendering optimizations, and a complete tool and layer architecture.
        </p>
        <div className={style.featureGrid}>
          <div className={style.featureCard}>
            <h4>Drawing tools</h4>
            <p>
              Pen, eraser, shapes (line, rect, ellipse, freeform), paint bucket and gradient.
              Each tool has its own controls for size, opacity, stroke alignment, fill and more.
            </p>
          </div>
          <div className={style.featureCard}>
            <h4>Layer system</h4>
            <p>
              Hierarchical layers with drag-and-drop reordering, collapsible groups, per-layer
              opacity &amp; visibility, multi-select, duplicate, merge down, merge selected, and
              full multi-layer undo/redo.
            </p>
          </div>
          <div className={style.featureCard}>
            <h4>AI drawing assistant</h4>
            <p>
              Describe what to draw. The AI translates your prompt into structured canvas actions
              and executes them step by step using the same tool system available to you. Fully
              observable, no black box.
            </p>
          </div>
          <div className={style.featureCard}>
            <h4>Gradient &amp; dithering</h4>
            <p>
              Linear, random and ordered dithering with custom N×N pattern matrices. Edit fill
              order per cell, set the threshold with a live preview slider, and reset to defaults.
            </p>
          </div>
          <div className={style.featureCard}>
            <h4>Selection tools</h4>
            <p>
              Rectangle marquee, select all, deselect, invert and select from active layer.
              All painting tools respect the active selection so pixels stay contained.
            </p>
          </div>
          <div className={style.featureCard}>
            <h4>Cloud sync &amp; auth</h4>
            <p>
              Projects sync to the cloud with JWT auth and rotating refresh tokens. Metadata saves
              are debounced. Real-time status shows whether layers are synced, saving, or pending.
            </p>
          </div>
        </div>
      </section>

      <hr className={style.breakRowLine} />

      <section>
        <h3 className={style.sectionTitle}>Built with</h3>
        <div className={style.techStack}>
          <span className={style.techPill}>TypeScript</span>
          <span className={style.techPill}>React</span>
          <span className={style.techPill}>Next.js</span>
          <span className={style.techPill}>HTML Canvas</span>
          <span className={style.techPill}>CSS Modules</span>
          <span className={style.techPill}>Hono</span>
          <span className={style.techPill}>Cloudflare Workers</span>
          <span className={style.techPill}>Cloudflare D1</span>
          <span className={style.techPill}>Cloudflare R2</span>
          <span className={style.techPill}>OpenAI API</span>
          <span className={style.techPill}>JWT Auth</span>
        </div>
        <p className={style.techNote}>
          Frontend is a Next.js app deployed on Vercel. Backend runs on Cloudflare Workers
          (edge runtime) with D1 for the database and R2 for layer/image storage. The AI
          integration uses the OpenAI API with structured output to produce executable drawing
          actions.
        </p>
      </section>

      <hr className={style.breakRowLine} />

      <section>
        <h3 className={style.sectionTitle}>Feature clips</h3>
        <p className={style.sectionSubtitle}>Quick recordings of individual features in action.</p>
        <div className={style.videoContainerContainer}>
          <VideoContainer
            text="Layer groups with drag and drop reordering, collapse to keep things tidy and multi-select for bulk actions"
            video="/videos/layergroups.mp4"
          />
          <VideoContainer
            text="Shape tools covering line, rectangle, ellipse and freeform, each with fill, stroke width and alignment controls"
            video="/videos/shapes.mp4"
          />
          <VideoContainer
            text="Gradient fill with ordered dithering, edit the pattern per cell and preview the fill threshold as you drag"
            video="/videos/gradient.mp4"
          />
          <VideoContainer
            text="Rectangle selection that keeps all painting tools contained, with invert and select from layer built in"
            video="/videos/selection.mp4"
          />
          <VideoContainer
            text="Cloud sync with real-time status in the toolbar, showing when layers are saving, synced or waiting"
            video="/videos/cloudsync.mp4"
          />
          <VideoContainer
            text="Pen tool with adjustable size and opacity for precise pixel-level control"
            video="/videos/draw.mp4"
          />
          <VideoContainer
            text="Layer management: context menu, visibility toggle, opacity slider, rename and reorder"
            video="/videos/Layers.mp4"
          />
          <VideoContainer
            text="Zoom toward the cursor and pan smoothly, stays responsive at any canvas size"
            video="/videos/zoomandpan.mp4"
          />
          <VideoContainer
            text="HSB color picker modal, drag it anywhere on the canvas while you work"
            video="/videos/colorpicker.mp4"
          />
        </div>
      </section>
    </>
  );
};

export default HomeContent;
