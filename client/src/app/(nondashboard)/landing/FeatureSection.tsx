"use client";
import React from 'react';
import {motion} from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';

const containerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible:{
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.5,
            staggerChildren: 0.2
        }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
};

interface FeatureSectionProps {
  roleView?: "renter" | "manager";
}

const FeatureSection = ({ roleView = "manager" }: FeatureSectionProps) => {
  const isManager = roleView === "manager";

  const managerCards = [
    {
      title: "Manage Your Properties",
      description:
        "Add, edit, and manage all your rental properties from one place.",
      linkText: "My Properties",
      linkHref: "/managers/properties",
      imageSrc: "/landing-i1.png",
    },
    {
      title: "Track Your Listings",
      description:
        "Monitor your active, rented, and available properties.",
      linkText: "View Listings",
      linkHref: "/managers/properties",
      imageSrc: "/landing-i2.png",
    },
    {
      title: "Manage Applications",
      description:
        "Review prospective tenants and manage rental applications efficiently.",
      linkText: "Applications",
      linkHref: "/managers/applications",
      imageSrc: "/landing-i3.png",
    },
  ];

  const renterCards = [
    {
      title: "Trustworthy and Verified Listings",
      description:
        "Discover the best rental properties with our verified listings, ensuring you find a safe and reliable home.",
      linkText: "Explore",
      linkHref: "/search",
      imageSrc: "/landing-search3.png",
    },
    {
      title: "Browse Rental Listing with Ease",
      description:
        "Get to access a wide range of rental listings with detailed information and high-quality images.",
      linkText: "Search",
      linkHref: "/search",
      imageSrc: "/landing-search2.png",
    },
    {
      title: "Simplify Your Rental Search with Advanced Filters",
      description:
        "Find trustworthy rental listings with ease using our advanced search filters and verified properties.",
      linkText: "Discover",
      linkHref: "/search",
      imageSrc: "/landing-search1.png",
    },
  ];

  const activeCards = isManager ? managerCards : renterCards;

  return (
    <motion.div
      key={roleView}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={containerVariants}
      className="pt-12 sm:pt-16 pb-16 px-6 sm:px-8 lg:px-12 xl:px-16 bg-white"
    >
      <div className="max-w-4xl xl:max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <motion.h2
            variants={itemVariants}
            className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4 max-w-3xl mx-auto tracking-tight"
          >
            {isManager
              ? "Manage your properties. Find the right tenants. Grow your rental business."
              : "Quickly find the home you want using our advanced search filters."}
          </motion.h2>

          {isManager && (
            <motion.p
              variants={itemVariants}
              className="text-gray-500 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed"
            >
              Everything you need to list properties, manage inquiries, track
              applications, and monitor your rental business in one place.
            </motion.p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 xl:gap-16">
          {activeCards.map((card, index) => (
            <motion.div key={index} variants={itemVariants}>
              <FeatureCard
                imageSrc={card.imageSrc}
                title={card.title}
                description={card.description}
                linkText={card.linkText}
                linkHref={card.linkHref}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

const FeatureCard = ({
    imageSrc,
    title,
    description,
    linkText,
    linkHref,
}:{
    imageSrc: string;
    title: string;
    description: string;
    linkText: string;
    linkHref: string;
}) => {
    return (
        <div className='text-center'>
            <div className='p-4 rounded-lg mb-4 flex items-center justify-center h-48'>
                <Image
                src={imageSrc}
                alt={title}
                width={400}
                height={400}
                className='object-contain h-full w-full'
                />
            </div>
            <h3 className='text-xl font-semibold mb-2'>{title}</h3>
            <p className='mb-4'>{description}</p>
            <Link href={linkHref} className='inline-block border border-gray-300 rounded px-4 py-2 hover:bg-gray-100'
            scroll={false}>
                {linkText}
            </Link>
        </div>
    )
}

export default FeatureSection