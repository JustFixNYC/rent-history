import {
  Route,
  Outlet,
  Navigate,
  useLocation,
  createBrowserRouter,
  RouterProvider,
  createRoutesFromElements,
} from "react-router-dom";
import { useMemo } from "react";

import { QueryProvider } from "./providers/QueryProvider";
import { PrivacyPolicy } from "./Components/Pages/Legal/PrivacyPolicy";
import { TermsOfUse } from "./Components/Pages/Legal/TermsOfUse";
import Landing from "./Components/Pages/Landing/Landing";
import RentStabilizedMapPage from "./Components/Pages/RentStabilizedMap/RentStabilizedMapPage";
import LoginPage from "./Components/Pages/LoginPage/LoginPage";
import AccountPage from "./Components/Pages/AccountPage/AccountPage";
import { PageLayout } from "./Components/Pages/PageLayout/PageLayout";
import { RentQuestions } from "./Components/Pages/RentQuestions/RentQuestions";
import Scanner from "./Components/Pages/Scanner/Scanner";
import { parseLocaleFromPath } from "./i18n";
import { RhSessionProvider } from "./session/RhSessionContext";
import { getRhAuthSession } from "./session/rhSessionStorage";
import { ConfirmAddress } from "./Components/Pages/ConfirmAddress/ConfirmAddress";
import Report from "./Components/Pages/Report/Report";
import FindingsReviewPage from "./Components/Pages/FindingsReview/FindingsReviewPage";
import FindingsOverviewPage from "./Components/Pages/FindingsOverview/FindingsOverviewPage";
import AboutPage from "./Components/Pages/AboutPage/AboutPage";
import DevPage from "./Components/Pages/DevPage/DevPage";
import ResumePage from "./Components/Pages/ResumePage/ResumePage";
import CompilingWaitingPage from "./Components/Pages/CompilingWaitingPage/CompilingWaitingPage";
import ScanReviewPage from "./Components/Pages/ScanReviewPage/ScanReviewPage";

const RequireOtpToken = () => {
  const location = useLocation();
  const currentSession = getRhAuthSession();
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
          <Route path="about" element={<AboutPage />} />
          <Route path="dev" element={<DevPage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="resume" element={<ResumePage />} />
          <Route element={<RequireOtpToken />}>
            <Route path="account" element={<AccountPage />} />
            <Route path="scanner" element={<Scanner />} />
            <Route path="scan-review" element={<ScanReviewPage />} />
            <Route path="confirm-address" element={<ConfirmAddress />} />
            <Route path="rent-questions" element={<RentQuestions />} />
            <Route path="compiling" element={<CompilingWaitingPage />} />
            <Route
              path="findings-overview"
              element={<FindingsOverviewPage />}
            />
            <Route path="report" element={<Report />} />
            <Route path="findings-review" element={<FindingsReviewPage />} />
          </Route>
          <Route path="privacy_policy" element={<PrivacyPolicy />} />
          <Route path="terms_of_use" element={<TermsOfUse />} />
          <Route
            path="rent-stabilized-map"
            element={<RentStabilizedMapPage />}
          />
        </Route>
        {/* Catch-all route for paths without locale - will redirect */}
        <Route path="/" element={<PageLayout />}>
          <Route index element={<Landing />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="dev" element={<DevPage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="resume" element={<ResumePage />} />
          <Route element={<RequireOtpToken />}>
            <Route path="account" element={<AccountPage />} />
            <Route path="scanner" element={<Scanner />} />
            <Route path="scan-review" element={<ScanReviewPage />} />
            <Route path="confirm-address" element={<ConfirmAddress />} />
            <Route path="rent-questions" element={<RentQuestions />} />
            <Route path="compiling" element={<CompilingWaitingPage />} />
            <Route
              path="findings-overview"
              element={<FindingsOverviewPage />}
            />
            <Route path="findings-review" element={<FindingsReviewPage />} />
            <Route path="report" element={<Report />} />
          </Route>
          <Route path="privacy_policy" element={<PrivacyPolicy />} />
          <Route path="terms_of_use" element={<TermsOfUse />} />
          <Route
            path="rent-stabilized-map"
            element={<RentStabilizedMapPage />}
          />
          <Route path="*" element={<Landing />} />
        </Route>
      </>
    )
  );

function App() {
  const router = useMemo(() => createAppRouter(), []);

  return (
    <QueryProvider>
      <RhSessionProvider>
        <RouterProvider router={router} />
      </RhSessionProvider>
    </QueryProvider>
  );
}

export default App;
