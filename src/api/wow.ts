export type RentStabilizedMapPoint = {
  bbl: string;
  address: string;
  borough: string;
  zip: string;
  lat: number;
  lng: number;
  units_res: number;
  rs_units: number;
};

type WowMapResponse = {
  result: RentStabilizedMapPoint[];
};

const getWowApiConfig = () => {
  const baseUrl = import.meta.env.VITE_WOW_API_BASE_URL as string | undefined;
  const token = import.meta.env.VITE_WOW_API_TOKEN as string | undefined;
  if (!baseUrl || !token) {
    throw new Error("WoW API is not configured");
  }
  return { baseUrl: baseUrl.replace(/\/$/, ""), token };
};

export async function fetchRentStabilizedMapPoints(): Promise<
  RentStabilizedMapPoint[]
> {
  const { baseUrl, token } = getWowApiConfig();
  const res = await fetch(`${baseUrl}/api/rent-stabilized/map`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) {
    const hint =
      res.status === 404
        ? " (endpoint not deployed — use local WoW: VITE_WOW_API_BASE_URL=http://127.0.0.1:8000)"
        : "";
    throw new Error(`Failed to load map data (${res.status})${hint}`);
  }
  const json = (await res.json()) as WowMapResponse;
  return json.result;
}
