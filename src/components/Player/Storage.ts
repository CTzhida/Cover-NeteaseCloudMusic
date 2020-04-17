import { PlayerPlayOrder } from "./types";

const PLAYER_LIST: string = 'PLAYER_LIST';

const PLAYER_PLAYORDER: string = 'PLAYER_PLAYORDER';

class PlayerStorage {
  constructor () {
    const list = localStorage.getItem(PLAYER_LIST);
    const playOrder = localStorage.getItem(PLAYER_PLAYORDER);

    this.list = list === null ? [] : JSON.parse(list);
    // this.list = [];
    this.playOrder = playOrder === null ? null : PlayerPlayOrder[playOrder as PlayerPlayOrder];
  }

  saveList (list: Array<number>) {
    this.list = list;
    localStorage.setItem(PLAYER_LIST, JSON.stringify(this.list));
  }

  savePlayOrder (playOrder: PlayerPlayOrder) {
    this.playOrder = playOrder;
    localStorage.setItem(PLAYER_PLAYORDER, playOrder);
  }

  playOrder: PlayerPlayOrder | null;

  list: Array<number>;
}

export default PlayerStorage;