import {
  Route,
  Outlet,
  Navigate,
  useLocation,
  createBrowserRouter,
  RouterProvider,
  createRoutesFromElements,
} from "react-router-dom";
import { SWRConfig } from "swr";
import { useRollbar } from "@rollbar/react";
import { useMemo } from "react";

import { NetworkError } from "./api/error-reporting";
import { PrivacyPolicy } from "./Components/Pages/Legal/PrivacyPolicy";
import { TermsOfUse } from "./Components/Pages/Legal/TermsOfUse";
import Landing from "./Components/Pages/Landing/Landing";
import LoginPage from "./Components/Pages/LoginPage/LoginPage";
import AccountPage from "./Components/Pages/AccountPage/AccountPage";
import HistoryPage from "./Components/Pages/HistoryPage/HistoryPage";
import { PageLayout } from "./Components/Pages/PageLayout/PageLayout";
import PostScanFlow from "./Components/Pages/PostScanFlow/PostScanFlow";
import Scanner from "./Components/Pages/Scanner/Scanner";
import { ReviewEditData } from "./Components/Pages/ReviewEditData/ReviewEditData";
import { getRhOtpSession } from "./auth/rhOtpSession";
import { parseLocaleFromPath } from "./i18n";

const RequireOtpToken = () => {
  const location = useLocation();
  const currentSession = getRhOtpSession();
  if (currentSession) {
    return <Outlet />;
  }

  const locale = parseLocaleFromPath(location.pathname);
  const loginPath = locale ? `/${locale}/login` : "/login";
  return <Navigate to={loginPath} replace />;
};

const createAppRouter = () =>
  createBrowserRouter(
    createRoutesFromElements(
      <>
        {/* Routes with locale prefix */}
        <Route path="/:locale" element={<PageLayout />}>
          <Route index element={<Landing />} />
          <Route path="login" element={<LoginPage />} />
          <Route element={<RequireOtpToken />}>
            <Route path="account" element={<AccountPage />} />
            <Route path="history" element={<HistoryPage />} />
            <Route path="scanner" element={<Scanner />} />
            <Route path="review" element={<ReviewEditData />} />
            <Route path="post-scan" element={<PostScanFlow />} />
          </Route>
          <Route path="privacy_policy" element={<PrivacyPolicy />} />
          <Route path="terms_of_use" element={<TermsOfUse />} />
        </Route>
        {/* Catch-all route for paths without locale - will redirect */}
        <Route path="/" element={<PageLayout />}>
          <Route index element={<Landing />} />
          <Route path="login" element={<LoginPage />} />
          <Route element={<RequireOtpToken />}>
            <Route path="account" element={<AccountPage />} />
            <Route path="history" element={<HistoryPage />} />
            <Route path="scanner" element={<Scanner />} />
            <Route path="review" element={<ReviewEditData />} />
            <Route path="post-scan" element={<PostScanFlow />} />
          </Route>
          <Route path="*" element={<Landing />} />
        </Route>
      </>
    )
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
