import { useCallback, useEffect, useMemo, useState } from "react";
import { scheduleApi } from "../api/scheduleApi";

const defaultSessionTypeForm = {
  name: "",
  description: "",
  durationMinutes: "",
  creditsRequired: "",
  defaultPrice: "",
  currency: "USD",
  defaultPayout: "",
  payoutCurrency: "USD",
  active: true,
  isDefault: false,
};

export default function useSessionTypes({ isTrainer }) {
  const [sessionTypes, setSessionTypes] = useState([]);
  const [sessionTypesStatus, setSessionTypesStatus] = useState("");
  const [openSessionTypesDialog, setOpenSessionTypesDialog] = useState(false);
  const [openSessionTypeFormDialog, setOpenSessionTypeFormDialog] = useState(false);
  const [sessionTypeForm, setSessionTypeForm] = useState(defaultSessionTypeForm);
  const [editingSessionTypeId, setEditingSessionTypeId] = useState("");

  const loadSessionTypes = useCallback(async () => {
    if (!isTrainer) return;
    try {
      setSessionTypesStatus("");
      const data = await scheduleApi.getSessionTypes();
      if (data?.error) {
        throw new Error(data.error);
      }
      setSessionTypes(data.sessionTypes || []);
    } catch (err) {
      setSessionTypesStatus(err.message || "Unable to load session types.");
    }
  }, [isTrainer]);

  useEffect(() => {
    if (!isTrainer) return;
    loadSessionTypes();
  }, [isTrainer, loadSessionTypes]);

  const sessionTypeLookup = useMemo(() => {
    const map = new Map();
    sessionTypes.forEach((type) => {
      map.set(type._id, type);
    });
    return map;
  }, [sessionTypes]);

  const resetSessionTypeForm = useCallback(() => {
    setSessionTypeForm(defaultSessionTypeForm);
    setEditingSessionTypeId("");
    setOpenSessionTypeFormDialog(false);
  }, []);

  const handleSaveSessionType = async () => {
    if (!sessionTypeForm.name.trim()) return;
    const payload = {
      name: sessionTypeForm.name.trim(),
      description: sessionTypeForm.description.trim(),
      durationMinutes:
        sessionTypeForm.durationMinutes === "" ? 60 : Number(sessionTypeForm.durationMinutes),
      creditsRequired:
        sessionTypeForm.creditsRequired === "" ? 1 : Number(sessionTypeForm.creditsRequired),
      defaultPrice: sessionTypeForm.defaultPrice === "" ? 0 : Number(sessionTypeForm.defaultPrice),
      currency: sessionTypeForm.currency || "USD",
      defaultPayout:
        sessionTypeForm.defaultPayout === "" ? 0 : Number(sessionTypeForm.defaultPayout),
      payoutCurrency: sessionTypeForm.payoutCurrency || "USD",
      active: sessionTypeForm.active,
    };
    try {
      if (editingSessionTypeId) {
        const data = await scheduleApi.updateSessionType(editingSessionTypeId, payload);
        if (data?.error) throw new Error(data.error);
      } else {
        const data = await scheduleApi.createSessionType(payload);
        if (data?.error) throw new Error(data.error);
      }
      setSessionTypesStatus("");
      resetSessionTypeForm();
      loadSessionTypes();
    } catch (err) {
      setSessionTypesStatus(err.message || "Unable to save session type.");
    }
  };

  const handleEditSessionType = (type) => {
    setEditingSessionTypeId(type._id);
    setSessionTypeForm({
      name: type.name || "",
      description: type.description || "",
      durationMinutes:
        type.durationMinutes === 0 || type.durationMinutes ? String(type.durationMinutes) : "",
      creditsRequired:
        type.creditsRequired === 0 || type.creditsRequired
          ? String(type.creditsRequired)
          : "",
      defaultPrice:
        type.defaultPrice === 0 || type.defaultPrice ? String(type.defaultPrice) : "",
      currency: type.currency || "USD",
      defaultPayout:
        type.defaultPayout === 0 || type.defaultPayout ? String(type.defaultPayout) : "",
      payoutCurrency: type.payoutCurrency || "USD",
      active: type.active !== false,
      isDefault: type.isDefault === true,
    });
    setOpenSessionTypeFormDialog(true);
  };

  const handleDeleteSessionType = async (typeId) => {
    try {
      const data = await scheduleApi.deleteSessionType(typeId);
      if (data?.error) throw new Error(data.error);
      if (editingSessionTypeId === typeId) {
        resetSessionTypeForm();
      }
      setSessionTypesStatus("");
      loadSessionTypes();
    } catch (err) {
      setSessionTypesStatus(err.message || "Unable to delete session type.");
    }
  };

  return {
    sessionTypes,
    sessionTypesStatus,
    setSessionTypesStatus,
    openSessionTypesDialog,
    setOpenSessionTypesDialog,
    openSessionTypeFormDialog,
    setOpenSessionTypeFormDialog,
    sessionTypeForm,
    setSessionTypeForm,
    editingSessionTypeId,
    sessionTypeLookup,
    resetSessionTypeForm,
    handleSaveSessionType,
    handleEditSessionType,
    handleDeleteSessionType,
  };
}
