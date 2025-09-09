import type{ Request,Response } from "express";

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
 
export const getManager =  async (req:Request,res:Response) =>{
  try {
    const {cognitoId}  = req.params;
    if (!cognitoId) {
      return res.status(400).json({ message: "cognitoId is required in params" });
    }
    const manager = await prisma.manager.findUnique({
      where: { cognitoId },
    });
    console.log(manager);
    if(manager){
        res.json(manager);
    }else{
        res.status(404).json({message: " manager not found"});
    }
  } catch (error:any) {
    console.error("Error fetching tenants:", error);
    res.status(500).json({message: `Error retreving manager : ${error.message}` })
  } finally {
    await prisma.$disconnect();
  }
}

export const createManager =  async (req:Request,res:Response) =>{
  try {
    const {cognitoId,name,email,phoneNumber}  = req.body;
    if (!cognitoId) {
      return res.status(400).json({ message: "cognitoId is required in params" });
    }
    const manager = await prisma.manager.create({
        data: {
            cognitoId,
            name,
            email,
            phoneNumber,
        }
    });
    res.json(manager)
  } catch (error:any) {
    console.error("Error creating tenants:", error);
    res.status(500).json({message: `Error creatinf manager : ${error.message}` })
  } finally {
    await prisma.$disconnect();
  }
}

export const updateManager =  async (req:Request,res:Response) =>{
  try {
    const {cognitoId} = req.params;
    const {name,email,phoneNumber}  = req.body;
    if (!cognitoId) {
      return res.status(400).json({ message: "cognitoId is required in params" });
    }
    const managerUpdate = await prisma.manager.update({
      where:{cognitoId},
      data: {
          cognitoId,
          name,
          email,
          phoneNumber,
      }
    });
    res.json(managerUpdate)
  } catch (error:any) {
    console.error("Error updating managers:", error);
    res.status(500).json({message: `Error updating managers : ${error.message}` })
  } finally {
    await prisma.$disconnect();
  }
}