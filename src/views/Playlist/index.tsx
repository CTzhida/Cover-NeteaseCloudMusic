import React, { useEffect, useState, Fragment, createElement, ReactNode } from 'react';
import { getPlaylistDetail } from 'api/song';
import { useQuery } from 'scripts/hooks';
import { useHistory } from 'react-router';
import Loading from 'components/Loading';
import SongItem from 'components/SongItem';
import 'styles/Playlist.scss';
import { SongItemType } from 'store/modules/search/types';
import player from 'components/Player';
import { PlayerPlayOrder } from 'components/Player/types';
import PlayerBall from 'components/Player/PlayerBall';
import Toast from 'components/Toast';
import { displayPlayCount } from 'scripts/utils';

const displayDesc = (context: string): ReactNode => {
  const reg: RegExp = /([\n\r])/g;
  const result: Array<ReactNode> = context.split(reg).map((e: string, i: number) => {
    if (reg.test(e)) {
      return createElement('br', { key: i});
    } else {
      return e;
    }
  });
  return createElement(Fragment, null, result);
};

// 背景组件
const BgCover = (props: {cover:string;}) => {
  const [ loaded, setLoaded ] = useState<boolean>(false);
  let img = document.createElement('img');
  const src = props.cover;
  img.src = src;
  img.onload = () => {
    setLoaded(true);
  };
  return (
    loaded ? <div className="bg-cover" style={{backgroundImage: `url(${src})`}}></div> : <div></div>
  );
};

type Creator = {
  id: number;
  nickname: string;
  avatar: string;
  vipType: number;
}

type PyListData = {
  cover: string;
  name: string;
  tags: Array<string>;
  desc: string;
  list: Array<SongItemType>;
  creator: Creator;
  playCount: number;
}

// 缓存数据避免返回该页时又重新获取了
const storageRequestData: { id: number | null; thide: boolean; pyListData: PyListData | null; } = {
  id: null,
  thide: false,
  pyListData: null
};

function Playlist () {
  // console.log('Playlist Render');
  const queryId: string | null = useQuery().get('id');

  const history = useHistory();

  const back = () => history.goBack();

  const id = Number(queryId);

  if (queryId === null)  back();

  const [ showDesc, setShowDesc  ] = useState<boolean>(false);

  const [ thide, setTHide] = useState<boolean>(() => {
    return id === storageRequestData.id ? storageRequestData.thide : false;
  });

  const [ pyListData, setPyListData ] = useState<null | PyListData>(() => {
    return id === storageRequestData.id ? storageRequestData.pyListData : null;
  });

  useEffect(() => {
    if (!id || id === storageRequestData.id) return;
    const [ request, canceler ] = getPlaylistDetail(id);
    request.then(res => {
      const { data } = res;
      const { code, playlist } = data;
      if (code !== 200) return;
      const cover: string = `${playlist.coverImgUrl}??param=120y120`;
      const name: string = playlist.name;
      const creator: Creator = {
        id: playlist.creator.userId,
        nickname: playlist.creator.nickname,
        avatar: `${playlist.creator.avatarUrl}?param=50y50`,
        vipType: playlist.creator.vipType
      };
      const tags: Array<string> = playlist.tags;
      const desc: string = playlist.description;
      const list: Array<SongItemType> = playlist.tracks.map((song: any) => ({
        id: song.id,
        name: song.name,
        album: {
          name: song.al.name
        },
        artists: song.ar,
        fee: song.fee,
        st: song.st
      }));
      const playCount: number = playlist.playCount;
      const thide = playlist.description.split(/([\n\r])/g).length > 3;
      const pyListData = { cover, name, creator, tags, desc, list, playCount};
      setTHide(thide);
      setPyListData(pyListData);
      storageRequestData.id = id;
      storageRequestData.thide = thide;
      storageRequestData.pyListData = pyListData;
    });
    return () => {
      canceler && canceler();
    };
  }, [id]);

  // 播放单曲
  const handleSongSelect = (song: SongItemType) => {
    player.preplay();
    if (song.fee === 1) {
      Toast.info('该歌曲无法试听');
    } else {
      history.push(`/song?id=${song.id}`);
    }
  };

  // 播放全部
  const handlePlayAll = () => {
    player.preplay();
    const ids: Array<number> = [];
    if (!pyListData) return;
    pyListData.list.forEach((e: { id: number, fee: number}) => {
        if (e.fee !==1) ids.push(e.id);
    });
    if (ids.length === 0) return;
    player.add(ids);
    if (player.playOrder === PlayerPlayOrder.RANDOM) {
      const rIdx: number = Math.floor(Math.random() * ids.length);
      history.push(`/song?id=${ids[rIdx]}`);
    } else {
      history.push(`/song?id=${ids[0]}`);
    }
  };

  // 显示 / 隐藏描述
  const handleShowDesc = () => {
    if (!thide) return;
    setShowDesc(!showDesc);
  };

  return (
    <div className="play-list">
      { 
        !pyListData ? <Loading /> :
        (
        <Fragment>
          <div className="play-list-header">
            <span className="back" onClick={() => { history.goBack(); }}><i className="iconfont icon-arrow-left"></i></span>
            <span className="name">歌单</span>
            <PlayerBall />
            <BgCover cover={ pyListData.cover }/>
          </div>

          <div className="list-head">
            <div className="content">
              <div className="cover">
                <img src={pyListData.cover} alt=""/>
                <span className="remd-count">
                  <i className="iconfont icon-earphone"></i>
                  <span>{ displayPlayCount(pyListData.playCount) }</span>
                </span>
              </div>
              <div className="desc">
                <div className="playlist-name">{ pyListData.name }</div>
                {
                  pyListData.creator &&
                  <div className="creator">
                    <div className="avatar"><img src={`${pyListData.creator.avatar}`} alt=""/></div>
                    <span className="nickname">{pyListData.creator.nickname}</span>
                  </div>
                }
              </div>
            </div>
            <BgCover cover={ pyListData.cover }/>
          </div>

          <div className="list-info">
            <ul className="tags">
              <div className="info-name">标签：</div>
              { pyListData.tags.map((item: string) => <li key={item}>{ item }</li>) }
            </ul>
            <div className={`desc ${showDesc ? '' : 'thide'}`} onClick={handleShowDesc}>
              <div className="desc-content">
                <span className="info-name">简介：</span>
                { displayDesc(pyListData.desc) }
              </div>
              {
                thide && 
                <div className="desc-detail-btn">
                  <i className="iconfont icon-arrow-up"></i>
                  <i className="iconfont icon-arrow-down"></i>
                </div>
              }
            </div>
          </div>
          
          <div className="pylist-list">
            <div className="pylist-head">
              <span className="all-play" onClick={handlePlayAll}><i className="iconfont icon-player-play"></i>播放全部({pyListData.list.length})</span>
            </div>
            <div className="songs">
              {
                pyListData.list.map((song: SongItemType) => (
                  <SongItem data={song} onSelect={handleSongSelect} key={song.id}/>
                ))
              }
            </div>
          </div>
        </Fragment>
        )
      }
    </div>
  );
}

export default Playlist;