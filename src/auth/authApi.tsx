import axios from 'axios';
import { baseUrl, getLogger, config, withLogs, authConfig } from '../core';
import { MenuItemProps } from '../menu_items/MenuItemProps';
import { UserProps } from '../user/UserProps';

const log = getLogger('authApi');

const authUrl = `http://${baseUrl}/login`;
const autoLogin = `http://${baseUrl}/auto_login`;

export interface AuthProps {
  token: string;
}

export interface AutoLoginProps {
  user: UserProps;
}

export const login: (username?: string, password?: string) => Promise<AuthProps> = (username, password) => {
  return withLogs(axios.post(authUrl, { username, password }, config), 'login');
}

export const autologin: (token?: string) => Promise<AutoLoginProps> = (token) => {
  return withLogs(axios.get(autoLogin, authConfig(token)), 'autoLogin');
}

// export const newWebSocket = (token: string, onMessage: (data: MessageData) => void) => {
//   const ws = new WebSocket(`ws://localhost:3000/cable?token=${token}`);
//   ws.onopen = () => {
//     log('web socket onopen');
//     ws.send(JSON.stringify({
//         token: token
//       }))
//   };
//   ws.onclose = () => {
//     log('web socket onclose');
//   };
//   ws.onerror = error => {
//     log('web socket onerror');
//   };
//   ws.onmessage = messageEvent => {
//     log('web socket onmessage');
//     onMessage(JSON.parse(messageEvent.data));
//   };
//   return () => {
//     ws.close();
//   }
// }