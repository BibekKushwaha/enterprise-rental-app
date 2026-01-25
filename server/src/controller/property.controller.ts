import type{ Request,Response } from "express";

import { Prisma, PrismaClient } from "@prisma/client";
import { wktToGeoJSON } from "@terraformer/wkt";
import { S3Client, type S3ClientConfig } from "@aws-sdk/client-s3";
import { type Location } from "@prisma/client";
import { Upload } from "@aws-sdk/lib-storage";
import axios from "axios";

const prisma = new PrismaClient();

// S3 Client Configuration
// Uses environment variables: AWS_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, S3_BUCKET_NAME
const s3Config: S3ClientConfig = {
  region: process.env.AWS_REGION ?? "us-east-1",
};

// Add credentials if provided via environment variables
if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
  s3Config.credentials = {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  };
}

const s3Client = new S3Client(s3Config);
 
export const getProperties = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      favoriteIds,
      priceMin,
      priceMax,
      beds,
      baths,
      propertyType,
      squareFeetMin,
      squareFeetMax,
      amenities,
      availableFrom,
      latitude,
      longitude
    } = req.query;

    let whereConditions: Prisma.Sql[] = [];

    if (favoriteIds) {
      const arr = (favoriteIds as string).split(",").map(Number);
      whereConditions.push(
        Prisma.sql`p.id IN (${Prisma.join(arr)})`
      );
    }

    if (priceMin) {
      whereConditions.push(Prisma.sql`p."pricePerMonth" >= ${Number(priceMin)}`);
    }
    if (priceMax) {
      whereConditions.push(Prisma.sql`p."pricePerMonth" <= ${Number(priceMax)}`);
    }

    if (beds && beds !== "any") {
      whereConditions.push(Prisma.sql`p.beds >= ${Number(beds)}`);
    }
    if (baths && baths !== "any") {
      whereConditions.push(Prisma.sql`p.baths >= ${Number(baths)}`);
    }

    if (squareFeetMin) {
      whereConditions.push(Prisma.sql`p."squareFeet" >= ${Number(squareFeetMin)}`);
    }
    if (squareFeetMax) {
      whereConditions.push(Prisma.sql`p."squareFeet" <= ${Number(squareFeetMax)}`);
    }

    if (propertyType && propertyType !== "any") {
      whereConditions.push(
        Prisma.sql`p."propertyType" = ${propertyType}::"PropertyType"`
      );
    }

    if (amenities && amenities !== "any") {
      const arr = (amenities as string).split(",").filter(Boolean);
      // Valid amenity enum values
      const validAmenities = [
        "WasherDryer", "AirConditioning", "Dishwasher", "HighSpeedInternet",
        "HardwoodFloors", "WalkInClosets", "Microwave", "Refrigerator",
        "Pool", "Gym", "Parking", "PetsAllowed", "WiFi"
      ];
      // Filter to only valid amenity values
      const validArr = arr.filter(a => validAmenities.includes(a));
      if (validArr.length > 0) {
        whereConditions.push(
          Prisma.sql`p.amenities @> ARRAY[${Prisma.join(validArr)}]::"Amenity"[]`
        );
      }
    }

    if (availableFrom && availableFrom !== "any") {
      const date = new Date(availableFrom as string);
      if (!isNaN(date.getTime())) {
        whereConditions.push(
          Prisma.sql`
          NOT EXISTS (
            SELECT 1 FROM "Lease" l2
            WHERE l2."propertyId" = p.id 
            AND l2."startDate" > ${date}::timestamp
          )`
        );
      }
    }

    if (latitude && longitude) {
      const lat = Number(latitude);
      const lng = Number(longitude);
      const km = 1000;
      const deg = km / 111;

      whereConditions.push(
        Prisma.sql`
          ST_DWithin(
            l.coordinates::geometry,
            ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326),
            ${deg}
          )
        `
      );
    }

    const completeQuery = Prisma.sql`
      SELECT 
        p.*,
        json_build_object(
          'id', l.id,
          'address', l.address,
          'city', l.city,
          'state', l.state,
          'country', l.country,
          'postalCode', l."postalCode",
          'coordinates', json_build_object(
            'longitude', ST_X(l.coordinates::geometry),
            'latitude', ST_Y(l.coordinates::geometry)
          )
        ) AS location
      FROM "Property" p
      JOIN "Location" l ON p."locationId" = l.id
      ${
        whereConditions.length > 0
          ? Prisma.sql`WHERE ${Prisma.join(whereConditions, " AND ")}`
          : Prisma.empty
      }
    `;

    const properties = await prisma.$queryRaw(completeQuery);
    res.json(properties);

  } catch (error: any) {
    console.error("Error fetching properties:", error);
    res.status(500).json({
      message: `Error retrieving properties: ${error.message}`
    });
  }
};


