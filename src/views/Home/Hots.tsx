import React, { memo, MouseEventHandler, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useHistory } from 'react-router';
import { AppState } from 'store';
import { getSearchValueAction, getSearchHotsAction } from 'store/modules/search/actions';
import { IHotsItem } from 'store/modules/search/types';
import 'styles/Hots.scss';
import { getSearchHotDetail } from 'api/search';


interface IHotsItemProps {
  index: number; 
  data: IHotsItem;
}

function HotsItem (props: IHotsItemProps) {
  const { index, data } = props;
  const history = useHistory();
  const dispatch = useDispatch();
  const handleClick: MouseEventHandler = function(): void {
    dispatch(getSearchValueAction(data.searchWord));
    history.push(`/search?query=${data.searchWord}`);
  };
  return (
    <li className="hots-item" onClick={handleClick}>
      <div className="order">{ index + 1 }</div>
      <div className="info">
        <div className="name">{ data.searchWord }</div>
        <div className="desc">{ data.content }</div>
      </div>
    </li>
  );
}


let dataRequested: boolean = false;

function Hots () {
  const hots: Array<IHotsItem> = useSelector((state: AppState) => state.search.hots);
  const dispatch = useDispatch();
  useEffect(() => {
    if (dataRequested) return;
    dataRequested = true;
    const [ request, canceler ] = getSearchHotDetail();
    request.then(result => {
      const { data, code } = result.data;
      if (code !== 200) return;
      dispatch(getSearchHotsAction(data));
    });
    return () => {
      canceler && canceler();
    };
  }, [dispatch]);

  return (
    <div className="hots">
    <div className="hots-title">热搜榜</div>
    <ul className="hots-list">
      {
        hots.map((item: IHotsItem, index: number) => (
          <HotsItem 
            key={ item.searchWord }
            index={ index }
            data={ item }
          />
        ))
      }
    </ul>
  </div>
  );
}

export default memo(Hots);