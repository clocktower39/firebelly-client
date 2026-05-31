import { useCallback, useEffect, useMemo, useState } from "react";
import { billingApi } from "../api/scheduleApi";

export default function useScheduleBilling({
  isTrainerView,
  userId,
  selectedTrainerId,
  selectedClientIds,
  openEditDialog,
  editSessionTypeId,
  openSelectionDialog,
  quickBookSessionTypeId,
  openTrainerBookDialog,
  trainerBookSessionTypeId,
  sessionTypeLookup,
}) {
  const [billingSummary, setBillingSummary] = useState(null);
  const [billingLoading, setBillingLoading] = useState(false);

  const billingTrainerId = isTrainerView ? userId : selectedTrainerId;
  const billingClientId = isTrainerView
    ? selectedClientIds.length === 1
      ? selectedClientIds[0]
      : null
    : userId;

  const billingByType = useMemo(() => {
    const map = new Map();
    (billingSummary?.bySessionType || []).forEach((entry) => {
      map.set(entry.sessionTypeId, entry);
    });
    return map;
  }, [billingSummary]);

  const activeSessionTypeId =
    (openEditDialog && editSessionTypeId) ||
    (openSelectionDialog && quickBookSessionTypeId) ||
    (openTrainerBookDialog && trainerBookSessionTypeId) ||
    "";

  const selectedTypeEntry = activeSessionTypeId
    ? billingByType.get(activeSessionTypeId) || {
        remainingSessions: 0,
        credits: 0,
        debits: 0,
        dueForPayment: true,
      }
    : null;
  const selectedTypeName = activeSessionTypeId
    ? sessionTypeLookup.get(activeSessionTypeId)?.name || "Session type"
    : "";

  const refreshBillingSummary = useCallback(async () => {
    if (!billingTrainerId || !billingClientId) {
      setBillingSummary(null);
      return;
    }
    setBillingLoading(true);
    try {
      const data = await billingApi.getSummary({
        trainerId: billingTrainerId,
        clientId: billingClientId,
      });
      if (data.error) {
        setBillingSummary(null);
        return;
      }
      setBillingSummary(data);
    } catch (err) {
      setBillingSummary(null);
    } finally {
      setBillingLoading(false);
    }
  }, [billingClientId, billingTrainerId]);

  useEffect(() => {
    refreshBillingSummary();
  }, [refreshBillingSummary]);

  return {
    billingSummary,
    billingLoading,
    selectedTypeEntry,
    selectedTypeName,
    refreshBillingSummary,
  };
}
