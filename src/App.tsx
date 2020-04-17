import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import Loading from 'components/Loading';

import Header from 'components/Header';
import PlayerEffect from 'components/PlayerEffect';

const Home = lazy(() => import('views/Home'));
const Search = lazy(() => import('views/Search'));
const Song = lazy(() => import('views/Song'));
const Playlist = lazy(() => import('views/Playlist'));

function App () {
  return (
    <Router>
      <Header/>
      <Suspense fallback={<Loading className="component-fallback"/>} >
        <Route path="/" component={Home} exact/>
        <Route path="/search" component={Search} />
        <Route path="/song" component={Song} />
        <Route path="/playlist" component={Playlist} />
      </Suspense>
      <Route path="*" component={PlayerEffect}/>
    </Router>
  );
}

export default App;
