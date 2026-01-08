export const getRandomID = (): string =>
  (Math.random() * 10000000).toFixed(0).toString();
