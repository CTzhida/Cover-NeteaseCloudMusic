import React, { Fragment, memo, useState, useRef, RefObject, useEffect, MouseEventHandler } from 'react';
import PlayList, { IPlayListHandles } from 'components/PlayList';
import player  from 'components/Player';
import { PlayerPlayOrder, PlayerEventType, PlayerUnSubscribeHandler } from 'components/Player/types';
import Progress from './Progress';
import './Controller.scss';
import Toast from 'components/Toast';

function Controller() {
  const [isPlaying, setIsPlaying] = useState<boolean>(player.isPlaying);

  const [playOrder, setPlayOrder] = useState<PlayerPlayOrder>(player.playOrder);

  const playListRef: RefObject<IPlayListHandles> = useRef(null);

  useEffect(() => {
    const unsubscribePlay: PlayerUnSubscribeHandler = player.subscribe(PlayerEventType.PLAY, () => {
      setIsPlaying(true);
    });

    const unsubscribePause: PlayerUnSubscribeHandler = player.subscribe(PlayerEventType.PAUSE, () => {
      setIsPlaying(false);
    });

    const unsubscribePlayOrderUpdate: PlayerUnSubscribeHandler = player.subscribe(
      PlayerEventType.PLAY_ORDER_UPDATE, 
      (playOrder: PlayerPlayOrder) => {
        setPlayOrder(playOrder);
      }
    );

    return () => {
      unsubscribePlay();
      unsubscribePause();
      unsubscribePlayOrderUpdate();
    };
  }, []);
  

  // 播放与暂停
  const handlePlayAndPause: MouseEventHandler = (): void => {
    if (isPlaying) {
      player.pause();
    } else {
      player.play();
    }
  };

  // 点击上一首
  const handlePlayerPrev: MouseEventHandler = (): void => {
    player.prev();
  };

  // 点击下一首
  const handlePlayerNext: MouseEventHandler = (): void => {
    player.next();
  };

  // 查看播放列表
  const handlePlayList: MouseEventHandler = (): void => {
    playListRef?.current?.show();
  };

  // 修改播放顺序
  const handlerPlayerOrder: MouseEventHandler = (): void => {
    switch (playOrder) {
      case PlayerPlayOrder.LIST:
        player.setPlayOrder(PlayerPlayOrder.LOOP);
        Toast.info('单曲循环');
        break;
      case PlayerPlayOrder.RANDOM:
        player.setPlayOrder(PlayerPlayOrder.LIST);
        Toast.info('列表循环');
        break;
      case PlayerPlayOrder.LOOP:
        player.setPlayOrder(PlayerPlayOrder.RANDOM);
        Toast.info('随机播放');
        break;
    }
  };

  return (
    <Fragment>
      <div className="controller">
        {/* 进度条 */}
        <Progress />
        {/* 控制按钮 */}
        <ul className="controller-buttons">
          <li onClick={handlerPlayerOrder}>
            { playOrder === PlayerPlayOrder.LIST && <i className="iconfont icon-list-cycle"></i> }
            { playOrder === PlayerPlayOrder.RANDOM && <i className="iconfont icon-random-cycle"></i> }
            { playOrder === PlayerPlayOrder.LOOP && <i className="iconfont icon-single-cycle"></i> }
          </li>
          <li onClick={handlePlayerPrev}>
            <i className="iconfont icon-player-prev"></i>
          </li>
          <li onClick={handlePlayAndPause}>
            <div className="primary">
              {
                isPlaying ? <i className="iconfont icon-player-pause"></i> : <i className="iconfont icon-player-play"></i>
              }
            </div>
          </li>
          <li onClick={handlePlayerNext}>
            <i className="iconfont icon-player-next"></i>
          </li>
          <li onClick={handlePlayList}>
            <i className="iconfont icon-player-list"></i>
          </li>
        </ul>
      </div>
      <PlayList ref={playListRef}/> 
    </Fragment>
  );
}

export default memo(Controller);