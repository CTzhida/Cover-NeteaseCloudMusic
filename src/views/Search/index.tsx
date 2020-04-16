import React, { Component, Dispatch, SyntheticEvent, createRef, RefObject } from 'react';
import { RouteChildrenProps } from 'react-router';
import { connect } from 'react-redux';
import { AppState, AppAction } from 'store';
import { ISearchStorage, SongItemType } from 'store/modules/search/types';
import { getSearchStorageAction, getSearchQueryAction } from 'store/modules/search/actions';
import Loading from 'components/Loading';
import Songs from './Songs';
import { querySearchMusic } from 'api/search';
import axios, { Canceler } from 'axios';
import 'styles/Search.scss';
import Toast from 'components/Toast';

let searchRequestCancel: Canceler | null;

interface ISearchProps extends RouteChildrenProps {
  songs: Array<SongItemType>,
  total: number;
  offset: number;
  noData: boolean;
  searchQuery: string;
  updateSearchStorage(storage: ISearchStorage): void;
  updateSearchQuery(query: string): void;
}

interface ISearchState {
  query: string;
  isSearching: boolean;
}

// 是否重置了搜索
let isReseted: boolean;

// 记录滚动的高度
let scrollTopSession: number | null = null;

class Search extends Component<ISearchProps, ISearchState> {
  constructor (props: ISearchProps) {
    super(props);

    const urlSearch = new URLSearchParams(props.location.search);
    const query = urlSearch.get('query') || '';

    if (query !== props.searchQuery) {
      isReseted = true;
    } else {
      isReseted = false;
    }

    this.state = {
      query,
      isSearching: false
    };

    this.handleWrapperScroll = this.handleWrapperScroll.bind(this);
    this.handleSelectSong = this.handleSelectSong.bind(this);
    this.getData = this.getData.bind(this);
  }

  wrapperRef: RefObject<HTMLDivElement> = createRef();

  componentDidMount () {
    if (isReseted) {
      isReseted = false;
      this.props.updateSearchQuery(this.state.query);
      this.props.updateSearchStorage({
        songs: [],
        total: 0,
        offset: 0,
        noData: false
      });
      if (this.props.offset === 0) this.getData();
    } else if (scrollTopSession !== null && scrollTopSession !== 0) {
      this.wrapperRef.current?.scrollTo(0, scrollTopSession);
      scrollTopSession = null;
    }
  }

  componentDidUpdate (prevProps: ISearchProps) {
    if (prevProps.offset !== this.props.offset) {
      this.getData();
    }
  }

  handleWrapperScroll (event: SyntheticEvent<HTMLDivElement>) {
    if (this.props.songs.length >= this.props.total) return;
    const scrollTop = event.currentTarget.scrollTop;
    const contentHeight = event.currentTarget.scrollHeight;
    const wrapperHeight = event.currentTarget.offsetHeight;
    if (scrollTop + wrapperHeight >= contentHeight - 20 && this.state.isSearching === false) {
      this.props.updateSearchStorage({ offset: this.props.offset + 1 });
    }
  }

  async getData () {
    this.setState({ isSearching: true });
    const keywords = this.state.query;
    const limit = 25;
    const { offset } = this.props;
    const requestOptions = {
      cancelToken: new axios.CancelToken((cancel: Canceler) => {
        searchRequestCancel = cancel;
      })
    };
    // console.log(`请求${offset}页的数据`);
    const { data } = await querySearchMusic({ keywords, limit, offset }, requestOptions);
    if (data.code === 200) {
      const { songs, songCount } = data.result;
      // console.log(data.result.songs);
      if (songs === undefined || songCount === undefined) {
        this.props.updateSearchStorage({ noData: true });
      } else {
        this.props.updateSearchStorage({ 
          total: songCount, 
          songs: [...this.props.songs, ...songs]
        });
      }
    }
    this.setState({ isSearching: false });
  }

  handleSelectSong (item: SongItemType) {
    scrollTopSession = this.wrapperRef.current?.scrollTop || null;
    if (item.fee === 1) {
      Toast.info('该歌曲无法试听');
    } else {
      this.props.history.push(`/song?id=${item.id}`);
    }
  }

  componentWillUnmount () {
    if (searchRequestCancel !== null) searchRequestCancel();
    searchRequestCancel = null; 
  }

  render () {
    const { isSearching } = this.state;
    const { noData, total, songs, offset } = this.props;
    return (
      <div ref={this.wrapperRef} className="search" onScroll={this.handleWrapperScroll}>
        {noData && <div className="no-result">无结果</div>}
        {isSearching === true && offset === 0 && <Loading><div>正在加载...</div></Loading>}
        <Songs songs={songs} query={this.state.query} onSelect={this.handleSelectSong}/>
        <div className="bottom-site">
          {isSearching === true && offset !== 0 && <Loading><span>加载中...</span></Loading>}
          {isSearching === false && songs.length !== 0 && songs.length >= total && <div className="no-more">没有更多了</div>}
        </div>
      </div>
    );
  }
}


const mapStateToProps = (state: AppState) => {
  return {
    songs: state.search.searchStorage.songs || [],
    offset: state.search.searchStorage.offset || 0,
    total: state.search.searchStorage.total || 0,
    noData: state.search.searchStorage.noData || false,
    searchQuery: state.search.searchQuery
  };
};

const mapDispatchToProps = (dispatch: Dispatch<AppAction>) => {
  return {
    updateSearchStorage: (storage: ISearchStorage) => {
      dispatch(getSearchStorageAction({
        ...storage
      }));
    },
    updateSearchQuery: (query: string) => {
      dispatch(getSearchQueryAction(query));
    }
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Search);