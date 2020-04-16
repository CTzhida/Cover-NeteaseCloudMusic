import { ISongState, ISongAction } from './types';
import { REMD_SONGS, NEW_SONGS } from './constants';


const initialState: ISongState = {
  remdSongs: [],
  newSongs: [],
};

const reducer = (state: ISongState = initialState, action: ISongAction) => {
  switch (action.type) {
    // 推荐歌单
    case REMD_SONGS: 
      return {
        ...state,
        remdSongs: action.payload.remdSongs
      };
    // 最新音乐
    case NEW_SONGS:
      return {
        ...state,
        newSongs: action.payload.newSongs
      };
    default: 
      return state;
  }
};

export default reducer;