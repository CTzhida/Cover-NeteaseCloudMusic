import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { PlayerEventType, PlayerError, PlayerErrorType } from 'components/Player/types';
import player from 'components/Player';
import Music from 'components/Player/Music';

function PlayerEffect () {
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



  const location = useLocation();

  // 监听播放错误，直接播放下一首
  useEffect(() => {
    const unsubscribeError = player.subscribe(PlayerEventType.ERROR, (err: PlayerError) => {
      if (err.type === PlayerErrorType.SRC_NO_EXIST && location.pathname !== '/song') {
        if (player.currentId) player.remove([player.currentId]);
      }
    });
    return () => {
      unsubscribeError();
    };
  }, [location]);

  return null;
}

export default PlayerEffect;