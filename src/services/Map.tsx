import { IonContent, IonPage, IonHeader, IonToolbar, IonButtons, IonButton, IonLoading, IonTitle } from "@ionic/react";
import React, { useContext, useEffect, useState } from "react";
import { RouteComponentProps } from "react-router";
import { ItemContext } from "../menu_items/MenuItemProvider";
import { MenuItemProps } from '../menu_items/MenuItemProps';
import { GoogleMap, Marker } from 'react-google-maps';
import { getLogger } from '../core';
import { Plugins } from '@capacitor/core';
import { GeneralMap }  from './GeneralMap';

const { Storage } = Plugins;

const log = getLogger('Map')

const Map: React.FC<RouteComponentProps> = ({ history }) => {
  const [items, setItems] = useState<MenuItemProps[]>();
  useEffect(() => {
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
    setItems(items)
  }, [])
  useEffect(() => {
    log(items)
  }, [items])

 log(items)

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Map</IonTitle>
          <IonButtons slot="start">
            <IonButton onClick={() => history.goBack()}>
              Back
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
      <GeneralMap
          locations= {items}
        />
      </IonContent>
    </IonPage>
  );
};

export default Map;