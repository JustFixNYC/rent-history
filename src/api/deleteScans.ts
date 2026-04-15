export const deleteScans = async (historyCode: string): Promise<Response> => {
  const url = new URL(import.meta.env.VITE_GATEWAY_API + "/rhDeleteScans");
  url.searchParams.append("history_code", historyCode);
  const response = await fetch(url);
  return response;
};
