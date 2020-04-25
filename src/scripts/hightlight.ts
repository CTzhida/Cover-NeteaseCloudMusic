import { createElement, ReactNode, Fragment } from 'react';

type highlightKeywordsType = {
  (content: string, words: string | null, tag?: string, props?: any): ReactNode;
}

/**
 * 匹配关键词词添加包裹标签
 * @param contents 文本内容
 * @param words 匹配的词
 * @param tag 添加的标签
 * @param props 标签属性
 */
const highlightKeywords: highlightKeywordsType = (contents, words = '', tag = 'span', props = { className: 'hightlight' }) => {
  const regex = new RegExp(`(${words})`, 'gi');
  
  const nodes: Array<ReactNode> = contents.split(regex).map((res: string, index: number) => {
    if (res === words) {
      return createElement(tag, { ...props, key: index}, res);
    }
    return res;
  });
  
  return createElement(Fragment, null, nodes);
};

export default highlightKeywords;