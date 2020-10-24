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
  IonTitle,
  IonToolbar
} from '@ionic/react';
import { ItemContext } from './ItemProvider';
import { RouteComponentProps } from 'react-router';
import { ItemProps } from './ItemProps';

interface ItemEditProps extends RouteComponentProps<{
  id?: string;
}> { }

const ItemEdit: React.FC<ItemEditProps> = ({ history, match }) => {
  const { items, saving, savingError, saveItem, deleteItem } = useContext(ItemContext);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState(Number);
  const [item, setItem] = useState<ItemProps>();
  useEffect(() => {
    const routeId = Number(match.params.id) || 0;
    const item = items?.find(it => it.id === routeId);
    console.log("item" + item);
    setItem(item);
    if (item) {
      setTitle(item.title);
      setDescription(item.description);
      setPrice(item.price);
    }
  }, [match.params.id, items]);
  const handleSave = () => {
    const editedItem = item ? { ...item, title, description, price } : { title, description, price };
    saveItem && saveItem(editedItem).then(() => history.goBack());
  };
  const handleDelete = () => {
    const editedItem = item
      ? { ...item, title, description, price }
      : { title, description, price };
    deleteItem && deleteItem(editedItem).then(() => history.goBack());
  }
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Edit</IonTitle>
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
        <IonLoading isOpen={saving} />
        {savingError && (
          <div>{savingError.message || 'Failed to save item'}</div>
        )}
      </IonContent>
    </IonPage>
  )
}

export default ItemEdit;
