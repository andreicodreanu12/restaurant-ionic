import React, { useContext, useEffect, useState } from 'react';
import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonInput,
  IonLabel,
  IonLoading,
  IonPage,
  IonItem,
  IonCard,
  IonTitle,
  IonToolbar,
  IonCheckbox,
  IonDatetime,
  IonText
} from '@ionic/react';
import { ItemContext } from './MenuItemProvider';
import { RouteComponentProps } from 'react-router';
import { MenuItemProps } from './MenuItemProps';
import { AuthContext } from '../auth';
import { getLogger } from '../core';

const log = getLogger('menuItemEdit');

interface ItemEditProps extends RouteComponentProps<{
  id?: string;
}> { }

const MenuItemEdit: React.FC<ItemEditProps> = ({ history, match }) => {
  const {onlineStatus } = useContext(AuthContext);
  const { items, saving, savingError, saveItem, deleteItem } = useContext(ItemContext);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState(Number);
  const [introduced_at, setIntroduced] = useState('');
  const [is_expensive, setExpensive] = useState(false);
  const [item, setItem] = useState<MenuItemProps>();
  const [status, setStatus] = useState<String>('');


  useEffect(() => {
    if( onlineStatus == false)
      setStatus("Cannot connect to server, but your changes will be saved")
  },[status]);

  useEffect(() => {
    const routeId = Number(match.params.id) || 0;
    const item = items?.find(it => it.id === routeId);
    console.log("item" + item);
    setItem(item);
    if (item) {
      setTitle(item.title);
      setDescription(item.description);
      setPrice(item.price);
      setIntroduced(item.introduced_at);
      setExpensive(item.is_expensive);
    }
  }, [match.params.id, items]);
  const handleSave = () => {
    const editedItem = item ? { ...item, title, description, price, introduced_at, is_expensive } : { title, description, price, introduced_at, is_expensive };
    saveItem?.(editedItem).then(() => history.goBack());
  };
  const handleDelete = () => {
    const editedItem = item
      ? { ...item, title, description, price, introduced_at, is_expensive }
      : { title, description, price, introduced_at, is_expensive };
    deleteItem && deleteItem(editedItem).then(() => history.goBack());
  }

  const backToMenu = () => {
    history.goBack();
  }
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Edit</IonTitle>
          <IonButtons slot="start">
            <IonButton onClick={backToMenu}>
              Back
            </IonButton>
          </IonButtons>
          <IonButtons slot="end">
            <IonButton onClick={handleSave}>
              Save
            </IonButton>
            <IonButton onClick={handleDelete}>
              Delete
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonCard>
          <IonItem>
            <IonLabel>Title: </IonLabel>
            <IonInput value={title} onIonChange={e => setTitle(e.detail.value || '')} />
          </IonItem>
          <IonItem>
            <IonLabel>Description: </IonLabel>
            <IonInput value={description} onIonChange={e => setDescription(e.detail.value || '')} />
          </IonItem>
          <IonItem>
            <IonLabel>Price: </IonLabel>
            <IonInput value={price} onIonChange={e => setPrice(Number(e.detail.value) || 0)} />
          </IonItem>
          <IonItem>
            <IonLabel>Introduced at:</IonLabel>
            <IonDatetime
              displayFormat = "DD/MM/YYYY HH:mm"
              value={introduced_at} onIonChange={ e => setIntroduced(e.detail.value || '') } />
          </IonItem>
          <IonItem>
            <IonLabel>Is expensive: </IonLabel>
            <IonCheckbox checked={is_expensive} onIonChange={e => setExpensive(e.detail.checked)} />
          </IonItem>
          <IonLoading isOpen={saving} />
          <IonText> {status} </IonText>
          {savingError && (
            <div>{savingError.message || 'Failed to save item'}</div>
          )}
        </IonCard>
      </IonContent>
    </IonPage>
  )
}

export default MenuItemEdit;
