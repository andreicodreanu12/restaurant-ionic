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
  IonInfiniteScroll,
  IonInfiniteScrollContent,
  useIonViewWillEnter,
  IonSelectOption,
  IonSelect,
  IonSearchbar
} from '@ionic/react';
import { add } from 'ionicons/icons';
import MenuItem from './MenuItem';
import { authConfig, getLogger } from '../core';
import { ItemContext } from './MenuItemProvider';
import { RouteComponentProps } from 'react-router';
import { Redirect } from 'react-router-dom';
import { Plugins } from '@capacitor/core';
import { MenuItemProps } from './MenuItemProps';
import { AuthContext } from '../auth';
import axios from 'axios';

const log = getLogger('ItemList')

const Menu: React.FC<RouteComponentProps> = ({ history }) => {
  const { token, logout } = useContext(AuthContext);
  const [disableInfiniteScroll, setDisableInfiniteScroll] = useState<boolean>(false);
  const { Storage } = Plugins;
  const { fetching, fetchingError } = useContext(ItemContext);
  const [search, setSearch] = useState<string>("");
  const [index, setIndex] = useState(0);
  const [items, setItems] = useState<MenuItemProps[]>([]);
  const selectOptions = ["Main courses", "Salad", "Dessert", "Second courses", "All"]
  const [filter, setFilter] = useState<string | undefined>(undefined);

  const handleLogout = () => {
    logout?.();
    return <Redirect to={{ pathname: "/login" }} />;
  }

  async function fetchData(reset?: boolean) {
    const menuItems: MenuItemProps[] | undefined = reset ? [] : items;
    const url: string = filter ? `http://localhost:3000/items?filter=${filter}` : `http://localhost:3000/items?index=${index}`;
    log(url)
    const result = axios.get(url, authConfig(token))
    result.then(
      async (data) => {
        if (data && data.data && data.data.length > 0) {
          setItems([...menuItems, ...data.data])
          setIndex(index + 1);
          setDisableInfiniteScroll(data.data.length < 20);
        }
        else  {
          setItems([...menuItems, ...[]])
          setDisableInfiniteScroll(true);
        }
      }
    )
    .catch(err => console.error(err));
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

  log('ItemList render');
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>My restaurant</IonTitle>
          <IonButtons slot="end">
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
        {items &&
          items.filter(menu_item => menu_item.title.indexOf(search) >= 0)
            .map(({ id, title, description, price, introduced_at, is_expensive }) => {
            return (
              <MenuItem key={id} id={id} title={title} description={description} price={price} introduced_at={introduced_at} is_expensive={is_expensive} onEdit={id => history.push(`/item/${id}`)} />
            );
          })}
        <IonInfiniteScroll
          threshold="100px"
          disabled={disableInfiniteScroll}
          onIonInfinite={(e: CustomEvent<void>) => searchNext(e)}
        >
          <IonInfiniteScrollContent loadingText="Loading more dishes..."></IonInfiniteScrollContent>
        </IonInfiniteScroll>
        {fetchingError && (
          <div>{fetchingError.message || 'Failed to fetch items'}</div>
        )}
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
