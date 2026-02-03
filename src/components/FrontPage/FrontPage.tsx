'use client';

import React, { useState } from 'react';
import style from '@/components/FrontPage/FrontPage.module.css';
import Changelog from './Changelog/Changelog';
import HomeContent from './HomeContent/HomeContent';
import Documentation from './Documentation/Documentation';

type TabId = 'home' | 'documentation' | 'changelog';

const FrontPage = () => {
  const [activeTab, setActiveTab] = useState<TabId>('home');

  return (
    <>
      <div className={`${style.mainPage}`}>
        <div>
          <p>last updated: 2026-02-03</p>
        </div>
        <div className={style.header}>
          <h1>Fabian's Development Page</h1>
        </div>

        <div className={style.tabBar}>
          <button
            type="button"
            className={activeTab === 'home' ? `${style.tab} ${style.tabActive}` : style.tab}
            onClick={() => setActiveTab('home')}
          >
            Home
          </button>
          <button
            type="button"
            className={activeTab === 'documentation' ? `${style.tab} ${style.tabActive}` : style.tab}
            onClick={() => setActiveTab('documentation')}
          >
            Documentation
          </button>
          <button
            type="button"
            className={activeTab === 'changelog' ? `${style.tab} ${style.tabActive}` : style.tab}
            onClick={() => setActiveTab('changelog')}
          >
            Changelog
          </button>
        </div>

        {activeTab === 'home' && (
          <div className={style.tabContent}>
            <HomeContent />
          </div>
        )}

        {activeTab === 'documentation' && (
          <div className={style.tabContent}>
            <Documentation />
          </div>
        )}

        {activeTab === 'changelog' && (
          <div className={style.tabContent}>
            <Changelog />
          </div>
        )}
      </div>
    </>
  );
};

export default React.memo(FrontPage);
