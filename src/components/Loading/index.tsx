import React, { useState, useEffect, ReactElement } from 'react';
import './Loading.scss';

const iconHeights: Array<Array<string>> = [
  ['25%', '50%', '25%', '0%'],
  ['15%', '35%', '35%', '15%'],
  ['0%', '25%', '50%', '25%'],
  ['25%', '0%', '25%', '50%'],
  ['15%', '35%', '35%', '15%'],
  ['50%', '25%', '0%', '25%'],
];

interface ILoadingProps {
  children: ReactElement<any>
}

let initCurrent: number = 0;

function Loading (props: ILoadingProps) {
  const [current, setCurrent] = useState<number>(initCurrent);

  const heights = iconHeights[current];
  
  useEffect(() => {
    let timer: NodeJS.Timeout = setTimeout(() => {
      if (current < iconHeights.length - 1) {
        setCurrent(current + 1);
        initCurrent += 1;
      } else {
        setCurrent(0);
        initCurrent = 0;
      }
    }, 200);
    return () =>{
      if(timer) clearTimeout(timer);
    };
  }, [current]);
  
  return (
    <div className="loading">
      <svg className="loading-svg">
        <line x1="7%" y1="100%" x2="7%" y2={heights[0]}></line>
        <line x1="37%" y1="100%" x2="37%" y2={heights[1]}></line>
        <line x1="65%" y1="100%" x2="65%" y2={heights[2]}></line>
        <line x1="93%" y1="100%" x2="93%" y2={heights[3]}></line>
      </svg>
      { props.children }
    </div>
  );
}

export default Loading;