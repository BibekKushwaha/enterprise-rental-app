"use client";
import React, { useRef, useEffect } from 'react'
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { useAppSelector } from '@/state/redux';
import { useGetPropertiesQuery } from '@/state/api';
import { Property } from '@/types/prismaType';
import Loading from '@/components/Loading';

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN as string;

const Map = () => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const searchMarkerRef = useRef<mapboxgl.Marker | null>(null);
  const filters = useAppSelector((state) => state.global.filters);
  const isFiltersFullOpen = useAppSelector((state) => state.global.isFiltersFullOpen);
  const {
    data: properties,
    isLoading,
    isError,
  } = useGetPropertiesQuery(filters);

  // Initialize map
  useEffect(() => {
    if (isLoading || isError || !properties || !mapContainerRef.current) return;

    // Create map only if it doesn't exist
    if (!mapRef.current) {
      mapRef.current = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: "mapbox://styles/mbibek/cmgjor100001q01s60xz925g9",
        center: filters.coordinates || [-74.5, 40],
        zoom: 9,
      });
    } else {
      // Update center if map already exists
      mapRef.current.setCenter(filters.coordinates || [-74.5, 40]);
    }

    // Clear existing property markers
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    // Remove previous search marker
    if (searchMarkerRef.current) {
      searchMarkerRef.current.remove();
      searchMarkerRef.current = null;
    }

    // Add search location marker (red pin for searched location)
    if (filters.coordinates && filters.location) {
      const searchMarkerEl = document.createElement("div");
      searchMarkerEl.className = "search-location-marker";
      searchMarkerEl.innerHTML = `
        <svg width="32" height="40" viewBox="0 0 32 40" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M16 0C7.164 0 0 7.164 0 16C0 28 16 40 16 40C16 40 32 28 32 16C32 7.164 24.836 0 16 0Z" fill="#E53E3E"/>
          <circle cx="16" cy="16" r="8" fill="white"/>
          <circle cx="16" cy="16" r="4" fill="#E53E3E"/>
        </svg>
      `;
      
      searchMarkerRef.current = new mapboxgl.Marker({ element: searchMarkerEl, anchor: "bottom" })
        .setLngLat(filters.coordinates)
        .setPopup(
          new mapboxgl.Popup({ offset: 25 }).setHTML(
            `<div class="search-popup">
              <strong>📍 ${filters.location}</strong>
              <p style="margin: 4px 0 0; font-size: 12px; color: #666;">Search Location</p>
            </div>`
          )
        )
        .addTo(mapRef.current);
    }

    // Add property markers
    properties.forEach((property) => {
      const marker = createPropertyMarker(property, mapRef.current!);
      const markerElement = marker.getElement();
      const path = markerElement.querySelector("path[fill='#3FB1CE']");
      if (path) path.setAttribute("fill", "#000000");
      markersRef.current.push(marker);
    });

    return () => {
      // Only cleanup markers on unmount, not the map
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];
    };
  }, [isLoading, isError, properties, filters.coordinates, filters.location]);

  // Handle map resize when filter panel opens/closes
  useEffect(() => {
    if (mapRef.current) {
      setTimeout(() => mapRef.current?.resize(), 300);
    }
  }, [isFiltersFullOpen]);

  // Cleanup map on unmount
  useEffect(() => {
    return () => {
      if (searchMarkerRef.current) {
        searchMarkerRef.current.remove();
        searchMarkerRef.current = null;
      }
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  if (isLoading) return <Loading />;
  if (isError || !properties) return <div>Failed to fetch properties</div>;
  
  return (
    <div className="w-full h-full relative rounded-xl">
      <div
        className="map-container rounded-xl"
        ref={mapContainerRef}
        style={{
          height: "100%",
          width: "100%",
          minHeight: "300px",
        }}
      />
    </div>
  );
}


const createPropertyMarker = (property: Property, map: mapboxgl.Map) => {
  const marker = new mapboxgl.Marker()
    .setLngLat([
      property.location.coordinates.longitude,
      property.location.coordinates.latitude,
    ])
    .setPopup(
      new mapboxgl.Popup().setHTML(
        `
        <div class="marker-popup">
          <div class="marker-popup-image"></div>
          <div>
            <a href="/search/${property.id}" target="_blank" class="marker-popup-title">${property.name}</a>
            <p class="marker-popup-price">
              $${property.pricePerMonth}
              <span class="marker-popup-price-unit"> / month</span>
            </p>
          </div>
        </div>
        `
      )
    )
    .addTo(map);
  return marker;
};

export default Map;