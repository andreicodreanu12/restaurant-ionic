import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import React from 'react';
import Item from './MenuItem';

const ItemList: React.FC = () => {
  return(
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>My restaurant</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <Item title="Pasta Carbonara" description="Main entrees" price= {18} />
        <Item title="Salad" description="Second courses" price= {20} />
      </IonContent>
    </IonPage>
  )
}

export default ItemList;
