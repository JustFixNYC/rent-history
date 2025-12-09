import { Trans } from "@lingui/react/macro";

export const Home: React.FC = () => {
  return (
    <div className="home-page">
      <h1>
        <Trans>Rent History Analyzer</Trans>
      </h1>
      <h2>
        <Trans>ScanBot Demo</Trans>
      </h2>
    </div>
  );
};
