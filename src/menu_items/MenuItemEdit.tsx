import React, { useContext, useEffect, useState, useRef } from 'react';
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
  IonText,
  IonList,
  IonListHeader,
  IonFab,
  IonFabButton,
  IonIcon,
  IonImg,
  IonActionSheet,
  IonGrid,
  IonRow,
  IonCol
} from '@ionic/react';
import { ItemContext } from './MenuItemProvider';
import { RouteComponentProps } from 'react-router';
import { MenuItemProps } from './MenuItemProps';
import { getLogger } from '../core';
import { useNetwork } from './Network';
import { Plugins } from '@capacitor/core';
import { Photo, usePhotoGallery } from '../utils/usePhotoGallery';
import { add, camera, close, trash, map } from "ionicons/icons";
import { MyMap } from '../services/MyMap';

const log = getLogger('menuItemEdit');

const { Storage } = Plugins;

interface ItemEditProps extends RouteComponentProps<{
  id?: string;
}> { }

const MenuItemEdit: React.FC<ItemEditProps> = ({ history, match }) => {
  const { photos, takePhoto, deletePhoto } = usePhotoGallery();
  const { networkStatus } = useNetwork();
  const { items, saving, savingError, saveItem, deleteItem } = useContext(ItemContext);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState(Number);
  const [introduced_at, setIntroduced] = useState('');
  const [lat, setLat] = useState(Number);
  const [long, setLong] = useState(Number);
  const [path, setPath] = useState<string>('');
  const [is_expensive, setExpensive] = useState(false);
  const [item, setItem] = useState<MenuItemProps>();
  const [status, setStatus] = useState<String>('');
  const [conflicts, setConflicts] = useState(false);
  const firstUpdate = useRef(true);
  const [photo, setPhoto] = useState<Photo>();
  const [photoToDelete, setPhotoToDelete] =useState<Photo>();

  const [stashedDes, setStashedDesc] = useState('');
  const [stashedTitle, setStashedTitle] = useState('');
  const [stashedPrice, setStashedPrice] = useState(0);

  const [descSolved, setDescSolved] = useState(false)
  const [titleSolved, setTitleSolved] = useState(false)
  const [priceSolved, setPriceSolved] = useState(false)

  useEffect(() => {
    if (networkStatus.connected == false) {
      setStatus("No network connection.Your changes will be saved when you have internet connection again")
    }
  }, [networkStatus]);

  useEffect(() => {
    const routeId = Number(match.params.id) || 0;
    const item = items?.find(it => it.id === routeId);
    setItem(item);
    if (item) {
      log("acest item este", item);
      setTitle(item.title);
      setDescription(item.description);
      setPrice(item.price);
      setIntroduced(item.introduced_at);
      setExpensive(item.is_expensive);
      setLong(item.long || 14.12)
      setLat(item.lat || 22.36)
    }
  }, [match.params.id, items]);

  useEffect(() => {
    if(item)
      setPhoto(photos.find(photo => photo.resource_id == item.id?.toString()))
  })

  async function checkForConflicts() {
    const editedItem = item ? { ...item, title, description, price, introduced_at, is_expensive } : { title, description, price, introduced_at, is_expensive };
    var localConflicts = false
    const originalItem = item
    if (editedItem.id != undefined) {
      const jsonitem = (await Storage.get({ key: editedItem.id?.toString() })).value
      if (jsonitem) {
        const storageItem = JSON.parse(jsonitem)
        if (!isNaN(storageItem.id) && originalItem) {
          if (storageItem.description != originalItem.description && !descSolved) {
            setStashedDesc(storageItem.description)
            localConflicts = true
          }
          if (storageItem.title != originalItem.title && !titleSolved) {
            setStashedTitle(storageItem.title)
            localConflicts = true
          }
          if (storageItem.price != originalItem.price && !priceSolved) {
            setStashedPrice(storageItem.price)
            localConflicts = true
          }

          if(stashedPrice == price)
            setPriceSolved(true)

          if(stashedDes == description)
            setDescSolved(true)

          if(stashedTitle == title)
            setTitleSolved(true)

          if(localConflicts == true) {
            setConflicts(true)
          }
          else {
            const editedItem = item ? { ...item, title, description, price, introduced_at, is_expensive } : { title, description, price, introduced_at, is_expensive };
            saveItem?.(editedItem).then(() => history.goBack());
          }
        }
        else {
          setConflicts(false)
        }
      }

    }
    //e vorba despre adaugare, nu update
    else {
      saveItem?.(editedItem).then(() => history.goBack());
    }
  }

  useEffect(() => {
    log("conflicts from whitin the hook")
    if (firstUpdate.current) {
      firstUpdate.current = false;
      return;
    }

    if (conflicts == false) {
      const editedItem = item ? { ...item, title, description, price, introduced_at, is_expensive } : { title, description, price, introduced_at, is_expensive };
      saveItem?.(editedItem).then(() => history.goBack());
    }
  }, [conflicts]);

  const handleSave = () => {
    if(networkStatus.connected) {
      const editedItem = item ? { ...item, title, description, price, introduced_at, is_expensive, path, long, lat } : { title, description, price, introduced_at, is_expensive, path, long, lat };
      saveItem?.(editedItem).then(() => history.goBack());
    }
    else
      checkForConflicts()
  };

  const handleDelete = () => {
    const editedItem = item
      ? { ...item, title, description, price, introduced_at, is_expensive }
      : { title, description, price, introduced_at, is_expensive };
    deleteItem && deleteItem(editedItem).then(() => history.goBack());
  }

  const handleStashedDesc = async() => {
    if (item?.id) {
      const jsonitem = (await Storage.get({ key: item.id?.toString() })).value
      if (jsonitem) {
        const storageItem = JSON.parse(jsonitem)
        setDescription(storageItem.description)
      }
    }
    setDescSolved(true)
  }

  const handleCurrentDesc = () => {
    setDescription(description)
    setStashedDesc('')
    setDescSolved(true)
  }

  const handleStashedTitle = async() => {
    if (item?.id) {
      const jsonitem = (await Storage.get({ key: item.id?.toString() })).value
      if (jsonitem) {
        const storageItem = JSON.parse(jsonitem)
        setTitle(storageItem.title)
      }
    }
    setTitleSolved(true)
  }

  const handleCurrentTitle = () => {
    setTitle(title)
    setStashedTitle('')
    setTitleSolved(true)
  }

  const handleStashedPrice = async() => {
    if (item?.id) {
      const jsonitem = (await Storage.get({ key: item.id?.toString() })).value
      if (jsonitem) {
        const storageItem = JSON.parse(jsonitem)
        setPrice(storageItem.price)
      }
    }
    setPriceSolved(true)
  }

  const handleCurrentPrice = () => {
    setPrice(price)
    setStashedPrice(0);
    setPriceSolved(true)
  }

  const backToMenu = () => {
    history.goBack();
  }

  useEffect(() => {
    if(item) {
      log("am intrat in useeffects")
      const photo = photos.find(photo => photo.resource_id == item.id?.toString())
      if(photo) {
        setPath(photo.webviewPath || '')
      }
    }
  }, [photos])
  return (
    <IonPage>
      <IonHeader>
        <IonText>Network status is: {JSON.stringify(networkStatus)} </IonText>
        <IonToolbar>
          <IonTitle>Edit</IonTitle>
          <IonButtons slot="start">
            <IonButton onClick={backToMenu}>
              Back
            </IonButton>
          </IonButtons>
          <IonButtons slot="end">
            <IonButton onClick={
              handleSave}
            >
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
              displayFormat="DD/MM/YYYY HH:mm"
              value={introduced_at} onIonChange={e => setIntroduced(e.detail.value || '')} />
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
        <IonContent class='map'>
        <MyMap
            lat={ Number(lat) }
            lng={ Number(long) }
            onMapClick={(location: any) => {
              setLat(location.latLng.lat());
              setLong(location.latLng.lng());
            }}
          />
        </IonContent>
        { (item != undefined) && photos && <IonGrid>
          <IonRow>
            {photos.filter(p => p.resource_id == item.id!.toString()).map((photo, index) => (
              <IonCol size="6" key={index}>
                <IonImg onClick={() => setPhotoToDelete(photo)}
                        src={photo.webviewPath}/>
              </IonCol>
            ))}
          </IonRow>
          </IonGrid> }
        <IonActionSheet
          isOpen={!!photoToDelete}
          buttons={[{
            text: 'Delete',
            role: 'destructive',
            icon: trash,
            handler: () => {
              if (photoToDelete) {
                deletePhoto(photoToDelete);
                setPhotoToDelete(undefined);
              }
            }
          }, {
            text: 'Cancel',
            icon: close,
            role: 'cancel'
          }]}
          onDidDismiss={() => setPhotoToDelete(undefined)}
        />
        {conflicts && <IonList>
          <IonListHeader>
            Conflicts
          </IonListHeader>
          {stashedDes && (stashedDes != description) && <IonItem>
            <IonLabel>Stashed: {stashedDes}  | Current: {description} </IonLabel>
            <IonButtons slot="end">
              <IonButton onClick={handleStashedDesc}>Accept stashed</IonButton>
              <IonButton onClick={handleCurrentDesc}>Accept current</IonButton>
            </IonButtons>
          </IonItem>}
          {stashedTitle && (stashedTitle != title) && <IonItem>
            <IonLabel>Stashed: {stashedTitle} | Current: {title}</IonLabel>
            {<IonButtons slot="end">
              <IonButton onClick={handleStashedTitle}>Accept stashed</IonButton>
              <IonButton onClick={handleCurrentTitle}>Accept current</IonButton>
            </IonButtons>}
          </IonItem>}
          { stashedPrice!=0 && (stashedPrice != price) && <IonItem>
          <IonLabel>Stashed: {stashedPrice} | Current: {price}</IonLabel>
            {<IonButtons slot="end">
              <IonButton onClick={handleStashedPrice}>Accept stashed</IonButton>
              <IonButton onClick={handleCurrentPrice}>Accept current</IonButton>
            </IonButtons>}
          </IonItem>}
        </IonList>}
        <IonFab vertical="bottom" horizontal="center" slot="fixed">
          <IonFabButton onClick={() => { if(!item) { takePhoto('undefined') }
                                            else  { takePhoto(item.id!.toString())
                                              }
                                               } }>
            <IonIcon icon={camera} />
          </IonFabButton>
        </IonFab>
      </IonContent>
    </IonPage>
  )
}

export default MenuItemEdit;
