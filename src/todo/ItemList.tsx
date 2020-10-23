import React, { useState } from 'react';
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
import { useItems } from './useItems';

const log = getLogger('ItemList')

const ItemList: React.FC = () => {
  const { items, fetching, fetchingError, addItem } = useItems();
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
            {items.map(({ id, title, description, price }) => <MenuItem key={id} title={title} description={description} price={price} />)}
          </IonList>
        )}
        {fetchingError && (
          <div>{fetchingError.message || 'Failed to fetch items'}</div>
        )}
        <IonFab vertical="bottom" horizontal="end" slot="fixed">
          <IonFabButton onClick={addItem}>
            <IonIcon icon={add} />
          </IonFabButton>
        </IonFab>
      </IonContent>
    </IonPage>
  )
}

export default ItemList;
