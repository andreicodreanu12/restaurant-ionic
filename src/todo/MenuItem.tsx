import React from 'react';
import { IonItem, IonLabel } from '@ionic/react'
import { ItemProps } from './ItemProps'

const MenuItem: React.FC<ItemProps> = ({ id, title, description, price }) => {
  return (
    <IonItem>
      <IonLabel>{title}</IonLabel>
    </IonItem>
  );
};

export default MenuItem;