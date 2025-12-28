"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { INVOICE_STATUS } from "@/lib/constants";
import { useI18n } from "@/components/providers/app-providers";

interface InvoiceStatusSelectProps {
  invoiceId: string;
  currentStatus: string;
  onStatusChange: (status: string) => Promise<void>;
}

export function InvoiceStatusSelect({
  invoiceId,
  currentStatus,
  onStatusChange,
}: InvoiceStatusSelectProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const { t } = useI18n();

  const handleChange = (value: string) => {
    startTransition(async () => {
      await onStatusChange(value);
      router.refresh();
    });
  };

  return (
    <Select value={currentStatus} onValueChange={handleChange} disabled={isPending}>
      <SelectTrigger className="w-32">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={INVOICE_STATUS.DRAFT}>{t("invoiceStatus.draft")}</SelectItem>
        <SelectItem value={INVOICE_STATUS.SENT}>{t("invoiceStatus.sent")}</SelectItem>
        <SelectItem value={INVOICE_STATUS.PAID}>{t("invoiceStatus.paid")}</SelectItem>
        <SelectItem value={INVOICE_STATUS.OVERDUE}>{t("invoiceStatus.overdue")}</SelectItem>
        <SelectItem value={INVOICE_STATUS.CANCELLED}>{t("invoiceStatus.cancelled")}</SelectItem>
      </SelectContent>
    </Select>
  );
}
