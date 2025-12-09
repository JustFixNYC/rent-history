import ScanbotSDK from "scanbot-web-sdk/ui";

export async function runDocumentScanner() {
  // Make sure you have called await ScanbotSDK.initialize(...) before continuing here.

  const config = new ScanbotSDK.UI.Config.DocumentScanningFlow();
  // Adjust the config here to your needs.

  const result = await ScanbotSDK.UI.createDocumentScanner(config);
  // Process the result as needed.

  return result;
}
