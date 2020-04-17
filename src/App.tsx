import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import Loading from 'components/Loading';


const Header = lazy(() => import('components/Header'));
const PlayerEffect = lazy(() => import('components/PlayerEffect'));
const Home = lazy(() => import('views/Home'));
const Search = lazy(() => import('views/Search'));
const Song = lazy(() => import('views/Song'));
const Playlist = lazy(() => import('views/Playlist'));

function App () {
  return (
    <Suspense fallback={<Loading className="component-fallback"/>} >
      <Router>
        <Header/>
        <Route path="/" component={Home} exact/>
        <Route path="/search" component={Search} />
        <Route path="/song" component={Song} />
        <Route path="/playlist" component={Playlist} />
        <Route path="*" component={PlayerEffect}/>
      </Router>
    </Suspense>
  );
}

export default App;
