import * as SecureStore from "expo-secure-store";
import { router } from "expo-router";

const BASE_URL = "https://sakuin-be.vercel.app"; 

export async function apiRequest(endpoint: string, { 
   method = "GET", 
   query = {}, 
   body = null, 
   headers: customHeaders = {}, 
   isFormData = false 
}: any = {}) {
   
   const queryString = Object.keys(query).length ? "?" + new URLSearchParams(query).toString() : "";
   const url = `${BASE_URL}${endpoint}${queryString}`;

   const token = await SecureStore.getItemAsync("user_token");

   const headers: any = isFormData
      ? { ...customHeaders }
      : { "Content-Type": "application/json", ...customHeaders };

   if (token) {
      headers["Authorization"] = `Bearer ${token}`;
   }

   const options: RequestInit = { method, headers };
   if (body) options.body = isFormData ? body : JSON.stringify(body);

   try {
      const res = await fetch(url, options);
      
      let data;
      try {
         data = await res.json();
      } catch (jsonErr) {
         data = {};
      }

      if (!res.ok) {
         if (res.status === 401) {
            await SecureStore.deleteItemAsync("user_token");
            router.replace("/(auth)/welcome");
         }
         throw new Error(data.message || "Request failed");
      }

      return data;
   } catch (err) {
      console.error("API Request Error:", err);
      throw err;
   }
}