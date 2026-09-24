export const revokePageImageUrls = (urls: Record<string, string>): void => {
  Object.values(urls).forEach((url) => {
    URL.revokeObjectURL(url);
  });
};

export const clearPageImageUrls = (
  urls: Record<string, string>,
  setUrls: (urls: Record<string, string>) => void
): void => {
  revokePageImageUrls(urls);
  setUrls({});
};
