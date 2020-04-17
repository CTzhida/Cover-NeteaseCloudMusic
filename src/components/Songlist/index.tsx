import React, { Fragment, forwardRef, ForwardRefRenderFunction, useImperativeHandle, memo, useState, MouseEvent, useEffect } from 'react';
import ReactDom from 'react-dom';
import './Songlist.scss';
import Music from 'components/Player/Music';
import player from 'components/Player';
import { PlayerEventType, PlayerUnSubscribeHandler } from 'components/Player/types';
import { useHistory } from 'react-router';


const wrapper: HTMLElement = document.createElement('div');
wrapper.id = 'song-list-popup';
document.body.appendChild(wrapper);

interface ISonglistProps {}

export interface ISongListHandles {
  hide (): void;
  show (): void;
}

const Songlist: ForwardRefRenderFunction<ISongListHandles, ISonglistProps> = (props, ref) => {

  const history = useHistory();

  const [list, setList] = useState<Array<Music>>(player.getList());

  const [currentId, setCurrentId] = useState<number | null>(player.currentId || null);

  useEffect(() => {
    const unsubscribeListChange: PlayerUnSubscribeHandler = player.subscribe(PlayerEventType.LIST_CHANGE, () => {
      setList(player.getList());
    });
    const unsubscribeCurrentChange: PlayerUnSubscribeHandler = player.subscribe(PlayerEventType.MUSIC_INFO_UPDATE, (music: Music | null) => {
      if (music === null) {
        setCurrentId(null);
      } else {
        setCurrentId(music.id);
      }
    });
    return () => {
      unsubscribeListChange();
      unsubscribeCurrentChange();
    };
  }, []);

  // 隐藏
  const hide = () => new Promise(resolve => {
    wrapper.className = '';
    setTimeout(() => {
      wrapper.style.display = 'none';
      resolve();
    }, 220);
  });

  // 显示
  const show = () => new Promise(resolve => {
    wrapper.style.display = 'block';
    setTimeout(() => {
      wrapper.className = 'show';
      resolve();
    }, 20);
  });

  // 点击阴影部分
  const handleShadowClick = () => {
    hide();
  };

  // 选择音乐
  const handleMusicClick = (music: Music) => {
    if(music.id === currentId) return;
    player.switch(music.id).then(() => {
      hide();
      player.play();
    });
  };

  // 删除音乐
  const handleMusicRemove = (event: MouseEvent, id: number) => {
    event.stopPropagation();
    if (list.length === 1) {
      hide().then(() => {
        history.goBack();
      });
    }
    player.remove([id]);
  };

  // 删除全部
  const handleMusicClear = () => {
    hide().then(() => {
      history.goBack();
    });
    const ids = list.map((music: Music) => music.id);
    player.remove(ids);
  };

  useImperativeHandle(ref, () => ({
    hide,
    show
  }));

  return (
    ReactDom.createPortal((
      <Fragment>
        <div className="shadow" onClick={handleShadowClick}></div>
        <div className="list-content">
          <div className="title">
            <span>
              <span className="name">当前播放</span>
              <span className="count">({ list.length })</span>
            </span>
            <span className="delete" onClick={handleMusicClear}>
              <i className="iconfont icon-delete"></i>
            </span>
          </div>
          <ul className="sl-songs">
            {
              list.map((music: Music) => (
                <li key={music.id} className={`sl-song-item ${ currentId === music.id ? 'active' : '' }`} onClick={() => { handleMusicClick(music); }}>
                  <div className="info">
                    { currentId === music.id && <i className="iconfont icon-horn"></i> }
                    <span className="name">{ music.data.name }</span>
                    <span> - </span>
                    <span className="artists">{ music.data.artists }</span>
                  </div>
                  <div className="remove" onClick={ (event: MouseEvent) => { handleMusicRemove(event, music.id); } }>
                    <i className="iconfont icon-close"></i>
                  </div>
                </li>
              ))
            }
          </ul>
          <div className="close" onClick={ () => { hide(); } }>关闭</div>
        </div>
      </Fragment>
    ), wrapper)
  );
};

export default memo(forwardRef(Songlist));