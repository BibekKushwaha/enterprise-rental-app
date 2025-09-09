import { createNewUserInDatabase } from "@/lib/create-new-user";
import { Manager, Tenant } from "@/types/prismaType";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { fetchAuthSession, getCurrentUser, fetchUserAttributes } from "aws-amplify/auth";
import { string } from "zod";

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
  tagTypes: ["Tenants","Managers"],
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
          console.log(userDetailsResponse);

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
    })
  }),
});

export const { useGetAuthUserQuery, useUpdateTenantSettingMutation, useUpdateManagerSettingMutation} = api;