import React from 'react';
import { IonItem, IonLabel, IonDatetime, IonCheckbox, IonImg } from '@ionic/react'
import { MenuItemProps } from './MenuItemProps'

interface ItemPropsExt extends MenuItemProps {
  onEdit: (id?: number) => void;
}

const MenuItem: React.FC<ItemPropsExt> = ({ id, title, description, price, introduced_at, is_expensive, is_saved, path, long, lat, onEdit }) => {
  return (
    <IonItem onClick={() => onEdit(id)} color={ is_saved ? 'success' : 'danger'} >
      <IonLabel>{title}</IonLabel>
      <IonLabel>{description}</IonLabel>
      <IonLabel>{price}</IonLabel>
      <IonLabel>{introduced_at} </IonLabel>
      <IonLabel>{is_expensive}</IonLabel>
      <IonLabel>{long}</IonLabel>
      <IonLabel>{lat}</IonLabel>
      { {path} && <IonImg class="imigi"
        src= {path} >
      </IonImg> }
    </IonItem>
  );
};

export default MenuItem;