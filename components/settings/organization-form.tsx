"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import { COUNTRY_BASE, CURRENCY } from "@/lib/constants";
import type { Organization } from "@/db/schema/organizations";
import { useI18n } from "@/components/providers/app-providers";

const organizationSchema = z.object({
  name: z.string().min(1, "validation.nameRequired"),
  countryBase: z.enum([COUNTRY_BASE.DE, COUNTRY_BASE.MX]),
  defaultCurrency: z.enum([CURRENCY.EUR, CURRENCY.MXN, CURRENCY.USD]),
  taxIdDe: z.string().optional(),
  taxIdMx: z.string().optional(),
  addressLine1: z.string().optional(),
  addressLine2: z.string().optional(),
  city: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().optional(),
});

type OrganizationFormData = z.infer<typeof organizationSchema>;

interface OrganizationSettingsFormProps {
  organization: Organization;
}

export function OrganizationSettingsForm({ organization }: OrganizationSettingsFormProps) {
  const { t } = useI18n();
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<OrganizationFormData>({
    resolver: zodResolver(organizationSchema),
    defaultValues: {
      name: organization.name,
      countryBase: organization.countryBase,
      defaultCurrency: organization.defaultCurrency,
      taxIdDe: organization.taxIdDe || "",
      taxIdMx: organization.taxIdMx || "",
      addressLine1: organization.addressLine1 || "",
      addressLine2: organization.addressLine2 || "",
      city: organization.city || "",
      postalCode: organization.postalCode || "",
      country: organization.country || "",
    },
  });

  const handleFormSubmit = async (data: OrganizationFormData) => {
    // TODO: Implement update action
    alert(t("settings.form.updateSoon"));
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">
          {t("settings.form.name")} *
        </Label>
        <Input id="name" {...register("name")} />
        {errors.name?.message && (
          <p className="text-sm text-destructive">{t(errors.name.message)}</p>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="countryBase">
            {t("settings.form.baseCountry")} *
          </Label>
          <Select
            value={watch("countryBase")}
            onValueChange={(value) => setValue("countryBase", value as any)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={COUNTRY_BASE.DE}>{t("countries.DE")}</SelectItem>
              <SelectItem value={COUNTRY_BASE.MX}>{t("countries.MX")}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="defaultCurrency">
            {t("settings.form.defaultCurrency")} *
          </Label>
          <Select
            value={watch("defaultCurrency")}
            onValueChange={(value) => setValue("defaultCurrency", value as any)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={CURRENCY.EUR}>EUR</SelectItem>
              <SelectItem value={CURRENCY.MXN}>MXN</SelectItem>
              <SelectItem value={CURRENCY.USD}>USD</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="taxIdDe">{t("settings.form.taxIdDe")}</Label>
          <Input id="taxIdDe" {...register("taxIdDe")} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="taxIdMx">{t("settings.form.taxIdMx")}</Label>
          <Input id="taxIdMx" {...register("taxIdMx")} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="addressLine1">{t("settings.form.addressLine1")}</Label>
        <Input id="addressLine1" {...register("addressLine1")} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="addressLine2">{t("settings.form.addressLine2")}</Label>
        <Input id="addressLine2" {...register("addressLine2")} />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="city">{t("settings.form.city")}</Label>
          <Input id="city" {...register("city")} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="postalCode">{t("settings.form.postalCode")}</Label>
          <Input id="postalCode" {...register("postalCode")} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="country">{t("settings.form.country")}</Label>
          <Input id="country" {...register("country")} />
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? t("common.saving") : t("settings.form.save")}
        </Button>
      </div>
    </form>
  );
}
