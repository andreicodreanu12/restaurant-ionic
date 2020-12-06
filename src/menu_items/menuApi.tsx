import axios from 'axios';
import { filter } from 'ionicons/icons';
import { getLogger, authConfig, baseUrl, withLogs } from '../core';
import { MenuItemProps } from './MenuItemProps';

const log = getLogger('menuApi');
const itemsUrl = `http://${baseUrl}/items`;
const itemUrl = `http://${baseUrl}/item`;

export const getItems: (token: string) => Promise<MenuItemProps[]> = token => {
  return withLogs(axios.get(itemsUrl, authConfig(token)), 'getItems');
}

export const createItem: (token: string, item: MenuItemProps) => Promise<MenuItemProps[]> = (token, item) => {
  return withLogs(axios.post(itemUrl, item, authConfig(token)), 'createItem');
}

export const updateItem: (token: string, item: MenuItemProps) => Promise<MenuItemProps[]> = (token, item) => {
  return withLogs(axios.put(`${itemUrl}/${item.id}`, item, authConfig(token)), 'updateItem');
}

export const removeItem: (token: string, item: MenuItemProps) => Promise<MenuItemProps[]> = (token, item) => {
  return withLogs(axios.delete(`${itemUrl}/${item.id}`,  authConfig(token)), 'updateItem');
}

export const filterItems: (token: string, filter: string) => Promise<MenuItemProps[]> = (token,filter) => {
  return withLogs(axios.get(`${itemsUrl}?filter=${filter}`, authConfig(token)), 'filterItems');
}

interface MessageData {
  type: string;
  message: { type: string,
             payload: MenuItemProps}
}

export const newWebSocket = (token: string, onMessage: (data: MessageData) => void) => {
  const ws = new WebSocket(`ws://192.168.0.143:3000/cable/menu_channel`);
  ws.onopen = () => {
    log('web socket onopen');
    ws.send(JSON.stringify({
      command: 'subscribe',
      identifier: JSON.stringify({
        channel: 'MenuChannel',
        token: token
      })
    }))
  };
  ws.onclose = () => {
    log('web socket onclose');
  };
  ws.onerror = error => {
    log('web socket onerror');
  };
  ws.onmessage = messageEvent => {
    log(messageEvent.data);
    onMessage(JSON.parse(messageEvent.data));
  };
  return () => {
    ws.close();
  }
}