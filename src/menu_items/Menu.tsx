import React, { useContext, useEffect, useState } from 'react';
import {
  IonButtons,
  IonButton,
  IonContent,
  IonFab,
  IonFabButton,
  IonHeader,
  IonIcon,
  IonLoading,
  IonPage,
  IonTitle,
  IonToolbar,
  IonActionSheet,
  useIonViewWillEnter,
  IonSelectOption,
  IonSelect,
  IonSearchbar,
  IonText
} from '@ionic/react';
import { add, camera, close, trash, map } from "ionicons/icons";
import MenuItem from './MenuItem';
import { authConfig, getLogger } from '../core';
import { ItemContext } from './MenuItemProvider';
import { RouteComponentProps } from 'react-router';
import { Redirect } from 'react-router-dom';
import { AuthContext } from '../auth';
import { useAppState } from './AppState';
import { useNetwork } from './Network';
import { Photo, usePhotoGallery } from '../utils/usePhotoGallery';


const log = getLogger('ItemList')

const Menu: React.FC<RouteComponentProps> = ({ history }) => {
  const { onlineStatus, logout } = useContext(AuthContext);
  const { networkStatus } = useNetwork();
  const { items, filterFunction, fetching, fetchingError, setItemsFromStorage } = useContext(ItemContext);
  const [search, setSearch] = useState<string>("");
  const selectOptions = ["Main courses", "Salad", "Dessert", "Second courses", "All"]
  const [filter, setFilter] = useState<string | undefined>(undefined);
  const [status, setStatus] = useState<string>("");


  log("ine menu items are ", items)

  const handleLogout = () => {
    logout?.();
    return <Redirect to={{ pathname: "/login" }} />;
  }

  async function fetchData(reset?: boolean) {
    if (onlineStatus == true) {
      if (filter != undefined)
        filterFunction?.(filter)
    }
  }

  useIonViewWillEnter(async () => {
    await fetchData();
  });

  useEffect(() => {
    fetchData(true);
  }, [filter]);

  async function searchNext($event: CustomEvent<void>) {
    await fetchData();
    ($event.target as HTMLIonInfiniteScrollElement).complete();
  }

  useEffect(() => {
    if (fetchingError == null)
      setStatus("Online")
    else
      setStatus("Offline")
      fetchData(true)
  }, [fetchingError]);

  return (
    <IonPage>
      <IonHeader>
        <IonText>Network connection: {JSON.stringify(networkStatus.connected)} </IonText>
        <IonToolbar>
          <IonTitle>My restaurant</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={() => history.push('/map')}>Map</IonButton>
            <IonButton onClick={() => history.push('/photos')}>Photos</IonButton>
            <IonButton onClick={handleLogout}>Logout</IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonLoading isOpen={fetching} message="Fetching items" />
        <IonSelect value={filter} placeholder="Select description" onIonChange={e => setFilter(e.detail.value)}>
          {selectOptions.map((option) => (
            <IonSelectOption key={option} value={option}>
              {option}
            </IonSelectOption>))}
        </IonSelect>
        <IonSearchbar
          value={search}
          debounce={1000}
          onIonChange={(e) => setSearch(e.detail.value!)}
        ></IonSearchbar>
        <IonText>Server is: {status}</IonText>
        {items &&
          items.filter(menu_item => menu_item.title.indexOf(search) >= 0)
            .map(({ id, title, description, price, introduced_at, is_expensive, is_saved, path, lat, long }) => {
              return (
                <MenuItem key={id} id={id} title={title} description={description} price={price} introduced_at={introduced_at} is_expensive={is_expensive} is_saved={is_saved} path={path} lat={lat} long={long} onEdit={id => history.push(`/item/${id}`)} />
              );
            })}
        <IonFab vertical="bottom" horizontal="end" slot="fixed">
          <IonFabButton onClick={() => history.push('/item')}>
            <IonIcon icon={add} />
          </IonFabButton>
        </IonFab>
      </IonContent>
    </IonPage>
  );
};

export default Menu;
