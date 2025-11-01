import type{ Request,Response } from "express";

import { PrismaClient } from "@prisma/client";
import { wktToGeoJSON } from "@terraformer/wkt";

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
    // console.log(manager);
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

export const getManagerProperties = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { cognitoId } = req.params;
     if (!cognitoId) {
      throw res.status(400).json({ message: "cognitoId is required in params" });
    }
    const properties = await prisma.property.findMany({
      where: { managerCognitoId:cognitoId },
      include: {
        location: true,
      },
    });
      
    const propertiesWithFormattedLocation = await Promise.all(
      properties.map(async (property) => {
        const coordinates: { coordinates: string }[] =
          await prisma.$queryRaw`SELECT ST_asText(coordinates) as coordinates from "Location" where id = ${property.location.id}`;

        const geoJSON: any = wktToGeoJSON(coordinates[0]?.coordinates || "");
        const longitude = geoJSON.coordinates[0];
        const latitude = geoJSON.coordinates[1];

        return {
          ...property,
          location: {
            ...property.location,
            coordinates: {
              longitude,
              latitude,
            },
          },
        };
        
      })
    );
      res.json(propertiesWithFormattedLocation);
  } catch (err: any) {
    res
      .status(500)
      .json({ message: `Error retrieving Manager property: ${err.message}` });
  }
};