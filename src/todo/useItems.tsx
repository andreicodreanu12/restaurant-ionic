import { useEffect, useState } from 'react';
import { getLogger } from '../core';
import { ItemProps } from './ItemProps';
import { getItems } from './itemApi';

const log = getLogger('useItems');

export interface ItemsState {
  items?: ItemProps[],
  fetching: boolean,
  fetchingError?: Error
}

export interface ItemsProps extends ItemsState {
  addItem: () => void
}


export const useItems: () => ItemsProps = () => {
  const [state, setState] = useState<ItemsState>({
    items: undefined,
    fetching: false,
    fetchingError: undefined
  });
  const { items, fetching, fetchingError } = state;
  const addItem = () => {
    log('addItem - TODO');
  };
  useEffect(getItemsEffect, []);
  return {
    items,
    fetching,
    fetchingError,
    addItem
  };

  function getItemsEffect() {
    let canceled = false;
    fetchItems();
    return () => {
      canceled = true;
    }

    async function fetchItems() {
      try{
        log('fetch items started')
        setState({ ...state, fetching: true });
        const items = await getItems();
        log('fetchItems succeded');
        if(!canceled) {
          setState({ ...state, items, fetching: false})
        }
      } catch(error) {
        log('fetching items failed');
        setState({ ...state, fetchingError: error, fetching: false});
      }
    }
  }
}