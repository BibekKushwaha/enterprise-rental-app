"use client";
import { useGetAuthUserQuery, useUpdateManagerSettingMutation } from '@/state/api';
import React from 'react';
import SettingForm from '@/components/SettingsForm';
import Loading from '@/components/Loading';

const ManagerSettings = () => {
    const {data:authUser,isLoading} = useGetAuthUserQuery();
    const [updateManager] = useUpdateManagerSettingMutation();

    if(isLoading){
        return <Loading />;
    }

    const initialData = {
      name: authUser?.userInfo.name,
      email: authUser?.userInfo.email,
      phoneNumber: authUser?.userInfo.phoneNumber,
    };
    
    const handleSubmit = async(data: typeof initialData)=>{
      await updateManager({
        cognitoId: authUser?.cognitoInfo.userId,
        ...data,
      })
    }
    
  return (
    <SettingForm 
    initialData={initialData}
    onSubmit={handleSubmit}
    userType='manager'
    />
  )
}

export default ManagerSettings