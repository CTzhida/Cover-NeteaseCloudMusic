import React, { memo } from 'react';
import { SongItemType} from 'store/modules/search/types';
import SongItem from 'components/SongItem';


interface ISongsProps {
  songs: Array<SongItemType>;
  onSelect(item: SongItemType) :void;
  query: string | null;
}

function Songs (props: ISongsProps) {
  // console.log('Songs render');

  const query = props.query;
  return (
    <div className="songs">
      {
        props.songs.map((item: SongItemType, index: number) => (
          <SongItem onSelect={props.onSelect} query={query} data={item} key={index}/>
        ))
      }
    </div>
  );
}

export default memo(Songs);