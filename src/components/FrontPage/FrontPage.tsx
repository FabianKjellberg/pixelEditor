'use client';

import React, { useCallback } from 'react';
import style from '@/components/FrontPage/FrontPage.module.css';
import Tree from '../FileTree/Tree/Tree';
import { useRouter } from 'next/navigation';
import VideoContainer from './VideoContainer/VideoContainer';

const FrontPage = () => {
  const router = useRouter();

  const handleButtonClick = useCallback(() => {
    router.push('/CreateSprite');
  }, []);

  return (
    <>
      <div className={`${style.mainPage}`}>
        <div>
          <p>last updated: 2026-02-02</p>
        </div>
        <div className={style.header}>
          <h1>Fabian’s Development Page</h1>
        </div>
        <div>
          <h3>Hello</h3>
          <p>
            I’m Fabian. I recently graduated in system development and I’m at my best when I’m
            building things and figuring them out as I go. I enjoy digging into how systems work,
            solving small problems, and slowly turning ideas into something real.
          </p>
          <br />
          <p>
            This page is my space to experiment and share a couple of projects I’m currently working
            on, one small and one a bit more ambitious. It’s not a portfolio of perfection, but a
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
          <h2>Drag and Drop FileTree</h2>
          <br />
          <p>
            The first small project on this page was a small drag and drop file tree, which has the
            ability to drag and drop branches in a tree no matter the level of the tree. What i
            found enjoyable in this project was creating the drop functions and the recursive
            functions needed to know when and where to place a node.
          </p>
          <br />
          <p>
            It was a fun small project i created over a weekend. You can try it underneath here:
          </p>
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
          <br />
          <p>
            <b>NOTE:</b> This was just a fun over the weekend project which i had a lot of fun with,
            however its not very polished.
          </p>
        </div>
        <div className={`${style.treeContainer} scrollable`}>
          <Tree />
        </div>
        <div className={style.breakRowLine} />
        <div>
          <h2>Pixel Art Creation Tool</h2>
          <br />
          <p>
            In my free time, when I feel like programming, this is usually the project I end up
            working on. It’s still very bare-bones and very much a work in progress, but that’s
            exactly what makes it fun to build.
          </p>
          <br />
          <p>
            My goal with this tool is to create a beginner-friendly, online pixel art creator that
            is both simple to use and surprisingly powerful, without sacrificing performance.
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
              text={'Pick from unlimited colors and place the picker right where you’re working'}
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
        <div className={style.footer}>
          <p>
            Over time, I’ll keep adding demos, write-ups, and short visual examples of my work here.
          </p>
          <br />
          <p>Thank you for visiting my page, Hope you liked it.</p>
        </div>
      </div>
    </>
  );
};

export default React.memo(FrontPage);
