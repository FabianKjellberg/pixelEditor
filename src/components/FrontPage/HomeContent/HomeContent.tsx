'use client';

import React, { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import style from '../FrontPage.module.css';
import Tree from '../../FileTree/Tree/Tree';
import VideoContainer from '../VideoContainer/VideoContainer';

const HomeContent = () => {
  const router = useRouter();

  const handleButtonClick = useCallback(() => {
    router.push('/CreateSprite');
  }, [router]);

  return (
    <>
      <div>
        <h3>Hello</h3>
        <p>
          I'm Fabian. I recently graduated in system development and I'm at my best when I'm
          building things and figuring them out as I go. I enjoy digging into how systems work,
          solving small problems, and slowly turning ideas into something real.
        </p>
        <br />
        <p>
          This page is my space to experiment and share a couple of projects I'm currently working
          on, one small and one a bit more ambitious. It's not a portfolio of perfection, but a
          place where I document progress, test ideas, and see how far I can take them.
        </p>
        <br />
        <p>
          Fell free to contact me at:{' '}
          <b className={style.underLine}>
            <a href="mailto:Fabian.Kjellberg@gmail.com">Fabian.Kjellberg98@gmail.com</a>
          </b>
        </p>
      </div>

      <div className={style.breakRowLine} />

      <div>
        <h2>Pixel Art Creation Tool</h2>
        <br />
        <p>
          This is my main project and where I spend most of my development time. It&apos;s a 
          browser-based pixel art editor built from scratch with React and HTML Canvas. The goal 
          is to create something that feels intuitive for beginners but has the depth and 
          performance that more experienced artists would appreciate.
        </p>
        <br />
        <p>
          Under the hood, it uses direct pixel manipulation with typed arrays for performance, 
          a custom layer system with blend modes, and optimized rendering that only redraws 
          what&apos;s changed. I&apos;ve put a lot of work into making tools like the pen and 
          eraser feel responsive even on larger canvases.
        </p>
        <br />
        <p>
          The project also includes a full authentication system with JWT tokens and rotating 
          refresh tokens. Coming soon: cloud saving so you can access your projects from anywhere.
        </p>
        <br />
        <br />
        <h3>Current features:</h3>
        <br />
        <div className={style.videoContainerContainer}>
          <VideoContainer
            text={'Draw with the pen tool and adjust its properties for precise control'}
            video={'/videos/draw.mp4'}
          />
          <VideoContainer
            text={'Manage multiple layers and use the context menu to organize your work'}
            video={'/videos/Layers.mp4'}
          />
          <VideoContainer
            text={'Zoom towards your cursor and pan smoothly using keyboard shortcuts'}
            video={'/videos/zoomandpan.mp4'}
          />
          <VideoContainer
            text={"Pick from unlimited colors and place the picker right where you're working"}
            video={'/videos/colorpicker.mp4'}
          />
        </div>

        <br />
        <div className={style.createPixelButtonContainer}>
          <h3>Click below to try out the tool yourself</h3>
          <button className={style.createPixelButton} onClick={handleButtonClick}>
            Click me
          </button>
        </div>
      </div>

      <div className={style.breakRowLine} />

      <div>
        <h2>Drag and Drop FileTree</h2>
        <br />
        <p>
          A smaller weekend project I built to explore recursive data structures and drag-and-drop 
          interactions. The tree supports dragging branches to any level, with visual indicators 
          showing valid drop zones as you drag.
        </p>
        <br />
        <p>Try it out below:</p>
        <br />
        <ul className={style.frontpageList}>
          <li>
            <p>
              Click on <b>Add Sub-branch</b> to create a child branch underneath
            </p>
          </li>
          <li>
            <p>
              <b>Double click</b> on a Title or Id to rename it
            </p>
          </li>
          <li>
            <p>
              <b>Drag</b> a branch to see its drop off points, then drop it above, below or on
              another branch
            </p>
          </li>
        </ul>
      </div>
      <div className={`${style.treeContainer} scrollable`}>
        <Tree />
      </div>
      <div className={style.breakRowLine} />
      <div className={style.footer}>
        <p>
          Over time, I'll keep adding demos, write-ups, and short visual examples of my work here.
        </p>
        <br />
        <p>Thank you for visiting my page, Hope you liked it.</p>
      </div>
    </>
  );
};

export default HomeContent;
