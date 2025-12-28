"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { clientSchema, type ClientFormData } from "@/lib/validation/clients";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CURRENCY, LANGUAGE } from "@/lib/constants";
import { useI18n } from "@/components/providers/app-providers";

interface ClientFormProps {
  initialData?: ClientFormData;
  onSubmit: (data: ClientFormData) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
}

export function ClientForm({ initialData, onSubmit, onCancel, isLoading }: ClientFormProps) {
  const { t } = useI18n();
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema) as any,
    defaultValues: initialData || {
      defaultLanguage: LANGUAGE.EN,
    },
  });

  const defaultCurrency = watch("defaultCurrency");
  const defaultLanguage = watch("defaultLanguage");

  const handleFormSubmit = async (data: ClientFormData) => {
    await onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">{t("clientForm.name")} *</Label>
        <Input id="name" {...register("name")} />
        {errors.name?.message && (
          <p className="text-sm text-destructive">{t(errors.name.message)}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="contactPerson">{t("clientForm.contactPerson")}</Label>
        <Input id="contactPerson" {...register("contactPerson")} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="email">{t("clientForm.email")}</Label>
          <Input id="email" type="email" {...register("email")} />
          {errors.email?.message && (
            <p className="text-sm text-destructive">{t(errors.email.message)}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">{t("clientForm.phone")}</Label>
          <Input id="phone" {...register("phone")} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="addressLine1">{t("clientForm.addressLine1")}</Label>
        <Input id="addressLine1" {...register("addressLine1")} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="addressLine2">{t("clientForm.addressLine2")}</Label>
        <Input id="addressLine2" {...register("addressLine2")} />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="city">{t("clientForm.city")}</Label>
          <Input id="city" {...register("city")} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="postalCode">{t("clientForm.postalCode")}</Label>
          <Input id="postalCode" {...register("postalCode")} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="country">{t("clientForm.country")}</Label>
          <Input id="country" {...register("country")} />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="defaultCurrency">{t("clientForm.defaultCurrency")}</Label>
          <Select
            value={defaultCurrency || ""}
            onValueChange={(value) => setValue("defaultCurrency", value as any)}
          >
            <SelectTrigger>
              <SelectValue placeholder={t("clientForm.selectCurrency")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={CURRENCY.EUR}>EUR</SelectItem>
              <SelectItem value={CURRENCY.MXN}>MXN</SelectItem>
              <SelectItem value={CURRENCY.USD}>USD</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="defaultLanguage">{t("clientForm.defaultLanguage")}</Label>
          <Select
            value={defaultLanguage || LANGUAGE.EN}
            onValueChange={(value) => setValue("defaultLanguage", value as any)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={LANGUAGE.EN}>{t("languages.en")}</SelectItem>
              <SelectItem value={LANGUAGE.DE}>{t("languages.de")}</SelectItem>
              <SelectItem value={LANGUAGE.ES}>{t("languages.es")}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="taxId">{t("clientForm.taxId")}</Label>
        <Input id="taxId" {...register("taxId")} />
      </div>

      <div className="flex justify-end gap-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
            {t("common.cancel")}
          </Button>
        )}
        <Button type="submit" disabled={isLoading}>
          {isLoading ? t("common.saving") : t("clientForm.save")}
        </Button>
      </div>
    </form>
  );
}
