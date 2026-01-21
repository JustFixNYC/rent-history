import { Trans } from "@lingui/react/macro";

import { DynamsoftDemo } from "../../DynamsoftDemo/DynamsoftDemo";

export const Home: React.FC = () => {
  return (
    <div className="home-page">
      <h1>
        <Trans>Rent History Analyzer</Trans>
      </h1>
      <h2>
        <Trans>Upload your rent history</Trans>
      </h2>
      <DynamsoftDemo />
    </div>
  );
};
