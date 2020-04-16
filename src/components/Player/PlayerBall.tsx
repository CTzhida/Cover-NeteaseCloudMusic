import React, { memo, useEffect, useState, ReactElement, MouseEventHandler } from 'react';
import player from 'components/Player';
import './PlayerBall.scss';
import { PlayerEventType } from './types';
import Music from './Music';
import { getPercent } from 'scripts/utils';
import { useHistory } from 'react-router';

interface IRadiusProgressProps {
  percent: number;
  children: ReactElement<any>
}
function RadiusProgress (props: IRadiusProgressProps) {
  let percent = props.percent;
  let lDeg = percent > 50 ? 3.6 * (percent - 50) : 0;
  let rDeg = percent >= 50 ? 0 : 3.6 * percent;
  return (
    <div className="radius-ball">
      <div className="radius-ball-l" style={{ transform: `rotate(${lDeg}deg)` }}></div>
      <div className={`radius-ball-r ${ percent >= 50 ? 'half' : '' }`} style={{ transform: `rotate(${rDeg}deg)` }}></div>
      { props.children }
    </div>
  );
}

function PlayerBall () {
  const [ image, setImage ] = useState<string | null>(player.current?.data.picture || null);

  const [ isPlaying, setIsPlaying ] = useState<boolean>(player.isPlaying);

  const [ percent, setPercent ] = useState<number>(() => {
    return getPercent(player.currentTime, player.duration);
  });

  useEffect(() => {
    const unsubscribeImage = player.subscribe(PlayerEventType.MUSIC_INFO_UPDATE, (music: null | Music) => {
      setImage(music ? music.data.picture : null);
    });
    const unsubscribeTimeUpdate = player.subscribe(PlayerEventType.TIMEUPDATE, () => {
      setPercent(getPercent(player.currentTime, player.duration));
    });
    const unsubscribePlay = player.subscribe(PlayerEventType.PLAY, () => {
      setIsPlaying(true);
    });
    const unsubscribePause = player.subscribe(PlayerEventType.PAUSE, () => {
      setIsPlaying(false);
    });
    return () => {
      unsubscribeImage();
      unsubscribeTimeUpdate();
      unsubscribePlay();
      unsubscribePause();
    };
  }, []);

  const history = useHistory();

  const handleClick: MouseEventHandler = () => {
    history.push(`/song?id=${player.currentId}`);
  };

  if (image === null) return <div></div>;
  return (
    <div className="player-ball" onClick={handleClick}>
      <RadiusProgress percent={percent}>
        <div className={`content ${isPlaying ? 'playing' : ''}`}>
          <div className="cover" style={image ? { backgroundImage: `url(${image})` } : {}}></div>
        </div>
      </RadiusProgress>
    </div>
  );
}

export default memo(PlayerBall);