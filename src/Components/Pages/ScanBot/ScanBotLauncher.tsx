import ScanbotSDK from "scanbot-web-sdk/ui";
import { useEffect, useState } from "react";
import { Trans } from "@lingui/react/macro";
import { Button } from "@justfixnyc/component-library";

import { runDocumentScanner } from "./StartDocumentScanner";

const LICENSE_KEY =
  "haBga9kXT5ZGPXrUuDvZfdrJdz8Oft" +
  "ap5N3M61rcApGfJCMgmiTirJdMpRvf" +
  "P5ysX/xCF4knUEDF+MyXmeiL08iz3w" +
  "5clQqyDHsH9WnV/6CvbC6qGqNtfYSI" +
  "v6b34vy9qFmC1UV6sBut3V9Fd9w4U/" +
  "tOMrgrf3MxSqoNBzYKzG41F/+ZPH+k" +
  "e6AdORRFHbVy/DvISCn7YbKonHLE0l" +
  "2vl7mgln8KO0O6+s55YlhZpu6mW9T6" +
  "7PleCWQtGkbiRc1+TMVGKr8H0S31HM" +
  "78dVNKQxRN25GRMZC9WHK3+5yoXe0t" +
  "Gz2+VWoP8rbQvwNPoXMiCiNjQH53j6" +
  "6VTR2xCWL4EA==\nU2NhbmJvdFNESw" +
  "psb2NhbGhvc3R8anVzdGZpeC5vcmcK" +
  "MTc2NTkyOTU5OQo4Mzg4NjA3Cjg=\n";

export const ScanBotLauncher: React.FC = () => {
  const [sdkLoaded, setSdkLoaded] = useState(false);

  useEffect(() => {
    async function init() {
      await ScanbotSDK.initialize({
        licenseKey: LICENSE_KEY,
        // licenseKey: import.meta.env.VITE_SCANBOT_LICENSE_KEY || "",
        /**
         * We have designated a custom path for the wasm file in the public folder.
         * This also means wasm binaries are copied from ScanbotSDK's node_modules to the wasm folder.
         * The files are copied automatically via "postinstall" script in package.json
         */
        enginePath: "/wasm/",
      });
      setSdkLoaded(true);
    }
    init();
  }, []);

  useEffect(() => {
    if (!sdkLoaded) return;
    const scan = async () => await runDocumentScanner();
    scan();
  }, [sdkLoaded]);

  return (
    <div className="scanbot-demo">
      <h1>
        <Trans>Scan your rent history</Trans>
      </h1>
      <Button
        labelText="Launch scanner"
        labelIcon="memoPad"
        onClick={async () => await runDocumentScanner()}
        disabled={!sdkLoaded}
      />
    </div>
  );
};
