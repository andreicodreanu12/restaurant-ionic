import { IonContent, IonPage, IonHeader, IonToolbar, IonButtons, IonButton, IonTitle } from "@ionic/react";
import React from "react";
import { RouteComponentProps } from "react-router";
import { useMyLocation } from "../utils/useMyLocation";
import { MyMap } from "./MyMap";

const Map: React.FC<RouteComponentProps> = ({ history }) => {
  const myLocation = useMyLocation();
  const { latitude: lat, longitude: lng } = myLocation.position?.coords || {};
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Photo Galery</IonTitle>
          <IonButtons slot="start">
            <IonButton onClick={() => history.goBack()}>
              Back
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <div>My Location is</div>
        <div>Latitude: {lat}</div>
        <div>Longitude: {lng}</div>
        {lat && lng && (
          <MyMap
            lat={lat}
            lng={lng}
            onMapClick={log("onMap")}
            onMarkerClick={log("onMarker")}
          />
        )}
      </IonContent>
    </IonPage>
  );

  function log(source: string) {
    return (e: any) => console.log(source, e.latLng.lat(), e.latLng.lng());
  }
};

export default Map;