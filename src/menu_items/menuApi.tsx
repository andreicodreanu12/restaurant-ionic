import axios from 'axios';
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

interface MessageData {
  type: string;
  message: { type: string,
             payload: MenuItemProps}
}

export const newWebSocket = (token: string, onMessage: (data: MessageData) => void) => {
  const ws = new WebSocket(`ws://localhost:3000/cable/menu_channel`);
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
    log('web socket onmessage');
    onMessage(JSON.parse(messageEvent.data));
  };
  return () => {
    ws.close();
  }
}