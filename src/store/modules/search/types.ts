import { AppAction } from "store";

// 热搜榜数据接口
export interface IHotsItem {
  searchWord: string;
  content: string;
  score: number;
}

// 暂存搜索条件与结果
export interface ISearchStorage {
  songs?: Array<SongItemType>,
  offset?: number,
  total?: number,
  noData?: boolean
}

// SearchAction
export interface ISearchAction extends AppAction {
  payload: {
    hots?: Array<IHotsItem>;
    value?: string;
    isActive?: boolean;
    searchQuery?: string;
    searchStorage?: ISearchStorage;
  }
}

// SearchState
export interface ISearchState {
  hots: Array<IHotsItem>;
  value: string;
  isActive: boolean;
  searchQuery: string;
  searchStorage: ISearchStorage;
}

// 搜索结果艺术家
export type ArtistsType = Array<{
  name: string;
}>

// 搜索结果列表单项
export type SongItemType = {
  id: number;
  name: string;
  album: {
    name: string;
  };
  artists?: ArtistsType;
  fee: number;
  alias: Array<string>;
  st?: number;
}