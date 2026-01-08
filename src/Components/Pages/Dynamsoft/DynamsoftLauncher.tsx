import { DocumentScanner } from "dynamsoft-document-scanner";
import { useEffect } from "react";
import { Trans } from "@lingui/react/macro";
import { presignedUploadS3 } from "../../../api/s3upload";
import { useSearchParams } from "react-router-dom";

export const DynamsoftLauncher: React.FC = () => {
  const [searchParams] = useSearchParams();
  const userId = searchParams.get("id");

  useEffect(() => {
    const initScanner = async () => {
      const scanner = new DocumentScanner({
        license: import.meta.env.VITE_DYNAMSOFT_LICENSE_KEY || "",
        enableContinuousScanning: true,
        onDocumentScanned: async (result) => {
          // Process each scanned document
          const jpgBlob = await result.correctedImageResult?.toBlob(
            "image/jpeg"
          );
          if (!jpgBlob) {
            console.error("no image from scan");
            return;
          }
          // TODO: get order of pages
          const randomID = parseInt((Math.random() * 10000000).toString());

          const key = `${userId}/${randomID}.jpg`;
          presignedUploadS3(key, jpgBlob);
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
