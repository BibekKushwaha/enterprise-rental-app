"use client";

import { CustomFormField } from "@/components/FormField";
import Header from "@/components/Header";
import { Form } from "@/components/ui/form";

import { propertySchema } from "@/lib/schemas";
import { z } from "zod";

// 🔥 IMPORTANT: Use z.input for RHF form type because Zod uses coercion
type PropertyFormData = z.input<typeof propertySchema>;

import {
  useCreatePropertyMutation,
  useGetAuthUserQuery,
} from "@/state/api";

import {
  AmenityEnum,
  HighlightEnum,
  PropertyTypeEnum,
} from "@/lib/constants";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, SubmitHandler } from "react-hook-form";
import { Button } from "@/components/ui/button";

const NewProperty = () => {
  const [createProperty] = useCreatePropertyMutation();
  const { data: authUser } = useGetAuthUserQuery();

  // ----------------------------
  // ✔ USE z.input type
  // ✔ Perfectly matches Zod resolver
  // ----------------------------
  const form = useForm<PropertyFormData>({
    resolver: zodResolver(propertySchema),
    defaultValues: {
      name: "",
      description: "",
      pricePerMonth: "1000",        // 🔥 Must be string because z.input gets string before coercion
      securityDeposit: "500",
      applicationFee: "100",
      isPetsAllowed: true,
      isParkingIncluded: true,
      photoUrls: [],
      amenities: "",
      highlights: "",
      beds: "1",
      baths: "1",
      squareFeet: "1000",
      propertyType: PropertyTypeEnum.Apartment,
      address: "",
      city: "",
      state: "",
      country: "",
      postalCode: "",
    },
  });

  // ----------------------------
  // ✔ SubmitHandler matches z.input<typeof propertySchema>
  // ----------------------------
  const onSubmit: SubmitHandler<PropertyFormData> = async (data) => {
    if (!authUser?.cognitoInfo?.userId) {
      throw new Error("No manager ID found");
    }

    const formData = new FormData();

    // Convert form fields for API
    Object.entries(data).forEach(([key, value]) => {
      if (key === "photoUrls") {
        const files = value as File[];
        files.forEach((file) => formData.append("photos", file));
      } else if(Array.isArray(value)){
        formData.append(key,JSON.stringify(value));
      }
      else {
        formData.append(key, String(value));
      }
    });

    formData.append("managerCognitoId", authUser.cognitoInfo.userId);

    await createProperty(formData);
  };

  return (
    <div className="dashboard-container">
      <Header
        title="Add New Property"
        subtitle="Create a new property listing with detailed information"
      />

      <div className="bg-white rounded-xl p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="p-4 space-y-10">

            {/* BASIC INFORMATION */}
            <div>
              <h2 className="text-lg font-semibold mb-4">Basic Information</h2>

              <CustomFormField name="name" label="Property Name" />
              <CustomFormField
                name="description"
                label="Description"
                type="textarea"
              />
            </div>

            <hr className="my-6 border-gray-200"/>

            {/* FEES */}
            <div>
              <h2 className="text-lg font-semibold mb-4">Fees</h2>

              <CustomFormField
                name="pricePerMonth"
                label="Price per Month"
                type="number"
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <CustomFormField
                  name="securityDeposit"
                  label="Security Deposit"
                  type="number"
                />
                <CustomFormField
                  name="applicationFee"
                  label="Application Fee"
                  type="number"
                />
              </div>
            </div>

            <hr className="my-6 border-gray-200" />

            {/* PROPERTY DETAILS */}
            <div className="space-y-6">
              <h2 className="text-lg font-semibold">Property Details</h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <CustomFormField name="beds" label="Beds" type="number" />
                <CustomFormField name="baths" label="Baths" type="number" />
                <CustomFormField name="squareFeet" label="Square Feet" type="number" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <CustomFormField
                  name="isPetsAllowed"
                  label="Pets Allowed"
                  type="switch"
                />
                <CustomFormField
                  name="isParkingIncluded"
                  label="Parking Included"
                  type="switch"
                />
              </div>
            </div>

            {/* PROPERTY TYPE */}
            <div className="mt-4">
              <CustomFormField
                name="propertyType"
                label="Property Type"
                type="select"
                options={Object.values(PropertyTypeEnum).map((type) => ({
                  value: type,
                  label: type,
                }))}
              />
            </div>

            <hr className="my-6 border-gray-200" />

            {/* AMENITIES + HIGHLIGHTS */}
            <h2 className="text-lg font-semibold mb-4">Amenities & Highlights</h2>

            <CustomFormField
              name="amenities"
              label="Amenities"
              type="select"
              options={Object.values(AmenityEnum).map((v) => ({
                value: v,
                label: v,
              }))}
            />

            <CustomFormField
              name="highlights"
              label="Highlights"
              type="select"
              options={Object.values(HighlightEnum).map((v) => ({
                value: v,
                label: v,
              }))}
            />

            <hr className="my-6" />

            {/* PHOTOS */}
            <h2 className="text-lg font-semibold mb-4">Photos</h2>
            <CustomFormField
              name="photoUrls"
              label="Property Photos"
              type="file"
              accept="image/*"
            />

            <hr className="my-6 border-gray-200" />

            {/* ADDRESS */}
            <div className="space-y-6">
              <h2 className="text-lg font-semibold mb-4">Address</h2>

              <CustomFormField name="address" label="Address" />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <CustomFormField name="city" label="City" />
                <CustomFormField name="state" label="State" />
                <CustomFormField name="postalCode" label="Postal Code" />
              </div>

              <CustomFormField name="country" label="Country" />
            </div>
            <Button type="submit" className="w-full bg-primary-700 text-white mt-8">
              Create Property
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default NewProperty;
