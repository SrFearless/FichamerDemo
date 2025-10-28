"use client";

import React from "react";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";

interface MapComponentProps {
  latitude: number;
  longitude: number;
}

const containerStyle = {
  width: "100%",
  height: "400px",
};

export default function MapComponent({ latitude, longitude }: MapComponentProps) {
  const center = { lat: latitude, lng: longitude };

  return (
    <LoadScript googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ""}>
      <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={15}>
        <Marker position={center} />
      </GoogleMap>
    </LoadScript>
  );
}