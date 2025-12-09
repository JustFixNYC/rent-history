import ScanbotSDK from "scanbot-web-sdk/ui";
import { useEffect, useState } from "react";
import { Trans } from "@lingui/react/macro";

import { runDocumentScanner } from "./StartDocumentScanner";

export const ScanBotLauncher: React.FC = () => {
  const [sdkLoaded, setSdkLoaded] = useState(false);

  useEffect(() => {
    async function init() {
      await ScanbotSDK.initialize({
        licenseKey: import.meta.env.VITE_SCANBOT_LICENSE_KEY || "",
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
    runDocumentScanner();
  }, [sdkLoaded]);

  return (
    <div className="scanbot-demo">
      <h2>
        <Trans>Scan your rent history</Trans>
      </h2>
    </div>
  );
};
