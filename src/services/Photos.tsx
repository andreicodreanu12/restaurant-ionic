import {
  IonActionSheet,
  IonCol,
  IonContent,
  IonFab,
  IonFabButton,
  IonGrid,
  IonHeader,
  IonIcon,
  IonImg,
  IonPage,
  IonButton,
  IonButtons,
  IonRow,
  IonTitle,
  IonToolbar
} from '@ionic/react';
import React, { useState } from 'react';
import { camera, close, trash } from 'ionicons/icons';
import { Photo, usePhotoGallery } from '../utils/usePhotoGallery';
import { RouteComponentProps } from 'react-router';

const Photos: React.FC<RouteComponentProps> = ({history}) => {
  const { photos, deletePhoto } = usePhotoGallery();
  const [photoToDelete, setPhotoToDelete] =useState<Photo>();

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Photo Gallery</IonTitle>
          <IonButtons slot="start">
            <IonButton onClick={() => history.goBack()}>
              Back
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Blank</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonGrid>
          <IonRow>
            {photos.map((photo, index) => (
              <IonCol size="6" key={index}>
                <IonImg onClick={() => setPhotoToDelete(photo)}
                        src={photo.webviewPath}/>
              </IonCol>
            ))}
          </IonRow>
        </IonGrid>
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
      </IonContent>
    </IonPage>
  );
};

export default Photos;