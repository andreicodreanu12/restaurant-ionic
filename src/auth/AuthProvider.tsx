import React, { useCallback, useContext, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { getLogger } from '../core';
import { autologin, login as loginApi } from './authApi';
import { Plugins } from '@capacitor/core';

const log = getLogger('AuthProvider');

type LoginFn = (username?: string, password?: string) => void;
type LogoutFn = () => void;


export interface AuthState {
  authenticationError: Error | null;
  isAuthenticated: boolean;
  isAuthenticating: boolean;
  login?: LoginFn;
  logout?: LogoutFn;
  pendingAuthentication?: boolean;
  username?: string;
  password?: string;
  token: string;
}

const initialState: AuthState = {
  isAuthenticated: false,
  isAuthenticating: false,
  authenticationError: null,
  pendingAuthentication: false,
  token: '',
};

export const AuthContext = React.createContext<AuthState>(initialState);

interface AuthProviderProps {
  children: PropTypes.ReactNodeLike,
}

const { Storage } = Plugins;

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, setState] = useState<AuthState>(initialState);
  const { isAuthenticated, isAuthenticating, authenticationError, pendingAuthentication, token } = state;
  const login = useCallback<LoginFn>(loginCallback, []);
  const logout  = useCallback<LogoutFn>(logoutCallback, []);
  useEffect(authenticationEffect, [pendingAuthentication]);
  // useEffect(wsEffect, [token]);
  const value = { isAuthenticated, login, logout, isAuthenticating, authenticationError, token };
  log('render');
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );

  function loginCallback(username?: string, password?: string): void {
    log('login');
    setState({
      ...state,
      pendingAuthentication: true,
      username,
      password
    });
  }

  function logoutCallback(): void {
    log("logout");
    setState({
      ...state,
      isAuthenticated: false,
      token: "",
    });
    (async () => {
      await Storage.remove({ key: "token" });
    })();
  }

  function authenticationEffect() {
    let canceled = false;
    authenticate();
    autoLoginCallback();
    return () => {
      canceled = true;
    }

    async function autoLoginCallback() {
      const res = await Storage.get( {key: 'token'} )
      if(res.value) {
          try{
          const { user } = await autologin(res.value);
          log(user)
          setState({
            ...state,
            token: res.value,
            pendingAuthentication: false,
            isAuthenticated: true
          })
      } catch(error) {
        log('auto authenticate failed');
      }
    }}

    async function authenticate() {
      if (!pendingAuthentication) {
        log('authenticate, !pendingAuthentication, return');
        return;
      }
      try {
        log('authenticate...');
        setState({
          ...state,
          isAuthenticating: true,
        });
        const { username, password } = state;
        const { token } = await loginApi(username, password);
        if (canceled) {
          return;
        }
        log('authenticate succeeded');
        setState({
          ...state,
          token: token,
          pendingAuthentication: false,
          isAuthenticated: true,
          isAuthenticating: false,
        });
        await Storage.set({
          key: 'token',
          value: token
        });
      } catch (error) {
        if (canceled) {
          return;
        }
        log('authenticate failed');
        // log(error);
        setState({
          ...state,
          authenticationError: error,
          pendingAuthentication: false,
          isAuthenticating: false,
        });
      }
    }
  }

  // function wsEffect() {
  //   let canceled = false;
  //   let closeWebSocket: () => void;
  //   closeWebSocket = newWebSocket(token, data => {
  //     if (canceled) {
  //       return;
  //     }
  //     const { user } = data;
  //     if (user!= undefined)
  //         setState({
  //           ...state,
  //           isAuthenticated: true
  //         });
  //   });

  //   return () => {
  //     log('wsEffect - disconnecting');
  //     canceled = true;
  //     closeWebSocket?.();
  //   }

  // }
};

