export const presignedUploadS3 = async (key: string, fileBlob: Blob) => {
  const queryParams = { key: key };
  const queryString = new URLSearchParams(queryParams).toString();
  const fullUrl = `${import.meta.env.VITE_PRESIGNED_S3_API}?${queryString}`;

  const presignedResp = await fetch(fullUrl);
  const data = await presignedResp.json();
  const presignedURL = data["uploadURL"];

  const options = { method: "PUT", body: fileBlob };
  const uploadResp = await fetch(presignedURL, options);
  const uploadData = await uploadResp.json();

  return uploadData;
};
