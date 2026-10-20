import { NavLink, Outlet, useLocation, useParams } from "react-router-dom";

import { devFindingsReviewPath, devHubPath, devTimelinePath } from "./devPaths";
import "./DevPage.scss";

const DevPageLayout: React.FC = () => {
  const { locale } = useParams();
  const location = useLocation();
  const isFindingsReview = location.pathname.endsWith("/findings-review");

  return (
    <section
      id="dev-page"
      className={`preflow-section${
        isFindingsReview ? " dev-page--findings-review" : ""
      }`}
    >
      <h1 className="preflow-title">Development previews</h1>
      <nav className="dev-page__nav" aria-label="Development section">
        <NavLink
          to={devHubPath(locale)}
          end
          className={({ isActive }) =>
            isActive
              ? "dev-page__nav-link dev-page__nav-link--active"
              : "dev-page__nav-link"
          }
        >
          Overview
        </NavLink>
        <NavLink
          to={devTimelinePath(locale)}
          className={({ isActive }) =>
            isActive
              ? "dev-page__nav-link dev-page__nav-link--active"
              : "dev-page__nav-link"
          }
        >
          Timeline elements
        </NavLink>
        <NavLink
          to={devFindingsReviewPath(locale)}
          className={({ isActive }) =>
            isActive
              ? "dev-page__nav-link dev-page__nav-link--active"
              : "dev-page__nav-link"
          }
        >
          Finding validation
        </NavLink>
      </nav>
      <Outlet />
    </section>
  );
};

export default DevPageLayout;
