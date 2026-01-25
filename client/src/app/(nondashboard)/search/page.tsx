"use client";

import { NAVBAR_HEIGHT } from "@/lib/constants";
import { useAppDispatch, useAppSelector } from "@/state/redux";
import { useSearchParams } from "next/navigation";
import React, { useEffect } from "react";
import FiltersBar from "./FiltersBar";
import { setFilters } from "@/state";
import { cleanParams } from "@/lib/create-new-user";
import FiltersFull from "./FiltersFull";
import Map from "./map";
import Listings from "./Listings";

const SearchPage = () => {
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const isFiltersFullOpen = useAppSelector(
    (state) => state.global.isFiltersFullOpen
  );

  useEffect(() => {
    const initialFilters = Array.from(searchParams.entries()).reduce(
      (acc: any, [key, value]) => {
        if (key === "priceRange" || key === "squareFeet") {
          acc[key] = value.split(",").map((v) => (v === "" ? null : Number(v)));
        } else if (key === "coordinates") {
          acc[key] = value.split(",").map(Number);
        } else if (key === "amenities") {
          // Parse amenities as an array of strings
          acc[key] = value ? value.split(",").filter(Boolean) : [];
        } else {
          acc[key] = value === "any" ? null : value;
        }

        return acc;
      },
      {}
    );

    const cleanedFilters = cleanParams(initialFilters);
    dispatch(setFilters(cleanedFilters));
  }, [searchParams, dispatch]);

  return (
    <div
      className="w-full mx-auto px-3 md:px-5 flex flex-col"
      style={{
        minHeight: `calc(100vh - ${NAVBAR_HEIGHT}px)`,
      }}
    >
      <FiltersBar />
      {/* Mobile: Stack vertically (map first, then listings) */}
      {/* Desktop: Side by side */}
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start flex-1 overflow-hidden gap-3 mb-5">
        {/* Filters Panel - Hidden on mobile, visible on desktop when open */}
        <div
          className={`hidden lg:block overflow-auto transition-all duration-300 ease-in-out ${
            isFiltersFullOpen
              ? "lg:w-3/12 opacity-100 visible max-h-[calc(100vh-150px)]"
              : "w-0 opacity-0 invisible"
          }`}
        >
          <FiltersFull />
        </div>
        
        {/* Map - Full width on mobile, partial on desktop */}
        <div className="w-full h-[50vh] lg:h-[calc(100vh-150px)] lg:basis-5/12 lg:grow order-1 lg:sticky lg:top-0">
          <Map />
        </div>
        
        {/* Listings - Full width on mobile, partial on desktop */}
        <div className="w-full lg:basis-4/12 overflow-y-auto order-2 flex-1 lg:flex-none lg:max-h-[calc(100vh-150px)]">
          <Listings />
        </div>
      </div>
      
      {/* Mobile Filters Modal */}
      <div
        className={`lg:hidden fixed inset-0 z-50 bg-white transition-transform duration-300 ease-in-out ${
          isFiltersFullOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{ top: `${NAVBAR_HEIGHT}px` }}
      >
        <div className="h-full overflow-auto">
          <FiltersFull />
        </div>
      </div>
    </div>
  );
};

export default SearchPage;