import {
  Route,
  Outlet,
  Navigate,
  useLocation,
  createBrowserRouter,
  RouterProvider,
  createRoutesFromElements,
  ScrollRestoration,
} from "react-router-dom";
import { SWRConfig } from "swr";
import { useRollbar } from "@rollbar/react";
import { useMemo } from "react";

import { I18n } from "./i18n";
import { NetworkError } from "./api/error-reporting";
import { PrivacyPolicy } from "./Components/Pages/Legal/PrivacyPolicy";
import { TermsOfUse } from "./Components/Pages/Legal/TermsOfUse";
import Home from "./Components/Pages/Home/Home";
import Landing from "./Components/Pages/Landing/Landing";
import PreFlow from "./Components/Pages/PreFlow/PreFlow";
import PostScanFlow from "./Components/Pages/PostScanFlow/PostScanFlow";
import Scanner from "./Components/Pages/Scanner/Scanner";
import { ReviewEditData } from "./Components/Pages/ReviewEditData/ReviewEditData";
import { getRhOtpSession } from "./auth/rhOtpSession";
import { parseLocaleFromPath } from "./i18n";

const Layout = () => {
  return (
    <I18n>
      <div id="container">
        <main id="main">
          <div id="content">
            <Outlet />
          </div>
        </main>

        <ScrollRestoration />
      </div>
    </I18n>
  );
};

const RequireOtpToken = () => {
  const location = useLocation();
  const currentSession = getRhOtpSession();
  if (currentSession) {
    return <Outlet />;
  }

  const locale = parseLocaleFromPath(location.pathname);
  const preFlowPath = locale ? `/${locale}/pre-flow` : "/pre-flow";
  return <Navigate to={preFlowPath} replace />;
};

const createAppRouter = () =>
  createBrowserRouter(
    createRoutesFromElements(
      <>
        {/* Routes with locale prefix */}
        <Route path="/:locale" element={<Layout />}>
          <Route index element={<Landing />} />
          <Route path="pre-flow" element={<PreFlow />} />
          <Route element={<RequireOtpToken />}>
            <Route path="analyze" element={<Home />} />
            <Route path="scanner" element={<Scanner />} />
            <Route path="review" element={<ReviewEditData />} />
            <Route path="post-scan" element={<PostScanFlow />} />
          </Route>
          <Route path="privacy_policy" element={<PrivacyPolicy />} />
          <Route path="terms_of_use" element={<TermsOfUse />} />
        </Route>
        {/* Catch-all route for paths without locale - will redirect */}
        <Route path="/" element={<Layout />}>
          <Route index element={<Landing />} />
          <Route path="pre-flow" element={<PreFlow />} />
          <Route element={<RequireOtpToken />}>
            <Route path="analyze" element={<Home />} />
          </Route>
          <Route path="*" element={<Landing />} />
        </Route>
      </>,
    ),
  );

function App() {
  const rollbar = useRollbar();
  const router = useMemo(() => createAppRouter(), []);

  return (
    <SWRConfig
      value={{
        onError: (error) => {
          if (error instanceof NetworkError && !error.shouldReport) return;
          rollbar.error(error);
        },
      }}
    >
      <RouterProvider router={router} />
    </SWRConfig>
  );
}

export default App;