export const getProperty = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const property = await prisma.property.findUnique({
      where: { id: Number(id) },
      include: {
        location: true,
      },
    });

    if (property) {
      const coordinates: { coordinates: string }[] =
        await prisma.$queryRaw`SELECT ST_asText(coordinates) as coordinates from "Location" where id = ${property.location.id}`;

      const geoJSON: any = wktToGeoJSON(coordinates[0]?.coordinates || "");
      const longitude = geoJSON.coordinates[0];
      const latitude = geoJSON.coordinates[1];

      const propertyWithCoordinates = {
        ...property,
        location: {
          ...property.location,
          coordinates: {
            longitude,
            latitude,
          },
        },
      };
      res.json(propertyWithCoordinates);
    }
  } catch (err: any) {
    res
      .status(500)
      .json({ message: `Error retrieving property: ${err.message}` });
  }
};


export const createProperty = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const files = req.files as Express.Multer.File[];
    const {
      address,
      city,
      state,
      country,
      postalCode,
      managerCognitoId,
      ...propertyData
    } = req.body;

    // Handle file uploads to S3
    let photoUrls: string[] = [];
    
    if (files && files.length > 0) {
      photoUrls = await Promise.all(
        files.map(async (file) => {
          const uploadParams = {
            Bucket: process.env.S3_BUCKET_NAME!,
            Key: `properties/${Date.now()}-${file.originalname}`,
            Body: file.buffer,
            ContentType: file.mimetype,
          };

          const uploadResult = await new Upload({
            client: s3Client,
            params: uploadParams,
          }).done();

          // S3 Upload may return undefined Location in some cases
          if (!uploadResult.Location) {
            throw new Error(`Failed to upload file: ${file.originalname}`);
          }

          return uploadResult.Location;
        })
      );
    }

    console.log({ address, city, state, country, postalCode });


    const geocodingUrl = `https://nominatim.openstreetmap.org/search?${new URLSearchParams(
      {
        street: address,
        city,
        state,
        country,
        postalcode: postalCode,
        format: "json",
        limit: "1",
      }
    ).toString()}`;
    const geocodingResponse = await axios.get(geocodingUrl, {
      headers: {
        "User-Agent": "RealEstateApp/1.0 (justsomedummyemail@gmail.com)",
      },
    });

    console.log("Geocoding response:", geocodingResponse.data);

    if (!geocodingResponse.data.length) {
      throw new Error("Geocoding failed: No location found");
    }

    const [longitude, latitude] =
      geocodingResponse.data[0]?.lon && geocodingResponse.data[0]?.lat
        ? [
            parseFloat(geocodingResponse.data[0]?.lon),
            parseFloat(geocodingResponse.data[0]?.lat),
          ]
        : [0, 0];
    
    console.log("longitude ",longitude);
    console.log("latitude ",latitude);
    

    // create location
    const [location] = await prisma.$queryRaw<Location[]>`
      INSERT INTO "Location" (address, city, state, country, "postalCode", coordinates)
      VALUES (${address}, ${city}, ${state}, ${country}, ${postalCode}, ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326))
      RETURNING id, address, city, state, country, "postalCode", ST_AsText(coordinates) as coordinates;
    `;
    if (!location) {
        throw new Error("Location insert failed, no row returned");
    };

    // create property
    const newProperty = await prisma.property.create({
      data: {
        ...propertyData,
        photoUrls,
        locationId: location.id,
        managerCognitoId,
        amenities:
          typeof propertyData.amenities === "string"
            ? propertyData.amenities.split(",")
            : [],
        highlights:
          typeof propertyData.highlights === "string"
            ? propertyData.highlights.split(",")
            : [],
        isPetsAllowed: propertyData.isPetsAllowed === "true",
        isParkingIncluded: propertyData.isParkingIncluded === "true",
        pricePerMonth: parseFloat(propertyData.pricePerMonth),
        securityDeposit: parseFloat(propertyData.securityDeposit),
        applicationFee: parseFloat(propertyData.applicationFee),
        beds: parseInt(propertyData.beds),
        baths: parseFloat(propertyData.baths),
        squareFeet: parseInt(propertyData.squareFeet),
      },
      include: {
        location: true,
        manager: true,
      },
    });

    res.status(201).json(newProperty);
  } catch (err: any) {
    res
      .status(500)
      .json({ message: `Error creating property: ${err.message}` });
  }
};

export const getPropertyLeases = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const propertyId = Number(req.params.id);

    const leases = await prisma.lease.findMany({
      where: {
        propertyId,
      },
      include: {
        tenant: true,
        payments: true,
      },
    });

    res.json(leases);
  } catch (error: any) {
    res.status(500).json({
      message: `Error retrieving property leases: ${error.message}`,
    });
  }
};
