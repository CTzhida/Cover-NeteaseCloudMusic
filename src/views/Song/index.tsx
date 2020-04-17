import React, { useState, useEffect, MouseEventHandler } from 'react';
import Controller from 'components/Controller';
import { useQuery } from 'scripts/hooks';
import player from 'components/Player';
import { PlayerEventType, PlayerErrorType, PlayerError } from 'components/Player/types';
import Music from 'components/Player/Music';
import 'styles/Song.scss';
import { useHistory } from 'react-router';
import Toast from 'components/Toast';
import Modal from 'components/Modal';

function Song () {
  const idString: string | null = useQuery().get('id');
  if (idString === null) {
    throw new Error('Expected the id to be a number');
  }
  const [id, setId] = useState<number>(Number(idString));
  
  const [name, setName] = useState<string>('');

  const [artists, setArtists] = useState<string>('');

  const [isPlaying, setIsPlaying] = useState<boolean>(player.isPlaying);

  const [picture, setPicture] = useState<string>('');

  const [listLength, setListLength] = useState<number>(player.getList().length);

  const history = useHistory();

  useEffect(() => {
    if (!player.has(id)) {
      // console.log('没有音乐,新增');
      player.add([id]);
      player.switch(id).then(() => {
        player.play();
      });
      Toast.info('已添加到播放列表');
    } else if (player.currentId === id) {
      // console.log('已存在该音乐，并且是当前音乐');
      setName(player.current?.data.name || '');
      setArtists(player.current?.data.artists || '');
      setPicture(player.current?.data.picture || '');
      if (player.isPlaying === false) player.play();
    } else if (player.currentId !== id) {
      // console.log('已存在该音乐，不是当前音乐');
      player.switch(id).then(() => {
        player.play();
      });
    }
  }, [id]);

  useEffect(() => {
    const unsubscribeListLength = player.subscribe(PlayerEventType.LIST_CHANGE, () => {
      setListLength(player.getList().length);
    });

    const unsubscribeError = player.subscribe(PlayerEventType.ERROR, (err: PlayerError) => {
      if (err.type === PlayerErrorType.SRC_NO_EXIST) {
        Modal.confirm('该歌曲暂不支持播放', { showCancelButton: false }).then(() => {
          if (listLength === 1) {
            history.goBack();
          }
          if (player.currentId) player.remove([player.currentId]);
        });
      }
    });
    
    return () => {
      unsubscribeError();
      unsubscribeListLength();
    };
  }, [history, listLength]);

  useEffect(() => {
    const unsubscribeMusicReady = player.subscribe(PlayerEventType.MUSIC_INFO_UPDATE, (music: Music | null) => {
      if (music === null) return;
      setId(music.id);
      setName(music.data.name || '');
      setArtists(music.data.artists || '');
      setPicture(music.data.picture || '');
      history.replace(`/song?id=${music.id}`);
    });

    const unsubscribePlay = player.subscribe(PlayerEventType.PLAY, () => {
      setIsPlaying(true);
    });
    
    const unsubscribePause = player.subscribe(PlayerEventType.PAUSE, () => {
      setIsPlaying(false);
    });

    return () => {
      unsubscribeMusicReady();
      unsubscribePlay();
      unsubscribePause();
    };
  }, [history]);


  const handleBack: MouseEventHandler = (): void => {
    history.goBack();
  };

  return (
    <div className="song">
      { picture &&  <div className="song-bg" style={{ backgroundImage: `url(${picture})` }}></div> }
      <div className="song-content">
        {/* 头部 */}
        <div className="song-header">
          <div className="left" onClick={handleBack}>
            <i className="iconfont icon-arrow-left"></i>
          </div>
          <div className="song-info">
            <div className="song-name">{name}</div>
            <div className="song-artists">{artists}</div>
          </div>
          <div className="right"></div>
        </div>
        {/* disc */}
        <div className={`disc ${isPlaying ? 'active' : ''}`}>
          <div className="disc-picture">
            { picture &&  <div className="author-img" style={{ backgroundImage: `url(${picture})` }}></div> }
          </div>
        </div>
        {/* 控制器 */}
        <Controller />
      </div>
    </div>
  ); 
}

export default Song;