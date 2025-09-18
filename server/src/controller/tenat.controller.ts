import type{ Request,Response } from "express";

import { PrismaClient } from "@prisma/client";
import { wktToGeoJSON } from "@terraformer/wkt";

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

export const getCurrentResidence = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { cognitoId } = req.params;
     if (!cognitoId) {
      throw res.status(400).json({ message: "cognitoId is required in params" });
    }
    const properties = await prisma.property.findMany({
      where: { tenants: {some:{cognitoId}}},
      include: {
        location: true,
      },
    });
      
    const residenceWithFormattedLocation = await Promise.all(
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
      res.json(residenceWithFormattedLocation);
  } catch (err: any) {
    res
      .status(500)
      .json({ message: `Error retrieving Manager property: ${err.message}` });
  }
};

export const addFavoriteProperty = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { cognitoId, propertyId } = req.params;
    if (!cognitoId) {
      throw res.status(400).json({ message: "cognitoId is required in params" });
    }
    const tenant = await prisma.tenant.findUnique({
      where: { cognitoId },
      include: { favorites: true },
    });

    if (!tenant) {
      res.status(404).json({ message: "Tenant not found" });
      return;
    }

    const propertyIdNumber = Number(propertyId);
    const existingFavorites = tenant.favorites || [];

    if (!existingFavorites.some((fav) => fav.id === propertyIdNumber)) {
      const updatedTenant = await prisma.tenant.update({
        where: { cognitoId },
        data: {
          favorites: {
            connect: { id: propertyIdNumber },
          },
        },
        include: { favorites: true },
      });
      res.json(updatedTenant);
    } else {
      res.status(409).json({ message: "Property already added as favorite" });
    }
  } catch (error: any) {
    res
      .status(500)
      .json({ message: `Error adding favorite property: ${error.message}` });
  }
};


export const removeFavoriteProperty = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { cognitoId, propertyId } = req.params;
    const propertyIdNumber = Number(propertyId);
    if (!cognitoId) {
      throw res.status(400).json({ message: "cognitoId is required in params" });
    }
    const updatedTenant = await prisma.tenant.update({
      where: { cognitoId },
      data: {
        favorites: {
          disconnect: { id: propertyIdNumber },
        },
      },
      include: { favorites: true },
    });

    res.json(updatedTenant);
  } catch (err: any) {
    res
      .status(500)
      .json({ message: `Error removing favorite property: ${err.message}` });
  }
};