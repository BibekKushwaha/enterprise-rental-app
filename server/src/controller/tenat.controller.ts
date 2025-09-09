import type{ Request,Response } from "express";

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
 
export const getTanent =  async (req:Request,res:Response) =>{
  try {
    const {cognitoId}  = req.params;
    if (!cognitoId) {
      return res.status(400).json({ message: "cognitoId is required in params" });
    }
    const tenant = await prisma.tenant.findUnique({
      where: { cognitoId },
      include: {
        favorites: true,
      }
    });
    console.log(tenant);
    if(tenant){
        res.json(tenant);
    }else{
        res.status(404).json({message: " Tenant not found"});
    }
  } catch (error:any) {
    console.error("Error fetching tenants:", error);
    res.status(500).json({message: `Error retreving tenant : ${error.message}` })
  } finally {
    await prisma.$disconnect();
  }
}

export const createTanent =  async (req:Request,res:Response) =>{
  try {
    const {cognitoId,name,email,phoneNumber}  = req.body;
    if (!cognitoId) {
      return res.status(400).json({ message: "cognitoId is required in params" });
    }
    const tenant = await prisma.tenant.create({
        data: {
            cognitoId,
            name,
            email,
            phoneNumber,
        }
    });
    res.json(tenant)
  } catch (error:any) {
    console.error("Error creating tenants:", error);
    res.status(500).json({message: `Error creatinf tenant : ${error.message}` })
  } finally {
    await prisma.$disconnect();
  }
}

export const updateTanent =  async (req:Request,res:Response) =>{
  try {
    const {cognitoId} = req.params;
    const {name,email,phoneNumber}  = req.body;
    if (!cognitoId) {
      return res.status(400).json({ message: "cognitoId is required in params" });
    }
    const tenantUpdate = await prisma.tenant.update({
      where:{cognitoId},
      data: {
          cognitoId,
          name,
          email,
          phoneNumber,
      }
    });
    res.json(tenantUpdate)
  } catch (error:any) {
    console.error("Error updating tenants:", error);
    res.status(500).json({message: `Error updating tenant : ${error.message}` })
  } finally {
    await prisma.$disconnect();
  }
}