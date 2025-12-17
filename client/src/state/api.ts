import { cleanParams, createNewUserInDatabase, withToast } from "@/lib/create-new-user";
import { Lease, Manager, Payment, Property, Tenant } from "@/types/prismaType";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { fetchAuthSession, getCurrentUser, fetchUserAttributes } from "aws-amplify/auth";
import { FiltersState } from ".";

// Define the User type with proper userRole
interface User {
  cognitoInfo: {
    signInDetails?: any; // Replace with proper type if available
    username: string;
    userId: string;
  };
  userInfo: Tenant | Manager;
  userRole: "manager" | "tenant";
}

export const api = createApi({
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL,
    prepareHeaders: async (headers) => {
      try {

        const session = await fetchAuthSession();

        
        const { idToken } = session.tokens ?? {};
        
        if (idToken) {
          headers.set("Authorization", `Bearer ${idToken}`);
        }
        // console.log("📤 Sending headers", Array.from(headers.entries()));
        
        return headers;
      } catch (error) {
        console.error("Error in prepareHeaders:", error);
        return headers;
      }
    }
  }),
  reducerPath: "api",
  tagTypes: ["Tenants","Managers","Properties","PropertyDetails","Leases","Payments"],
  endpoints: (build) => ({
    getAuthUser: build.query<User, void>({
      queryFn: async (_, _queryApi, _extraOptions, fetchWithBQ) => {
        try {
          const session = await fetchAuthSession();
          
          const { idToken } = session.tokens ?? {};
          
          const user = await getCurrentUser();

          const attributes = await fetchUserAttributes();

          // Get user role and validate it
          const userRoleFromAttributes = attributes["custom:role"];
          const userRoleFromToken = idToken?.payload["custom:role"] as string;
          
          // Use the role from attributes as fallback if token doesn't have it
          const rawUserRole = userRoleFromToken || userRoleFromAttributes;
          
          // Validate and cast the user role
          if (rawUserRole !== "manager" && rawUserRole !== "tenant") {
            throw new Error(`Invalid user role: ${rawUserRole}`);
          }
          
          const userRole = rawUserRole as "manager" | "tenant";
          const userId = idToken?.payload.sub || user.userId;

          const endpoint = userRole === "manager" ? `/managers/${userId}` : `/tenants/${userId}`;
          
          let userDetailsResponse = await fetchWithBQ(endpoint);
          // console.log(userDetailsResponse);

          if (userDetailsResponse.error && userDetailsResponse.error.status === 404) {
            userDetailsResponse = await createNewUserInDatabase(
              user,
              idToken,
              userRole,
              fetchWithBQ,
            );
          }

          // Handle case where userDetailsResponse might still have error
          if (userDetailsResponse.error) {
            throw new Error(userDetailsResponse.error.data as string || "Failed to fetch user details");
          }

          return {
            data: {
              cognitoInfo: {
                username: user.username,
                userId: user.userId,
                signInDetails: user.signInDetails // Add this if available
              },
              userInfo: userDetailsResponse.data as Tenant | Manager,
              userRole
            }
          };
          
        } catch (error: any) {
          return {
            error: {
              status: 'CUSTOM_ERROR',
              error: error.message || "Could not fetch user data"
            }
          };
        }
      },
    }),
    updateTenantSetting: build.mutation<Tenant, {cognitoId: string} & Partial<Tenant>>({
      query: ({cognitoId, ...updatedTenant})=>({
        url: `tenants/${cognitoId}`,
        method: "PUT",
        body: updatedTenant,
      }),
      invalidatesTags: (result) =>[{type:"Tenants", id: result?.id}],
    }),
    updateManagerSetting: build.mutation<Manager, {cognitoId: string} & Partial<Manager>>({
    query: ({cognitoId, ...updatedManager})=>({
      url: `managers/${cognitoId}`,
      method: "PUT",
      body: updatedManager,
    }),
    invalidatesTags: (result) =>[{type:"Managers", id: result?.id}],
    }),
    // property related query
     getProperties: build.query<
      Property[],
      Partial<FiltersState> & { favoriteIds?: number[] }
    >({
      query: (filters) => {
        const params = cleanParams({
          location: filters.location,
          priceMin: filters.priceRange?.[0],
          priceMax: filters.priceRange?.[1],
          beds: filters.beds,
          baths: filters.baths,
          propertyType: filters.propertyType,
          squareFeetMin: filters.squareFeet?.[0],
          squareFeetMax: filters.squareFeet?.[1],
          amenities: Array.isArray(filters.amenities)
            ? filters.amenities.join(",")
            : filters.amenities || "",
          availableFrom: filters.availableFrom,
          favoriteIds: Array.isArray(filters.favoriteIds)
            ? filters.favoriteIds.join(",")
            : filters.favoriteIds || "",
          latitude: filters.coordinates?.[1],
          longitude: filters.coordinates?.[0],
        });

        return { url: "properties", params };
      },
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Properties" as const, id })),
              { type: "Properties", id: "LIST" },
            ]
          : [{ type: "Properties", id: "LIST" }],
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          error: "Failed to fetch properties.",
        });
      },
    }),

    getProperty: build.query<Property, number>({
      query: (id) => `properties/${id}`,
      providesTags: (result, error, id) => [{ type: "PropertyDetails", id }],
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          error: "Failed to load property details.",
        });
      },
    }),
    // tenant related endpoint

    getTenant: build.query<Tenant, string>({
      query: (cognitoId) => `tenants/${cognitoId}`,
      providesTags: (result) => [{ type: "Tenants", id: result?.id }],
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          error: "Failed to load tenant profile.",
        });
      },
    }),

    getCurrentResidences: build.query<Property[], string>({
      query: (cognitoId) => `tenants/${cognitoId}/current-residences`,
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Properties" as const, id })),
              { type: "Properties", id: "LIST" },
            ]
          : [{ type: "Properties", id: "LIST" }],
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          error: "Failed to fetch current residences.",
        });
      },
    }),

    addFavoriteProperty: build.mutation<
      Tenant,
      { cognitoId: string; propertyId: number }
    >({
      query: ({ cognitoId, propertyId }) => ({
        url: `tenants/${cognitoId}/favorites/${propertyId}`,
        method: "POST",
      }),
      invalidatesTags: (result) => [
        { type: "Tenants", id: result?.id },
        { type: "Properties", id: "LIST" },
      ],
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          success: "Added to favorites!!",
          error: "Failed to add to favorites",
        });
      },
    }),

    removeFavoriteProperty: build.mutation<
      Tenant,
      { cognitoId: string; propertyId: number }
    >({
      query: ({ cognitoId, propertyId }) => ({
        url: `tenants/${cognitoId}/favorites/${propertyId}`,
        method: "DELETE",
      }),
      invalidatesTags: (result) => [
        { type: "Tenants", id: result?.id },
        { type: "Properties", id: "LIST" },
      ],
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          success: "Removed from favorites!",
          error: "Failed to remove from favorites.",
        });
      },
    }),

    // lease related enpoints
    getLeases: build.query<Lease[], number>({
      query: () => "leases",
      providesTags: ["Leases"],
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          error: "Failed to fetch leases.",
        });
      },
    }),
    getPropertyLeases: build.query<Lease[], number>({
      query: (propertyId) => `properties/${propertyId}/leases`,
      providesTags: ["Leases"],
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          error: "Failed to fetch property leases.",
        });
      },
    }),
    getPayments: build.query<Payment[], number>({
      query: (leaseId) => `leases/${leaseId}/payments`,
      providesTags: ["Payments"],
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          error: "Failed to fetch payment info.",
        });
      },
    }),

    // manager related endpoint
    getManagerProperties: build.query<Property[], string>({
      query: (cognitoId) => `managers/${cognitoId}/properties`,
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Properties" as const, id })),
              { type: "Properties", id: "LIST" },
            ]
          : [{ type: "Properties", id: "LIST" }],
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          error: "Failed to load manager profile.",
        });
      },
    }),
    updateManagerSettings: build.mutation<
      Manager,
      { cognitoId: string } & Partial<Manager>
    >({
      query: ({ cognitoId, ...updatedManager }) => ({
        url: `managers/${cognitoId}`,
        method: "PUT",
        body: updatedManager,
      }),
      invalidatesTags: (result) => [{ type: "Managers", id: result?.id }],
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          success: "Settings updated successfully!",
          error: "Failed to update settings.",
        });
      },
    }),

    createProperty: build.mutation<Property, FormData>({
      query: (newProperty) => ({
        url: `properties`,
        method: "POST",
        body: newProperty,
      }),
      invalidatesTags: (result) => [
        { type: "Properties", id: "LIST" },
        { type: "Managers", id: result?.manager?.id },
      ],
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          success: "Property created successfully!",
          error: "Failed to create property.",
        });
      },
    }),

  }),
});

export const { 
  useGetAuthUserQuery,
  useUpdateTenantSettingMutation, 
  useUpdateManagerSettingMutation,
  useGetPropertiesQuery,
  useGetCurrentResidencesQuery,
  useAddFavoritePropertyMutation,
  useRemoveFavoritePropertyMutation,
  useGetTenantQuery,
  useGetPropertyQuery,
  useGetLeasesQuery,
  useGetPaymentsQuery,
  useGetManagerPropertiesQuery,
  useGetPropertyLeasesQuery,
  useCreatePropertyMutation,
  useUpdateManagerSettingsMutation,
} = api;