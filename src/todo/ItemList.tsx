import React, { useState } from 'react';
import { IonContent, IonFabButton, IonHeader, IonPage, IonTitle, IonToolbar, IonFab, IonIcon } from '@ionic/react';
import { add } from 'ionicons/icons';
import MenuItem from './MenuItem';
import { getLogger } from '../core';
import { useItems } from './useItems';

const log = getLogger('ItemList')

const ItemList: React.FC = () => {
  const { items, addItem } = useItems();
  log('ItemList render');
  return(
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>My restaurant</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        {items.map(( {id, title, description, price}) => <MenuItem key={id} title={title} description={description} price={price} />)}
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
