import React, { memo, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { AppState } from 'store';
import { IRemdSong } from 'store/modules/song/types';
import { SongItemType } from 'store/modules/search/types';
import { useHistory } from 'react-router';
import Hots from './Hots';
import Suggest from './Suggest';
import SongItem from 'components/SongItem';
import { getNewSong, getPersonalized } from 'api/song';
import { getNewSongsAction, getRemdSongsAction } from 'store/modules/song/action';
import Toast from 'components/Toast';
import { displayPlayCount } from 'scripts/utils';
import player from 'components/Player';

import 'styles/Home.scss';


const SearchActivePage = memo(function () {
  const searchValueIsEmpty: boolean = useSelector((state: AppState) => state.search.value.length === 0);
  return (
    searchValueIsEmpty ? <Hots/> : <Suggest />
  );
});

let dataRequested: boolean = false;

const Main = memo(function () {
  const remds: Array<IRemdSong> = useSelector((state: AppState) => state.song.remdSongs);

  const songs: Array<SongItemType> = useSelector((state: AppState) => state.song.newSongs);

  const dispatch = useDispatch();

  useEffect(() => {
    if (dataRequested) return;
    dataRequested = true;
    // 最新音乐
    const [ songRequest, songCanceler ] = getNewSong();
    songRequest.then(res => {
      const { data } = res;
      const {result, code} = data;
      if (code !== 200) return;
      const list = result.map((e: any) => ({
        id: e.id,
        name: e.name,
        fee:  e.song.fee,
        artists: e.song.artists,
        album: {
          name: e.song.album.name
        }
      }));
      const action = getNewSongsAction(list);
      dispatch(action);
    });


    // 推荐歌单
    const [ personalizedRequest, personalizedCanceler ] = getPersonalized(6);
    personalizedRequest.then(res => {
      const { data } = res;
      const {result, code} = data;
      if (code !== 200) return;
      const action = getRemdSongsAction(result);
      dispatch(action);
    });

    return () => {
      songCanceler && songCanceler();
      personalizedCanceler && personalizedCanceler();
    };
  }, [dispatch]);

  const history = useHistory();

  const handleSongSelect = (item: SongItemType) => {
    player.preplay();
    if (item.fee === 1) {
      Toast.info('该歌曲无法试听');
    } else {
      history.push(`/song?id=${item.id}`);
    }
  };

  const handlePlaylistSelect = (item: IRemdSong) => {
    history.push(`/playlist?id=${item.id}`);
  };

  return (
    <div>
      <div className="home-item-name">推荐歌单</div>
      <ul className="remds">
        {
          remds.map((remd: IRemdSong) => (
            <li key={remd.id} className="remd-item" onClick={() => handlePlaylistSelect(remd)}>
              <div className="cover">
                <img src={`${remd.picUrl}?param=120y120`} alt=""/>
                <span className="remd-count">
                  <i className="iconfont icon-earphone"></i>
                  <span>{ displayPlayCount(remd.playCount) }</span>
                </span>
              </div>
              <div className="name">{remd.name}</div>
            </li>
          ))
        }
      </ul>
      <div className="home-item-name">最新音乐</div>
      <div className="songs">
        {
          songs.map((song: SongItemType) => (
            <SongItem data={song} key={song.id} onSelect={handleSongSelect}/>
          ))
        }
      </div>
    </div>
  );
});

function Home () {
  const isActive: boolean = useSelector((state: AppState) => state.search.isActive);
  return (
    <div className="home">
      {
        isActive ? <SearchActivePage /> : <Main />
      }
    </div>
  );
}

export default Home;