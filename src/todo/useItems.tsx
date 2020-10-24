import { useEffect, useReducer } from 'react';
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

interface ActionProps {
  type: String,
  payload?: any
}

const initialState: ItemsState = {
  items: undefined,
  fetching: false,
  fetchingError: undefined
};

const FETCH_ITEMS_STARTED = 'FETCH_ITEMS_STARTED';
const FETCH_ITEMS_SUCCEDEED = 'FETCH_ITEMS_SUCCEDDED';
const FETCH_ITEMS_FAILED = 'FETCH_ITEMS_FAILED';

const reducer: (state: ItemsState, action: ActionProps) => ItemsState =
  (state, { type, payload }) => {
    switch(type) {
      case FETCH_ITEMS_STARTED:
        return { ...state, fetching: true };
      case FETCH_ITEMS_SUCCEDEED:
        return { ...state, items: payload.items, fetching: false };
      case FETCH_ITEMS_FAILED:
        return { ...state, fetchingError: payload.error, fetching: false};
      default:
        return state;
    }
  };

export const useItems: () => ItemsProps = () => {
  const [state, dispatch] = useReducer(reducer, initialState);
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
  }
  function getItemsEffect() {
    let canceled = false;
    fetchItems();
    return () => {
      canceled = true;
    }

    async function fetchItems() {
      try{
        log('fetch items started')
        dispatch({ type: FETCH_ITEMS_STARTED });
        const items = await getItems();
        log('fetchItems succeded');
        if(!canceled) {
          dispatch({ type: FETCH_ITEMS_SUCCEDEED, payload: { items }})
        }
      } catch(error) {
        log('fetching items failed');
        dispatch({ type: FETCH_ITEMS_FAILED, payload: { error }});
      }
    }
  }
}