import { Trans } from "@lingui/react/macro";

import { EditableTable } from "../../EditableTable/EditableTable";

export const ReviewEditData: React.FC = () => {
  return (
    <div id="home-page" className="page">
      <section className="page__hero">
        <h1>
          <Trans>Rent History Analyzer</Trans>
        </h1>
        <p>
          <Trans>Review and edit your rent history</Trans>
        </p>
      </section>
      <div className="page__content">
        <EditableTable />{" "}
      </div>
    </div>
  );
};
