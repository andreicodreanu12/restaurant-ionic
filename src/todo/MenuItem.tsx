import React from 'react';
import { IonItem, IonLabel, IonDatetime, IonCheckbox } from '@ionic/react'
import { ItemProps } from './ItemProps'

interface ItemPropsExt extends ItemProps {
  onEdit: (id?: number) => void;
}

const MenuItem: React.FC<ItemPropsExt> = ({ id, title, description, price, introduced_at, is_expensive, onEdit }) => {
  return (
    <IonItem onClick={() => onEdit(id)}>
      <IonLabel>{id}</IonLabel>
      <IonLabel>{title}</IonLabel>
      <IonLabel>{description}</IonLabel>
      <IonLabel>{price}</IonLabel>
      <IonLabel>{introduced_at} </IonLabel>
      <IonLabel>{is_expensive}</IonLabel>
    </IonItem>
  );
};

export default MenuItem;