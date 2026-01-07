import { DocumentScanner } from "dynamsoft-document-scanner";
import { useEffect } from "react";
import { Trans } from "@lingui/react/macro";

export const DynamsoftLauncher: React.FC = () => {
  useEffect(() => {
    const initScanner = async () => {
      const scanner = new DocumentScanner({
        license: import.meta.env.VITE_DYNAMSOFT_LICENSE_KEY || "",
        enableContinuousScanning: true,
        onDocumentScanned: async (result) => {
          // Process each scanned document
          // await uploadToServer(result.correctedImageResult);
          console.log(result.correctedImageResult);
        },
      });
      await scanner.launch();
    };

    initScanner().catch((error) => {
      console.error("Error initializing document scanner:", error);
    });
  }, []);

  return (
    <div className="dynamsoft-demo">
      <h2>
        <Trans>Scan your rent history</Trans>
      </h2>
    </div>
  );
};
