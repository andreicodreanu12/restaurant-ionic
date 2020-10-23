import React, { useState } from 'react';
import { IonContent, IonFabButton, IonHeader, IonPage, IonTitle, IonToolbar, IonFab, IonIcon } from '@ionic/react';
import { add } from 'ionicons/icons';
import MenuItem from './MenuItem';
import { getLogger } from '../core';

const log = getLogger('ItemList')

const ItemList: React.FC = () => {
  const [items, setItems] = useState([
    { id: '1', title: 'Pasta Carbonara', description: 'Main entrees', price: 18 },
    { id: '2', title: 'Salad', description: 'Second courses', price: 20 },
  ]);
  const addItem = () => {
    const id = `${items.length + 1}`;
    const title = `New item ${id}`
    const description = `New description ${id}`
    const price = 30
    log('ItemList addItem');
    setItems(items.concat({ id, title, description, price }));
  }
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
