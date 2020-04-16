import { combineReducers } from 'redux';
import searchReducer from './modules/search/reducer';
import songReducer from './modules/song/reducer';

const reducers = combineReducers({
  search: searchReducer,
  song: songReducer
});

export default reducers;