import React, { memo, ReactNode } from 'react';
import highlightKeywords from 'scripts/hightlight';
import { SongItemType, ArtistsType } from 'store/modules/search/types';
import './SongItem.scss';

interface ISongsProps {
  onSelect(item: SongItemType) :void;
  query?: string | null;
  data: SongItemType;
}

// 合并合唱歌手名称
const getArtistsName: Function = function (artists: ArtistsType, query: string): ReactNode {
  let names: string = artists.map(i => i.name).join('/');
  return highlightKeywords(names, query);
};

function SongItem (props: ISongsProps) {
  const data = props.data;
  const query = props.query;
  // console.log(data);
  
  return (
    <div className="song-item" onClick={() => { props.onSelect(data); }}>
      <div className="song-item-info">
        <div className="name">{ query ? highlightKeywords(data.name, query) : data.name }</div>
        <div className="info">
          { data.fee === 1 && <span className="label">VIP</span> }
          <span className="artists">{ getArtistsName(data.artists, query) }</span>
          <span> - </span>
          <span className="album">{ query ? highlightKeywords(data.album.name, query) : data.album.name }</span>
        </div>
        {
          data.alias && data.alias.length !== 0 && <div className="alias">{ data.alias[0] }</div>
        }
      </div>
      <div className="play">
        <i className="iconfont icon-player-play"></i>
      </div>
    </div>
  );
}

export default memo(SongItem);