import { DocumentScanner } from "dynamsoft-document-scanner";
import { useEffect } from "react";
import { Trans } from "@lingui/react/macro";
import { useSearchParams } from "react-router-dom";

import { uploadScan } from "../../../api/presignedS3";

export const DynamsoftLauncher: React.FC = () => {
  const [searchParams] = useSearchParams();
  const userId = searchParams.get("id");

  useEffect(() => {
    let pageNumber = 1;
    const initScanner = async () => {
      const scanner = new DocumentScanner({
        license: import.meta.env.VITE_DYNAMSOFT_LICENSE_KEY || "",
        enableContinuousScanning: true,
        scannerViewConfig: {
          enableAutoCropMode: true,
          enableSmartCaptureMode: true,
          showSubfooter: false,
        },
        onDocumentScanned: async (result) => {
          // Process each scanned document
          const jpgBlob = await result.correctedImageResult?.toBlob(
            "image/jpeg"
          );
          if (!jpgBlob) {
            console.error("no image from scan");
            return;
          }
          const key = `${userId}/page${pageNumber}.jpg`;
          await uploadScan(key, jpgBlob);
          pageNumber++;
        },
      });
      await scanner.launch();
    };

    initScanner().catch((error) => {
      console.error("Error initializing document scanner:", error);
    });
  }, [userId]);

  return (
    <div className="dynamsoft-demo">
      <h2>
        <Trans>Scan your rent history</Trans>
      </h2>
    </div>
  );
};
