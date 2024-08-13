export const log = (text: string) => {
  const timestamp = new Date().toISOString();
  console.log(`${timestamp}: ${text}`);
};
