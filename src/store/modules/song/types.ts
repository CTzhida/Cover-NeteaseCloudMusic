import { AppAction } from "store";
import { SongItemType } from "../search/types";

export interface IRemdSong {
  id: number;
  name: string;
  picUrl: string;
  playCount: number;
}

export interface ISongState {
  remdSongs: Array<IRemdSong>;
  newSongs: Array<SongItemType>;
}

export interface ISongAction extends AppAction {
  payload: {
    remdSongs?: Array<IRemdSong>;
    newSongs?: Array<SongItemType>;
  }
}