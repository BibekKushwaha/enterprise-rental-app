"use client";
import { useGetAuthUserQuery, useGetPropertyQuery } from '@/state/api';
import { useParams } from 'next/navigation';
import React, { useState } from 'react'
import ImagePreviews from './imagePreview';
import PropertyOverview from './propertyOverView';
import PropertyDetails from './propertyDetails';
import PropertyLocation from './propertyLocation';
import ContactWidget from './ContactWidget';
import ApplicationModal from './ApplicationModal';
import Loading from '@/components/Loading';

const SingleListing = () => {
    const {id} = useParams();
    const propertyId = Number(id);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { data: authUser } = useGetAuthUserQuery();
    const { data: property, isLoading, isError } = useGetPropertyQuery(propertyId);

    if (isLoading) return <Loading />;
    if (isError || !property) return <div>Property not found</div>;
    
  return (
    <div>
        <ImagePreviews
        images={property.photoUrls?.length > 0 ? property.photoUrls : ["/singlelisting-2.jpg", "/singlelisting-3.jpg"]}
      />
      <div className="flex flex-col md:flex-row justify-center gap-10 mx-10 md:w-2/3 md:mx-auto mt-16 mb-8">
        <div className="order-2 md:order-1">
             <PropertyOverview propertyId={propertyId} />
            <PropertyDetails propertyId={propertyId} />
            <PropertyLocation propertyId={propertyId} /> 
        </div>
        <div className='order-1 md:order-2'>
          <ContactWidget onOpenModal = {()=>setIsModalOpen(true)}/>
        </div>
      </div>
      {authUser && (
        <ApplicationModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          propertyId={propertyId}
        />
      )}
    </div>
  )
}

export default SingleListing;