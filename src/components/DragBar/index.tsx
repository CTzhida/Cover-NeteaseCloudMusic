import React, { useState, useRef, RefObject, TouchEvent, TouchEventHandler, useEffect, useCallback, memo } from 'react';
import './DragBar.scss';

const touch = {
  barWidth: 0,
  touchstartX: 0
};

interface IDragBarProps {
  percent: number;
  onDragStart?: () => void;
  onDragMove?: (progress: number) => void;
  onDragEnd?: (progress: number) => void;
}

function DragBar (props: IDragBarProps) {
  const [progress, setProgress] = useState<number>(props.percent);
  
  const [isDrag, setIsDrag] = useState<boolean>(false);

  const barRef: RefObject<HTMLDivElement> = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (barRef.current) {
      touch.barWidth = barRef.current?.offsetWidth;
    }
  }, []);

  // 拖动开始
  const handleTouchStart: TouchEventHandler = useCallback(function (event: TouchEvent<HTMLDivElement>) {
    const targetTouch = event.targetTouches[0];
    touch.touchstartX = targetTouch.pageX;
    setProgress(props.percent);
    setIsDrag(true);
    props.onDragStart && props.onDragStart();
  }, [props]);
  
  // 拖动结束
  const handleTouchEnd: TouchEventHandler = useCallback(function (event: TouchEvent<HTMLDivElement>) {
    if (isDrag === false) return;
    props.onDragEnd && props.onDragEnd(progress);
    setIsDrag(false);
  }, [isDrag, progress, props]);

  // 拖动触发
  const handleTouchMove: TouchEventHandler = useCallback(function (event: TouchEvent<HTMLDivElement>) {
    if (isDrag === false) return;
    const targetTouch = event.targetTouches[0];
    // 移动的距离
    const move = targetTouch.pageX - touch.touchstartX;
    // 移动的距离占了进度条的百分比
    const percent = Number((move / touch.barWidth * 100).toFixed(1));
    let result = ((progress * 10) + (percent * 10)) / 10;
    if (result < 0) {
      result = 0;
    } else if (result > 100) {
      result = 100;
    }
    if (progress !== result) {
      setProgress(result);
      props.onDragMove && props.onDragMove(result);
    }
    touch.touchstartX = targetTouch.pageX;
  }, [isDrag, progress, props]);


  return (
    <div className={`drag-bar ${isDrag ? 'active' : ''}`} ref={barRef}>
      <div className="bar" style={{ width: isDrag ? `${progress}%` : `${props.percent}%` }}></div>
      <div 
        className="ball" 
        draggable
        style={{ left: isDrag ? `${progress}%` : `${props.percent}%` }}
        onTouchStart={ handleTouchStart }
        onTouchEnd={ handleTouchEnd }
        onTouchMove= { handleTouchMove }
      ></div>
    </div>
  );
}

export default memo(DragBar);