import React, { useCallback, useContext, useEffect, useReducer } from 'react';
import PropTypes from 'prop-types';
import { getLogger } from '../core';
import { MenuItemProps } from './MenuItemProps';
import { createItem, getItems, filterItems, newWebSocket, updateItem, removeItem } from './menuApi';
import { AuthContext } from '../auth';
import { Plugins } from '@capacitor/core';
import { useNetwork } from './Network';

const log = getLogger('MenuItemProvider');

const { Storage } = Plugins;

type SaveItemFn = (item: MenuItemProps) => Promise<any>;
type DeleteItemFn = (item: MenuItemProps) => Promise<any>;
type FilterFn = (filter: string) => void;
type SetStorageItemFn = () => void;

export interface ItemsState {
  setItemsFromStorage?: SetStorageItemFn,
  items?: MenuItemProps[],
  fetching: boolean,
  fetchingError?: Error | null,
  saving: boolean,
  deleting: boolean,
  filterFunction?: FilterFn,
  savingError?: Error | null,
  saveItem?: SaveItemFn,
  deleteItem?: DeleteItemFn,
  setItems?: void
}

interface ActionProps {
  type: string,
  payload?: any,
}

const initialState: ItemsState = {
  fetching: false,
  saving: false,
  deleting: false
};

const FETCH_ITEMS_STARTED = 'FETCH_ITEMS_STARTED';
const FETCH_ITEMS_SUCCEEDED = 'FETCH_ITEMS_SUCCEEDED';
const FETCH_ITEMS_FAILED = 'FETCH_ITEMS_FAILED';
const SAVE_ITEM_STARTED = 'SAVE_ITEM_STARTED';
const SAVE_ITEM_SUCCEEDED = 'SAVE_ITEM_SUCCEEDED';
const SAVE_ITEM_FAILED = 'SAVE_ITEM_FAILED';
const DELETE_ITEM_STARTED = "DELETE_ITEM_STARTED";
const DELETE_ITEM_SUCCEEDED = "DELETE_ITEM_SUCCEEDED";
const DELETE_ITEM_FAILED = "DELETE_ITEM_FAILED";
const SET_STORAGE_ITEMS = "SET_STORAGE_ITEMS";

const reducer: (state: ItemsState, action: ActionProps) => ItemsState =
  (state, { type, payload }) => {
    switch (type) {
      case FETCH_ITEMS_STARTED:
        return { ...state, fetching: true, fetchingError: null };
      case FETCH_ITEMS_SUCCEEDED:
        return { ...state, items: payload.items, fetching: false };
      case FETCH_ITEMS_FAILED:
        return { ...state, fetchingError: payload.error, items: payload.items, fetching: false };
      case SAVE_ITEM_STARTED:
        return { ...state, savingError: null, saving: true };
      case SAVE_ITEM_SUCCEEDED:
        const menu_items = [...(state.items || [])];
        const item = payload.item;
        item.is_saved = true;
        const index = menu_items.findIndex(it => it.id === item.id);
        if (index === -1) {
          menu_items.splice(0, 0, item);
        } else {
          menu_items[index] = item;
        }
        return { ...state, items: menu_items, saving: false };
      case SAVE_ITEM_FAILED:
        return { ...state, savingError: payload.error, items: payload.items, saving: false };
      case SET_STORAGE_ITEMS:
        log("iteme din set storage items", payload.items)
        return { ...state, items: payload.items };
      default:
        return state;
    }
  };

export const ItemContext = React.createContext<ItemsState>(initialState);

interface ItemProviderProps {
  children: PropTypes.ReactNodeLike,
}

const reserved_storage = ['token', 'photos']

