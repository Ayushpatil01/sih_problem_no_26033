// src/services/mandiApi.ts

// 🟢 स्क्रीनवर मिळालेली API Key व Resource ID
const API_KEY = '579b464db66ec23bdd000001cdd3946e44ce4aad7209ff7b23ac571b'; // तुमची Key टाका
const RESOURCE_ID = '9ef84268-d588-465a-a308-a864a43d0070';
const BASE_URL = `https://api.data.gov.in/resource/${RESOURCE_ID}`;

export interface MandiRate {
  state: string;
  district: string;
  market: string;
  commodity: string;
  variety: string;
  min_price: string;
  max_price: string;
  modal_price: string;
  arrival_date: string;
}

export async function fetchLiveMandiRates(commodityName: string = 'Onion'): Promise<MandiRate[]> {
  try {
    const url = `${BASE_URL}?api-key=${API_KEY}&format=json&limit=10&filters[state]=Maharashtra&filters[commodity]=${encodeURIComponent(commodityName)}`;
    const response = await fetch(url);
    const data = await response.json();
    return data.records || [];
  } catch (error) {
    console.error('Mandi API Fetch Error:', error);
    return [];
  }
}