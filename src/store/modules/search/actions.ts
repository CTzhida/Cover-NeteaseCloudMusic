import {  SEARCH_HOTS, SEARCH_VALUE, SEARCH_ACTIVE, SEARCH_QUERY, SEARCH_STORAGE } from './constants';
import { ISearchAction, IHotsItem, ISearchStorage } from './types';

// 搜索的值
export const getSearchValueAction = (value: string): ISearchAction => ({
  type: SEARCH_VALUE,
  payload: {
    value
  }
});

// 搜索框激活
export const getSearchActiveAction = (active: boolean): ISearchAction => ({
  type: SEARCH_ACTIVE,
  payload: {
    isActive: active
  }
});

// 热搜榜
export const getSearchHotsAction = (hots: Array<IHotsItem>): ISearchAction => ({
  type: SEARCH_HOTS,
  payload: {
    hots
  }
});

// 搜索索引值
export const getSearchQueryAction = (query: string): ISearchAction => ({
  type: SEARCH_QUERY,
  payload: {
    searchQuery: query
  }
});

// 搜索条件与结果
export const getSearchStorageAction = (storage: ISearchStorage): ISearchAction => ({
  type: SEARCH_STORAGE,
  payload: {
    searchStorage: {
      ...storage
    }
  }
});