export const ItemProvider: React.FC<ItemProviderProps> = ({ children }) => {
  const { token } = useContext(AuthContext);
  const [state, dispatch] = useReducer(reducer, initialState);
  const { networkStatus } = useNetwork();
  const { items, fetching, fetchingError, saving, savingError, deleting } = state;
  useEffect(networkEffect, [networkStatus]);
  useEffect(getItemsEffect, [token]);
  useEffect(wsEffect, [token]);
  const saveItem = useCallback<SaveItemFn>(saveItemCallback, [token]);
  const deleteItem = useCallback<DeleteItemFn>(deleteItemCallback, [token]);
  const filterFunction = useCallback<FilterFn>(filterCallback, [token]);
  const setItemsFromStorage = useCallback<SetStorageItemFn>(setItemsCallback, []);
  const value = { items, filterFunction, fetching, fetchingError, saving, savingError, saveItem, deleting, setItemsFromStorage, deleteItem };
  log('returns');
  return (
    <ItemContext.Provider value={value}>
      {children}
    </ItemContext.Provider>
  );

  function networkEffect() {
    if (networkStatus.connected) {
      updateDatabase();
    }
  }

  async function updateDatabase() {
    if (token) {
      Storage.keys().then(
        result => {
          result.keys.forEach(key => {
            const item = Storage.get({ key: key });
            item.then(
              value => {
                if (value.value != null && !reserved_storage.includes(key)) {
                  var item = JSON.parse(value.value);
                  var id = Number(item.id)
                  if(item.is_saved == false)
                    isNaN(id) ? createItem(token, item) : updateItem(token, item);
                }
              }
            )
          })
        }
      );
      getItemsEffect()
    }
  }

  async function setItemsCallback() {
    const items: MenuItemProps[] = [];
    Storage.keys().then(
      result => {
        result.keys.forEach(key => {
          const item = Storage.get({ key: key });
          item.then(
            value => {
              if (value.value != null && !reserved_storage.includes(key))
                items.push(JSON.parse(value.value));
            }
          )
        })
      }
    );
    dispatch({ type: SET_STORAGE_ITEMS, payload: { items } })
    log('items from storage have been set');
  }

  async function filterCallback(filter: string) {
    log('fitlerItems started');
    dispatch({ type: FETCH_ITEMS_STARTED });
    const items = await filterItems(token, filter);
    dispatch({ type: FETCH_ITEMS_SUCCEEDED, payload: { items } });
    log('fitlerItems succeeded');
  }

  function getItemsEffect() {
    let canceled = false;
    fetchItems();
    return () => {
      canceled = true;
    }

    async function fetchItems() {
      if (!token?.trim()) {
        return;
      }
      try {
        log('fetchItems started');
        dispatch({ type: FETCH_ITEMS_STARTED });
        const items = await getItems(token);
        log('fetchItems succeeded');
        setStorage(items);
        if (!canceled) {
          dispatch({ type: FETCH_ITEMS_SUCCEEDED, payload: { items } });
        }
      } catch (error) {
        log('fetchItems failed');
        const items: MenuItemProps[] = [];
        Storage.keys().then(
          result => {
            result.keys.forEach(key => {
              const item = Storage.get({ key: key });
              item.then(
                value => {
                  if (value.value != null && key != 'token' && key != 'photos')
                    items.push(JSON.parse(value.value));
                }
              )
            })
          }
        );
        dispatch({ type: FETCH_ITEMS_FAILED, payload: { error, items } });
      }
    }
  }

  async function saveItemCallback(item: MenuItemProps) {
    try {
      log('saveItem started');
      dispatch({ type: SAVE_ITEM_STARTED });
      const savedItem = await (item.id ? updateItem(token, item) : createItem(token, item));
    } catch (error) {
      log('saveItem failed');
      item.is_saved = false;
      makeLocalChange(item);
      const items: MenuItemProps[] = [];
      Storage.keys().then(
        result => {
          result.keys.forEach(key => {
            const item = Storage.get({ key: key });
            item.then(
              value => {
                if (value.value != null && !reserved_storage.includes(key))
                  items.push(JSON.parse(value.value));
              }
            )
          })
        }
      );
      dispatch({ type: SAVE_ITEM_FAILED, payload: { error, items } });
    }
  }

  async function deleteItemCallback(item: MenuItemProps) {
    try {
      log("delete started");
      dispatch({ type: DELETE_ITEM_STARTED });
      const deletedItem = await removeItem(token, item);
      log("delete succeeded");
      console.log(deletedItem);
      dispatch({ type: DELETE_ITEM_SUCCEEDED, payload: { item: item } });
    } catch (error) {
      log("delete failed");
      dispatch({ type: DELETE_ITEM_FAILED, payload: { error } });
    }
  }

  async function makeLocalChange(item: MenuItemProps) {
    if (item.id) {
      Storage.set({
        key: item.id?.toString(),
        value: JSON.stringify(item)
      })
    }
    else {
      Storage.set({
        key: item.title,
        value: JSON.stringify(item)
      })
    }
  }

  function setStorage(items: MenuItemProps[]) {
    Storage.keys().then(
      result => {
        result.keys.forEach(key => {
          const item = Storage.get({ key: key });
          item.then(
            value => {
              if (value.value != null && !reserved_storage.includes(key))
                Storage.remove({ key: key})
            }
          )
        })
      }
    );

    items.forEach(element => {
      element.is_saved = true;
    });
    setTimeout(() => {
      items.forEach(menu_item => {
        Storage.set({
          key: menu_item.id?.toString() || '0',
          value: JSON.stringify(menu_item)
        });
      })
  }, 500)
  }

  function wsEffect() {
    let canceled = false;
    log('wsEffect - connecting');
    let closeWebSocket: () => void;
    if (token?.trim()) {
      closeWebSocket = newWebSocket(token, data => {
        if (canceled) {
          return;
        }
        const { type, message: mes } = data;
        if (mes != undefined)
          if (mes.type === 'created' || mes.type === 'updated') {
            let item = mes.payload
            item.is_saved = true
            Storage.set({
              key: item.id?.toString() || '0',
              value: JSON.stringify(item)
            })
            dispatch({ type: SAVE_ITEM_SUCCEEDED, payload: { item } });
          }
      });
    }
    return () => {
      log('wsEffect - disconnecting');
      canceled = true;
      closeWebSocket?.();
    }
  }
};
