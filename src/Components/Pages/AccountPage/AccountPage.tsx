import { Button } from "@justfixnyc/component-library";
import { msg } from "@lingui/core/macro";
import { useLingui } from "@lingui/react";
import { Trans } from "@lingui/react/macro";
import { useNavigate } from "react-router-dom";
import { clearRhHistoryId } from "../../../auth/rhOtpSession";
import "./AccountPage.scss";

const initialReports = [
  {
    id: "1",
    address: "123 Main St., Apt 3L",
    status: msg`Started Feb 3, 2026`,
    cta: msg`Resume`,
    primary: false,
  },
  {
    id: "2",
    address: "123 Main St., Apt 4R",
    status: msg`Completed Feb 1, 2026`,
    cta: msg`View report`,
    primary: true,
  },
];

const AccountPage: React.FC = () => {
  const { i18n, _ } = useLingui();
  const navigate = useNavigate();

  const startExistingFlow = () => navigate(`/${i18n.locale}/scanner`);

  const onStartNew = () => {
    clearRhHistoryId();
    navigate(`/${i18n.locale}/history`);
  };

  const onLogout = () => {
    navigate(`/${i18n.locale}/login`);
  };

  return (
    <>
      <section className="preflow-section">
        <h1 className="preflow-title">
          <Trans>Your rent history report(s)</Trans>
        </h1>
        <div className="preflow-report-list">
          {initialReports.map((report) => (
            <article key={report.id} className="preflow-report-card">
              <h2>{report.address}</h2>
              <p>{_(report.status)}</p>
              <Button
                labelText={_(report.cta)}
                variant={report.primary ? "primary" : "secondary"}
                size="small"
                className="preflow-report-btn"
                onClick={startExistingFlow}
              />
            </article>
          ))}
        </div>
      </section>
      <section className="preflow-section preflow-section--tight">
        <Button
          labelText={_(msg`+ Start a new analysis`)}
          className="preflow-primary-btn preflow-primary-btn--full"
          onClick={onStartNew}
        />
        <button type="button" className="preflow-logout" onClick={onLogout}>
          <Trans>Log out</Trans>
        </button>
      </section>
    </>
  );
};

export default AccountPage;
