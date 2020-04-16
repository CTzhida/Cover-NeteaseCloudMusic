import { createStore, compose } from 'redux';
import reducers from './reducers';
import { ISearchState } from './modules/search/types';
import { ISongState } from './modules/song/types';

export interface AppState {
  search: ISearchState,
  song: ISongState,
}

export interface AppAction {
  type: string;
  payload: {
    [propsName: string]: any
  }
}

const composeEnhancers = (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

const store = createStore(
  reducers,
  composeEnhancers()
);

export default store;