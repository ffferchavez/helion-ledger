import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { requireOrganizationId } from "@/lib/supabase/auth-helpers";
import { db } from "@/db";
import { organizations } from "@/db/schema";
import { eq } from "drizzle-orm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { OrganizationSettingsForm } from "@/components/settings/organization-form";
import { env } from "@/lib/env";
import { mockOrganization } from "@/lib/mock-data";
import { getServerTranslations } from "@/lib/i18n/server";

export default async function SettingsPage() {
  const { t } = await getServerTranslations();
  const organizationId = await requireOrganizationId();
  
  let organization;
  if (env.USE_MOCK_DATA || !env.DATABASE_URL) {
    organization = {
      ...mockOrganization,
      id: "mock-org-id",
      createdAt: new Date(),
      updatedAt: new Date(),
    } as any;
  } else {
    const [org] = await db
      .select()
      .from(organizations)
      .where(eq(organizations.id, organizationId))
      .limit(1);
    organization = org;
  }

  if (!organization) {
    return <div>{t("settings.notFound")}</div>;
  }

  return (
    <div className="flex h-screen flex-col">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-6 sm:p-8 animate-in fade-in duration-500">
          <div className="mb-6">
            <h2 className="text-3xl font-semibold tracking-tight">{t("settings.title")}</h2>
            <p className="text-sm text-muted-foreground">{t("settings.subtitle")}</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>{t("settings.cardTitle")}</CardTitle>
              <CardDescription>{t("settings.cardDesc")}</CardDescription>
            </CardHeader>
            <CardContent>
              <OrganizationSettingsForm organization={organization} />
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
