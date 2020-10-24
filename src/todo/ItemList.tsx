import React, { useContext, useState } from 'react';
import {
  IonContent,
  IonFab,
  IonFabButton,
  IonHeader,
  IonIcon,
  IonList, IonLoading,
  IonPage,
  IonTitle,
  IonToolbar
} from '@ionic/react';
import { add } from 'ionicons/icons';
import MenuItem from './MenuItem';
import { getLogger } from '../core';
import { ItemContext } from './ItemProvider';
import { RouteComponentProps } from 'react-router';

const log = getLogger('ItemList')

const ItemList: React.FC<RouteComponentProps> =  ({ history }) => {
  const { items, fetching, fetchingError } = useContext(ItemContext);
  log('ItemList render');
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>My restaurant</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonLoading isOpen={fetching} message="Fetching items" />
        {items && (
          <IonList>
            {items.map(({ id, title, description, price }) =>
              <MenuItem key={id} id={id} title={title} description={description} price={price} onEdit={ id => history.push(`/item/${id}`)} />)}
          </IonList>
        )}
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

export default ItemList;
