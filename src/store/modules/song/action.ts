import { ISongAction, IRemdSong } from './types';
import { REMD_SONGS, NEW_SONGS } from './constants';
import { SongItemType } from '../search/types';

// 推荐歌单
export const getRemdSongsAction = (remdSongs: Array<IRemdSong>):ISongAction => ({
  type: REMD_SONGS,
  payload: {
    remdSongs
  }
});

// 最新音乐
export const getNewSongsAction = (newSongs: Array<SongItemType>): ISongAction => ({
  type: NEW_SONGS,
  payload: {
    newSongs
  }
});