import { useMemo, useState } from "react";
import { Button, LinkStyledButton, Pill } from "@justfixnyc/component-library";
import { msg } from "@lingui/core/macro";
import { useLingui } from "@lingui/react";
import { Trans } from "@lingui/react/macro";
import { useNavigate } from "react-router-dom";

import {
  useDeleteRhHistory,
  useRhHistories,
  type RhHistoryList,
} from "../../../api/account";
import {
  clearRhAuthSession,
  clearRhFlowSession,
  clearRhSessionDocument,
  getRhAuthSession,
  switchRhHistory,
} from "../../../session/rhSessionStorage";
import { historyResumePath } from "../../../utils/historyResumePath";
import { useIsDesktop } from "../../../utils/useIsDesktop";
import { ConfirmModal } from "../../ConfirmModal/ConfirmModal";
import "./AccountPage.scss";

const isCompletedHistory = (history: RhHistoryList): boolean =>
  history.last_step_reached === "REPORT_GENERATION";

/**
 * In-progress cards first (newest started first), then completed cards
 * (oldest completed first) per the account page spec.
 */
const sortHistories = (histories: RhHistoryList[]): RhHistoryList[] => {
  const inProgress = histories
    .filter((history) => !isCompletedHistory(history))
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  const completed = histories
    .filter(isCompletedHistory)
    .sort(
      (a, b) =>
        new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime()
    );
  return [...inProgress, ...completed];
};

const AccountPage: React.FC = () => {
  const { i18n, _ } = useLingui();
  const navigate = useNavigate();
  const isDesktop = useIsDesktop();
  const locale = i18n.locale;

  const accessToken = getRhAuthSession()?.accessToken;
  const {
    data: histories,
    isLoading,
    isError,
  } = useRhHistories({
    accessToken,
  });
  const deleteHistory = useDeleteRhHistory();

  const [historyPendingDelete, setHistoryPendingDelete] =
    useState<RhHistoryList | null>(null);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const sortedHistories = useMemo(
    () => sortHistories(histories ?? []),
    [histories]
  );

  const formatDate = (iso: string): string =>
    i18n.date(new Date(iso), {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  const buildAddressLine = (history: RhHistoryList): string => {
    const address = history.address ?? _(msg`Untitled rent history`);
    return history.apartment
      ? _(msg`${address}, Apt ${history.apartment}`)
      : address;
  };

  const onScanNew = () => {
    if (isDesktop) {
      navigate(`/${locale}/login`);
      return;
    }
    clearRhFlowSession();
    navigate(`/${locale}/scanner`);
  };

  const onCardAction = (history: RhHistoryList) => {
    switchRhHistory(history.id);
    if (isCompletedHistory(history)) {
      navigate(`/${locale}/report`);
      return;
    }
    navigate(historyResumePath(locale, history.last_step_reached));
  };

  const onConfirmDelete = () => {
    if (!historyPendingDelete || !accessToken) return;
    deleteHistory.mutate(
      { accessToken, historyId: historyPendingDelete.id },
      {
        onSuccess: () => setHistoryPendingDelete(null),
      }
    );
  };

  const onConfirmLogout = () => {
    clearRhAuthSession();
    clearRhSessionDocument();
    navigate(`/${locale}/login`);
  };

  const deleteDate = historyPendingDelete
    ? formatDate(
        isCompletedHistory(historyPendingDelete)
          ? historyPendingDelete.updated_at
          : historyPendingDelete.created_at
      )
    : "";

  return (
    <>
      <section className="account-page">
        <div className="account-page__inner">
          <h1 className="account-page__title">
            <Trans>Your rent history report(s)</Trans>
          </h1>

          <Button
            className="account-page__scan-new"
            labelText={_(msg`Scan a new rent history`)}
            onClick={onScanNew}
            labelIcon="plus"
            size="large"
          />

          {isLoading ? (
            <p className="account-page__status">
              <Trans>Loading your rent histories…</Trans>
            </p>
          ) : isError ? (
            <p className="account-page__status">
              <Trans>
                We couldn't load your rent histories. Please try again later.
              </Trans>
            </p>
          ) : sortedHistories.length === 0 ? (
            <p className="account-page__status">
              <Trans>You don't have any rent histories yet.</Trans>
            </p>
          ) : (
            <ul className="account-page__list">
              {sortedHistories.map((history) => {
                const completed = isCompletedHistory(history);
                const actionLabel = completed
                  ? _(msg`View report`)
                  : _(msg`Resume`);
                const startedOn = formatDate(history.created_at);
                const completedOn = formatDate(history.updated_at);

                return (
                  <li key={history.id} className="account-page__card">
                    <div className="account-page__card-top">
                      <Pill color={completed ? "green" : "yellow"}>
                        {completed ? (
                          <Trans>Completed</Trans>
                        ) : (
                          <Trans>In progress</Trans>
                        )}
                      </Pill>
                      <LinkStyledButton
                        onClick={() => setHistoryPendingDelete(history)}
                      >
                        <Trans>Delete</Trans>
                      </LinkStyledButton>
                    </div>
                    <div className="account-page__card-content">
                      <h2 className="account-page__card-content__address">
                        {buildAddressLine(history)}
                      </h2>
                      <p className="account-page__card-content__date">
                        {completed ? (
                          <Trans>Completed {completedOn}</Trans>
                        ) : (
                          <Trans>Started {startedOn}</Trans>
                        )}
                      </p>
                    </div>
                    <Button
                      className="account-page__card-cta"
                      labelText={actionLabel}
                      variant={completed ? "primary" : "secondary"}
                      size="small"
                      onClick={() => onCardAction(history)}
                    />
                  </li>
                );
              })}
            </ul>
          )}

          <LinkStyledButton
            className="account-page__logout"
            onClick={() => setIsLogoutModalOpen(true)}
          >
            <Trans>Log out</Trans>
          </LinkStyledButton>
        </div>
      </section>

      <ConfirmModal
        isOpen={historyPendingDelete !== null}
        title={<Trans>Permanently delete this rent history?</Trans>}
        body={
          historyPendingDelete && isCompletedHistory(historyPendingDelete) ? (
            <Trans>
              This rent history, completed on {deleteDate}, will be permanently
              deleted. This can't be undone.
            </Trans>
          ) : (
            <Trans>
              This rent history, started on {deleteDate}, will be permanently
              deleted. This can't be undone.
            </Trans>
          )
        }
        confirmAction={{
          labelText: _(msg`Delete`),
          variant: "primary",
          onClick: onConfirmDelete,
          disabled: deleteHistory.isPending,
        }}
        cancelAction={{
          labelText: _(msg`Cancel`),
          variant: "secondary",
          onClick: () => setHistoryPendingDelete(null),
        }}
        onClose={() => setHistoryPendingDelete(null)}
      />

      <ConfirmModal
        isOpen={isLogoutModalOpen}
        title={<Trans>Log out?</Trans>}
        body={
          <Trans>
            You'll need to enter your phone number to access your reports again.
          </Trans>
        }
        confirmAction={{
          labelText: _(msg`Log out`),
          variant: "primary",
          onClick: onConfirmLogout,
        }}
        cancelAction={{
          labelText: _(msg`Cancel`),
          variant: "secondary",
          onClick: () => setIsLogoutModalOpen(false),
        }}
        onClose={() => setIsLogoutModalOpen(false)}
      />
    </>
  );
};

export default AccountPage;
