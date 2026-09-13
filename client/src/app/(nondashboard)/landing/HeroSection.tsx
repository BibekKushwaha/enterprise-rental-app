"use client";
import Image from 'next/image';
import React, { useState } from 'react';
import { motion } from "framer-motion";
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';
import { setFilters } from '@/state';
import { Building2, Home, Key, Plus, Sparkles } from 'lucide-react';
import Link from 'next/link';

interface HeroSectionProps {
  roleView?: "renter" | "manager";
}

const HeroSection = ({ roleView = "renter" }: HeroSectionProps) => {
  const dispatch = useDispatch();
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  const handleLocationSearch = async () => {
    try {
      const trimmedQuery = searchQuery.trim();
      if (!trimmedQuery) return;

      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
          trimmedQuery
        )}.json?access_token=${process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN
        }&fuzzyMatch=true`
      );
      const data = await response.json();
      if (data.features && data.features.length > 0) {
        const [lng, lat] = data.features[0].center;
        dispatch(
          setFilters({
            location: trimmedQuery,
            coordinates: [lng, lat],
          })
        );
        const params = new URLSearchParams({
          location: trimmedQuery,
          lat: lat.toString(),
          lng: lng.toString(),
        });
        router.push(`/search?${params.toString()}`);
      }
    } catch (error) {
      console.error("error search location:", error);
    }
  };

  return (
    <div className='relative h-screen min-h-[600px]'>
      <Image src="/landing-splash.jpg" alt='landing page image' fill className='object-cover object-center' priority />
      <div className='absolute inset-0 bg-black/65 backdrop-blur-[1px]'>
        <motion.div
          key={roleView}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center w-full max-w-4xl px-6 sm:px-12'
        >
          {roleView === "manager" ? (
            /* Recommended Manager Hero */
            <div>

              <h1 className='text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white mb-6 leading-tight tracking-tight'>
                Manage your properties with confidence.
              </h1>
              <p className='text-lg sm:text-xl text-gray-200 mb-8 max-w-2xl mx-auto leading-relaxed'>
                List your properties, connect with prospective tenants, and manage your rental listings effortlessly.
              </p>

              <div className='flex flex-wrap items-center justify-center gap-4 mb-10'>
                <Link href="/managers/newproperty" scroll={false}>
                  <Button className='bg-secondary-500 hover:bg-secondary-600 text-white font-semibold h-13 px-8 text-base rounded-xl shadow-lg hover:shadow-secondary-500/25 transition-all'>
                    <Plus className="w-5 h-5 mr-2" />
                    Add Property
                  </Button>
                </Link>
                <Link href="/managers/properties" scroll={false}>
                  <Button variant="outline" className='bg-white/10 hover:bg-white/20 text-white border-white/30 h-13 px-8 text-base rounded-xl backdrop-blur-sm font-medium'>
                    <Building2 className="w-5 h-5 mr-2" />
                    View Properties
                  </Button>
                </Link>
              </div>


            </div>
          ) : (
            /* Tenant Renter Hero */
            <div>
              <h1 className='text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight'>
                Start your journey to finding the perfect place to call Home
              </h1>
              <p className='text-lg sm:text-xl text-gray-200 mb-8 max-w-2xl mx-auto'>
                Explore our wide range of rental properties tailored to fit your lifestyle and need!
              </p>
              <div className='flex justify-center max-w-xl mx-auto shadow-2xl'>
                <Input
                  type='text'
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder='search by neighborhood or address'
                  className='w-full rounded-none rounded-l-xl bg-white h-13 text-base text-gray-900 px-4'
                />
                <Button onClick={handleLocationSearch} className='bg-secondary-500 text-white rounded-none rounded-r-xl border-none hover:bg-secondary-600 h-13 px-7 text-base font-semibold'>Search</Button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}

export default HeroSection;