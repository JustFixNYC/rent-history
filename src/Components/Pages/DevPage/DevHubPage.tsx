import { Link, useParams } from "react-router-dom";

import { devFindingsReviewPath, devTimelinePath } from "./devPaths";

const DevHubPage: React.FC = () => {
  const { locale } = useParams();

  return (
    <>
      <p className="dev-page__intro">
        Local UI previews for development. These routes are omitted from
        production builds.
      </p>
      <nav className="dev-page__hub" aria-label="Development previews">
        <ul>
          <li>
            <Link to={devTimelinePath(locale)}>Timeline elements</Link>
            <span className="dev-page__hub-detail">
              Pills, mock timeline rows, and catalog by finding type
            </span>
          </li>
          <li>
            <Link to={devFindingsReviewPath(locale)}>Finding validation</Link>
            <span className="dev-page__hub-detail">
              Mock validation flows with fixture findings (no login)
            </span>
          </li>
        </ul>
      </nav>
    </>
  );
};

export default DevHubPage;
