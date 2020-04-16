import React, { memo, useState, useCallback, useEffect } from 'react';
import { displaySeconds } from 'scripts/utils';
import DragBar from 'components/DragBar';
import player from 'components/Player';
import { PlayerEventType, PlayerUnSubscribeHandler } from 'components/Player/types';
import { getPercent } from 'scripts/utils';

function Progress() {
  
  const [time, setTime] = useState<number>(player.currentTime);

  const [endTime, setEndTime] = useState<number>(player.duration);

  const [percent, setPercent] = useState<number>(getPercent(player.currentTime, player.duration));

  const [isDrag, setIsDrag] = useState<boolean>(false);

  const [preTime, setPreTime] = useState<number>(0);

  useEffect(() => {
    const unsubscribeCanPlay: PlayerUnSubscribeHandler = player.subscribe(PlayerEventType.CANPLAY, () => {
      setEndTime(player.duration);
    });
    const unsubscribeTimeUpdate: PlayerUnSubscribeHandler = player.subscribe(PlayerEventType.TIMEUPDATE, () => {
      setTime(player.currentTime);
      setPercent(getPercent(player.currentTime, player.duration));
    });
    return () => {
      unsubscribeCanPlay();
      unsubscribeTimeUpdate();
    };
  }, []);

  // 拖拽条开始执行
  const handleDragStart = useCallback(() => {
    setIsDrag(true);
  }, []);

  // 拖拽条移动执行
  const handleDragMove = useCallback((percent: number) => {
    setPreTime(percent * endTime / 100);
  }, [endTime]);

  // 拖拽条结束执行
  const handleDragEnd = useCallback((percent: number) => {
    const targetTime = percent * endTime / 100;
    player.setCurrentTime(targetTime);
    setTime(targetTime);
    setPercent(percent);
    setIsDrag(false);
  }, [endTime]);

  return (
    <div className="progress">
      <div className={`time time-start ${isDrag ? 'light' : ''}`}>
        <span>{ isDrag ? displaySeconds(preTime)  : displaySeconds(time) }</span>
      </div>
      <DragBar 
        percent={percent} 
        onDragEnd={handleDragEnd}
        onDragStart={handleDragStart}
        onDragMove={handleDragMove}
      />
      <div className="time time-end">
        <span>{ displaySeconds(endTime) }</span>
      </div>
    </div>
  );
};

export default memo(Progress);