type PresignedURL = { key: string; url: string };

const getPresignedUrls = async (
  method: "GET" | "PUT",
  keys: string[]
): Promise<PresignedURL[]> => {
  const url = new URL(import.meta.env.VITE_PRESIGNED_S3_API);
  url.searchParams.append("method", method);
  keys.forEach((key) => url.searchParams.append("key", key));

  const response = await fetch(url);
  const data = (await response.json()) as PresignedURL[];
  return data;
};

const presignedUpload = async (url: string, body: Blob): Promise<Response> => {
  const options = { method: "PUT", body };
  const response = await fetch(url, options);
  return response;
};

const presignedDownload = async (presignedUrl: string): Promise<Response> => {
  const options = { method: "GET" };
  const response = await fetch(presignedUrl, options);
  return response;
};

export const uploadScan = async (key: string, body: Blob) => {
  const presignedUrls = await getPresignedUrls("PUT", [key]);
  const response = await presignedUpload(presignedUrls[0].url, body);
  return response;
};

export const downloadScans = async (keys: string[]) => {
  const presignedUrls = await getPresignedUrls("GET", keys);
  const promises = presignedUrls.map(async ({ key, url }) => {
    const response = await presignedDownload(url);
    return { key, response };
  });
  const responses = await Promise.all(promises);
  return responses;
};
