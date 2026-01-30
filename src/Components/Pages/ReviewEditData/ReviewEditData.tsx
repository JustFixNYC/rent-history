import { Trans } from "@lingui/react/macro";

import { EditableTable } from "../../EditableTable/EditableTable";

export const ReviewEditData: React.FC = () => {
  return (
    <div className="home-page">
      <h1>
        <Trans>Rent History Analyzer</Trans>
      </h1>
      <h2>
        <Trans>Review and edit your rent history</Trans>
      </h2>
      <EditableTable />
    </div>
  );
};
