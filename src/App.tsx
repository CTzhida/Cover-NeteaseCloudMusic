import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';

import Header from 'components/Header';
import Home from 'views/Home';
import Search from 'views/Search';
import Song from 'views/Song';
import Playlist from 'views/Playlist';

import player from './components/Player';
import { PlayerEventType } from 'components/Player/types';
import Music from 'components/Player/Music';

function App () {
  // 订阅歌名 <=> 网页标题
  useEffect(() => {
    const unsubscribe = player.subscribe(PlayerEventType.MUSIC_INFO_UPDATE, (music: null | Music) => {
      const defualtTitle: string = process.env.REACT_APP_TITLE || '';
      const musicName: string | null | undefined = music?.data.name;
      document.title = musicName || defualtTitle;
    });
    return () => {
      unsubscribe();
      document.title = process.env.REACT_APP_TITLE || '';
    };
  }, []);
  return (
    <Router>
      <Header/>
      <Route path="/" component={Home} exact/>
      <Route path="/search" component={Search} />
      <Route path="/song" component={Song} />
      <Route path="/playlist" component={Playlist} />
    </Router>
  );
}

export default App;
