import React from "react";
import { withScriptjs, withGoogleMap, GoogleMap, Marker } from 'react-google-maps';
import { compose, withProps } from 'recompose';
import { MenuItemProps } from "../menu_items/MenuItemProps";
import { useMyLocation } from '../utils/useMyLocation';
import { mapsApiKey } from '../utils/mapsApiKey';
import { locationSharp } from "ionicons/icons";

interface MyMapProps {
  locations: MenuItemProps[],
}

export const GeneralMap =
  compose<MyMapProps, any>(
    withProps({
      googleMapURL:
        `https://maps.googleapis.com/maps/api/js?key=${mapsApiKey}&v=3.exp&libraries=geometry,drawing,places`,
      loadingElement: <div style={{ height: `100%` }} />,
      containerElement: <div style={{ height: `90%` }} />,
      mapElement: <div style={{ height: `90%` }} />
    }),

    withScriptjs,
    withGoogleMap
  )(props => (
    <GoogleMap
      defaultZoom={8}
      defaultCenter={{ lat: 50.32, lng: 46.12 }}
    >
      {props.locations.map(item => {
        var latI = Number(item.lat)
        var longL = Number(item.long)

        return (
          <Marker
            key={item.id}
            position= {{ lat: latI, lng: longL } } />
        )
      })}
    </GoogleMap>
  ))
