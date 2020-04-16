import React, { memo, useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import axios, { Canceler } from 'axios';
import { useHistory } from 'react-router';
import { AppState } from 'store';
import { useDebounce } from 'scripts/hooks';
import { getSearchSuggest } from 'api/search';
import { getSearchValueAction } from 'store/modules/search/actions';
import 'styles/Suggest.scss';

// 取消Axios请求
let suggestRequestCancel: Canceler | null;

interface ISearchSuggestItem {
  keyword: string;
}

function Suggest() {
  // console.log('Suggest render');

  const [list, setList] = useState<Array<ISearchSuggestItem>>([]);

  const value: string = useSelector((state: AppState) => {
    return state.search.value;
  });

  const debounceValue: string = useDebounce<string>(value, 500);

  const dispatch = useDispatch();

  const history = useHistory();

  useEffect(() => {
    if (debounceValue) {
      getSearchSuggest(debounceValue, {
        cancelToken: new axios.CancelToken((cancel: Canceler) => {
          suggestRequestCancel = cancel;
        })
      }).then(res => {
        const { data } = res;
        if (data.code === 200) {
          const list: Array<ISearchSuggestItem> = data.result.allMatch ? data.result.allMatch : [];
          setList(list);
        }
      }).catch(err => {
        console.log(err);
      });
    }
  }, [debounceValue]);

  // 组件销毁时取消还在进行的请求
  useEffect(() => {
    return () => {
      if (suggestRequestCancel !== null) suggestRequestCancel();
      suggestRequestCancel = null;
    };
  }, []);

  // 前往Search页面
  const navigateToSearch = function (keyword: string): void {
    dispatch(getSearchValueAction(keyword));
    history.push(`/search?query=${keyword}`);
  };

  return (
    <div className="search-suggest">
      <div className="search-target">搜索 “{value}”</div>
      <ul className="search-suggest-list">
        {
          list.map((item: ISearchSuggestItem, index: number) => (
            <li className="list-item" key={index} onClick={() => { navigateToSearch(item.keyword); }}>
              <i className="iconfont icon-search"></i>
              <span className="name">{item.keyword}</span>
            </li>
          ))
        }
      </ul>
    </div>
  );
}

export default memo(Suggest);