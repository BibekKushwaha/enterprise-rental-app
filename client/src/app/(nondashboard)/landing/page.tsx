"use client";

import React, { useState } from 'react';
import HeroSection from './HeroSection';
import FeatureSection from './FeatureSection';
import DiscoverSection from './DiscoverSection';
import CallToActionSection from './CallToActionSection';
import FooterSection from './FooterSection';
import { useGetAuthUserQuery } from '@/state/api';

const Landing = () => {
  const { data: authUser } = useGetAuthUserQuery();
  const roleView: "renter" | "manager" =
    authUser?.userRole?.toLowerCase() === "manager" ? "manager" : "renter";

  return (
    <div>
      <HeroSection roleView={roleView} />
      <FeatureSection roleView={roleView} />
      <DiscoverSection />
      <CallToActionSection />
      <FooterSection />
    </div>
  );
};

export default Landing;