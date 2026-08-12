import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useLingui } from "@lingui/react";
import { Trans } from "@lingui/react/macro";
import { msg } from "@lingui/core/macro";

import {
  isAccountApiError,
  magicLinkVerificationMessage,
  useVerifyRhMagicLink,
} from "../../../api/account";
import {
  clearRhSessionDocument,
  setRhAuthSession,
  switchRhHistory,
} from "../../../session/rhSessionStorage";
import { historyResumePath } from "../../../utils/historyResumePath";
import "./ResumePage.scss";

type ResumePageState = "loading" | "error";

const ResumePage: React.FC = () => {
  const { i18n, _ } = useLingui();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const verifyMagicLink = useVerifyRhMagicLink();
  const verifyToken = verifyMagicLink.mutateAsync;
  const hasStartedVerify = useRef(false);

  const token = searchParams.get("token");
  const historyId = searchParams.get("history_id");
  const locale = i18n.locale;
  const loginPath = `/${locale}/login`;

  const [pageState, setPageState] = useState<ResumePageState>(() =>
    token && historyId ? "loading" : "error"
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(() =>
    token && historyId
      ? null
      : _(msg`This resume link is missing required information.`)
  );

  useEffect(() => {
    if (!token || !historyId || hasStartedVerify.current) {
      return;
    }
    hasStartedVerify.current = true;

    verifyToken({ token })
      .then((session) => {
        clearRhSessionDocument();
        setRhAuthSession(session);
        switchRhHistory(historyId);
        navigate(historyResumePath(locale, session.last_step_reached));
      })
      .catch((error: unknown) => {
        setPageState("error");
        if (isAccountApiError(error)) {
          setErrorMessage(magicLinkVerificationMessage(error, _));
        } else {
          setErrorMessage(
            _(msg`Something went wrong while signing you in. Please try again.`)
          );
        }
      });
  }, [token, historyId, locale, navigate, verifyToken, _]);

  if (pageState === "loading") {
    return (
      <section className="resume-page">
        <div className="resume-page__inner">
          <p className="resume-page__status">
            <Trans>Signing you in…</Trans>
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="resume-page">
      <div className="resume-page__inner">
        <h1 className="resume-page__title">
          <Trans>Unable to resume</Trans>
        </h1>
        <p className="resume-page__status">{errorMessage}</p>
        <Link className="resume-page__login-link" to={loginPath}>
          <Trans>Go to login</Trans>
        </Link>
      </div>
    </section>
  );
};

export default ResumePage;
