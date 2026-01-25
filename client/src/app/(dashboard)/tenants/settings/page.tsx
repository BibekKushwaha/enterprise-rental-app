"use client";
import { useGetAuthUserQuery, useUpdateTenantSettingMutation } from '@/state/api';
import React from 'react';
import SettingForm from '@/components/SettingsForm';
import Loading from '@/components/Loading';

const TenantSettings = () => {
    const {data:authUser, isLoading} = useGetAuthUserQuery();
    console.log("authUser",authUser);
    const [updateTenant] = useUpdateTenantSettingMutation();

    if(isLoading){
        return <Loading />;
    }

    const initialData = {
      name: authUser?.userInfo.name,
      email: authUser?.userInfo.email,
      phoneNumber: authUser?.userInfo.phoneNumber,
    };
    
    const handleSubmit = async(data: typeof initialData)=>{
      await updateTenant({
        cognitoId: authUser?.cognitoInfo.userId,
        ...data,
      })
    }
    
  return (
    <SettingForm 
    initialData={initialData}
    onSubmit={handleSubmit}
    userType='tenant'
    />
  )
}

export default TenantSettings