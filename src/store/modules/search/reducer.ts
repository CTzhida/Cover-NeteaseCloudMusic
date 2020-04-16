import { SEARCH_HOTS, SEARCH_VALUE, SEARCH_ACTIVE, SEARCH_QUERY, SEARCH_STORAGE } from './constants';
import { ISearchAction, ISearchState } from './types';

const initialState: ISearchState = {
  value: '', // 搜索输入的值
  hots: [], // 热搜榜
  isActive: false, // 是否被激活的状态
  searchQuery: '', // 搜索的索引值
  searchStorage: { // 搜索结果
    songs: [],
    offset: 0,
    total: 0,
    noData: false
  }
};

const reducer = (state: ISearchState = initialState, action: ISearchAction) => {
  switch (action.type) {
    // 激活搜索
    case SEARCH_ACTIVE: 
      return {
        ...state,
        isActive: action.payload.isActive
      };
    // 搜索值
    case SEARCH_VALUE:
      return {
        ...state,
        value: action.payload.value
      };
    // 热搜榜
    case SEARCH_HOTS:
      return {
        ...state,
        hots: action.payload.hots
      };
    // 搜索索引值
    case SEARCH_QUERY: 
      return {
        ...state,
        searchQuery: action.payload.searchQuery
      };
    // 暂存的搜索条件与结果
    case SEARCH_STORAGE: 
     return {
       ...state,
       searchStorage: {
         ...state.searchStorage,
         ...action.payload.searchStorage
       }
     };
    default:
      return state;
  }
};

export default reducer;