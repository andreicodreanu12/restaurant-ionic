import React from 'react';
import { IonItem, IonLabel } from '@ionic/react'
import { ItemProps } from './ItemProps'

interface ItemPropsExt extends ItemProps {
  onEdit: (id?: number) => void;
}

const MenuItem: React.FC<ItemPropsExt> = ({ id, title, description, price, onEdit }) => {
  return (
    <IonItem onClick={() => onEdit(id)}>
      <IonLabel>{id}</IonLabel>
      <IonLabel>{title}</IonLabel>
      <IonLabel>{description}</IonLabel>
      <IonLabel>{price}</IonLabel>
    </IonItem>
  );
};

export default MenuItem;