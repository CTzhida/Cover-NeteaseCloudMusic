import React, { 
  memo,
  MouseEventHandler,
  useEffect,
  useState,
} from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getSearchValueAction, getSearchActiveAction } from 'store/modules/search/actions';
import { useHistory, useRouteMatch } from 'react-router';
import { getSearchDefault } from 'api/search';
import { AppState } from 'store';
import InputPicker from 'components/InputPicker';
import PlayerBall from 'components/Player/PlayerBall';
import './Header.scss';

const DEFAULT_PLACEHOLDER: string = '搜索音乐';

interface IHeaderProps {}

function Header (props: IHeaderProps) {
  const isActive: boolean = useSelector((state: AppState) => state.search.isActive);

  const value: string = useSelector((state: AppState) => state.search.value);

  const [ placeholder, setPlaceholder ] = useState<string>(DEFAULT_PLACEHOLDER);

  const history = useHistory();

  const searchRouteMatch = useRouteMatch('/search');

  const isSearchRoute = searchRouteMatch !== null && searchRouteMatch.isExact === true;

  const homeRouteMatch = useRouteMatch('/');

  const isHomeRoute = homeRouteMatch !== null && homeRouteMatch.isExact === true;

  const dispatch = useDispatch();

  useEffect(() => {
    getSearchDefault().then(result => {
      const { data, code } = result.data;
      if (code === 200 && data.realkeyword) setPlaceholder(data.realkeyword);
    });
  }, []);

  const handleCancelBtn: MouseEventHandler = function (): void {
    dispatch(getSearchValueAction(''));
    dispatch(getSearchActiveAction(false));
  };

  const handleInputPickerValueChange = function (value: string) {
    dispatch(getSearchValueAction(value));
  };

  const handlePickerFocus = function () {
    if (isActive === false) {
      dispatch(getSearchActiveAction(true));
    }
    if (isSearchRoute) {
      history.goBack();
    }
  };

  const handleBack = function () {
    history.goBack();
    dispatch(getSearchValueAction(''));
  };

  const handlePickerSubmit = function (value: string) {
    if (value !== '') {
      history.push(`/search?query=${value}`);
    } else if (placeholder !== DEFAULT_PLACEHOLDER) {
      dispatch(getSearchValueAction(placeholder));
      history.push(`/search?query=${placeholder}`); 
    }
  };

  const hideHeader = isSearchRoute === false && isHomeRoute === false;

  return (
    <div className={`header ${hideHeader ? 'hide' : ''}`}>
      {
        isSearchRoute && <i className="iconfont icon-arrow-left" onClick={ handleBack }/>
      }
      <InputPicker 
        className={ isActive ? '' : 'center' }
        value={value}
        placeholder={placeholder}
        onValueChange={handleInputPickerValueChange}
        onFocus={handlePickerFocus}
        onSubmit={handlePickerSubmit}
      />
      { isHomeRoute && isActive && <span className="search-cancel" onClick={ handleCancelBtn }>取消</span> }
      <PlayerBall />
    </div>
  );
}

export default memo(Header);
