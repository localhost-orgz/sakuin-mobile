import * as SecureStore from "expo-secure-store";
import { router } from "expo-router";

const BASE_URL = "https://sakuin-be.vercel.app";

const DEFAULT_GOALS = [
  { id: "1", name: "Macbook Pro", icon: "💻", current: 8500000, target: 25000000, themeId: "indigo", deadline: "30 Dec 2026", description: "Save up for the powerful Macbook Pro M3" },
  { id: "2", name: "Bali Trip", icon: "🏖️", current: 3200000, target: 5000000, themeId: "ember", deadline: "15 Oct 2026", description: "Holiday trip with friends to Bali" },
  { id: "3", name: "Emergency Fund", icon: "🛡️", current: 12000000, target: 12000000, themeId: "forest", deadline: "01 Jan 2027", description: "Secure emergency cash reserve" },
  { id: "4", name: "New Camera", icon: "📷", current: 1800000, target: 7500000, themeId: "violet", deadline: "20 Nov 2026", description: "Sony mirrorless camera for vlogging" },
  { id: "5", name: "Wedding Fund", icon: "💍", current: 22000000, target: 50000000, themeId: "rose", deadline: "05 Jun 2027", description: "Preparations for the big day" },
  { id: "6", name: "Uniqlo Shopping", icon: "👕", current: 150000, target: 600000, themeId: "ocean", deadline: "30 Jun 2026", description: "Buy some clean basic clothes" }
];

const uuid = () => Math.random().toString(36).substring(2, 11);

async function getLocalGoals() {
  const val = await SecureStore.getItemAsync("sakuin_goals");
  if (!val) {
    await SecureStore.setItemAsync("sakuin_goals", JSON.stringify(DEFAULT_GOALS));
    return DEFAULT_GOALS;
  }
  try {
    return JSON.parse(val);
  } catch (e) {
    return DEFAULT_GOALS;
  }
}

async function setLocalGoals(goals: any) {
  await SecureStore.setItemAsync("sakuin_goals", JSON.stringify(goals));
}

async function handleOfflineFallback(endpoint: string, method: string, body: any) {
  const goals = await getLocalGoals();
  const idParam = endpoint.replace("/goals", "").replace("/", "");

  if (method === "GET") {
    if (idParam) {
      const goal = goals.find((g: any) => g.id === idParam || g._id === idParam);
      return { status: "success", data: goal };
    }
    return { status: "success", data: goals };
  }

  if (method === "POST" && body) {
    const newGoal = {
      id: uuid(),
      name: body.name,
      icon: body.icon || "🎯",
      current: Number(body.current) || 0,
      target: Number(body.target) || 100000,
      themeId: body.themeId || "ocean",
      deadline: body.deadline || "30 Dec 2026",
      description: body.description || ""
    };
    goals.push(newGoal);
    await setLocalGoals(goals);
    return { status: "success", data: newGoal };
  }

  if (method === "DELETE" && idParam) {
    const updated = goals.filter((g: any) => g.id !== idParam && g._id !== idParam);
    await setLocalGoals(updated);
    return { status: "success", message: "Goal deleted successfully" };
  }

  if (method === "PUT" && idParam && body) {
    const updated = goals.map((g: any) => {
      if (g.id === idParam || g._id === idParam) {
        return { ...g, ...body };
      }
      return g;
    });
    await setLocalGoals(updated);
    const updatedGoal = updated.find((g: any) => g.id === idParam || g._id === idParam);
    return { status: "success", data: updatedGoal };
  }

  return { status: "success", data: [] };
}

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
   const isGoals = endpoint.startsWith("/goals");

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

      if (isGoals && res.status === 404) {
         console.warn(`Goals API returned 404. Falling back to offline SecureStore.`);
         return await handleOfflineFallback(endpoint, method, body);
      }
      
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
      if (isGoals) {
         console.warn(`Goals API failed with error. Falling back to offline SecureStore.`, err);
         return await handleOfflineFallback(endpoint, method, body);
      }
      console.error("API Request Error:", err);
      throw err;
   }
}