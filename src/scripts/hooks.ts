import { useState, useEffect } from 'react';
import { useLocation } from 'react-router';

/**
 * 防抖
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(
    () => {
      const timeout: NodeJS.Timeout = setTimeout(() => {
        setDebouncedValue(value);
      }, delay);
      return () => {
        clearTimeout(timeout);
      };
    },
    [delay, value]
  );
  return debouncedValue;
}


/**
 * 获取url上的search params对象
 */
export function useQuery(){
  return new URLSearchParams(useLocation().search);
}

export default {
  useDebounce,
  useQuery
};