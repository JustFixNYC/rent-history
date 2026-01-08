export const presignedUploadS3 = async (
  key: string,
  fileBlob: Blob
): Promise<boolean> => {
  const queryParams = { key: key };
  const queryString = new URLSearchParams(queryParams).toString();
  const fullUrl = `${import.meta.env.VITE_PRESIGNED_S3_API}?${queryString}`;

  const presignedResp = await fetch(fullUrl);
  const data = await presignedResp.json();
  const presignedURL = data["uploadURL"];

  const options = { method: "PUT", body: fileBlob };
  const uploadResp = await fetch(presignedURL, options);
  const uploadStatus = await uploadResp.status;

  return uploadStatus === 200;
};
