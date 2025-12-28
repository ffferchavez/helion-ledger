import { NextRequest, NextResponse } from "next/server";
import { requireOrganizationId } from "@/lib/supabase/auth-helpers";
import { getInvoiceById } from "@/db/queries/invoices";
import { getClientById } from "@/db/queries/clients";
import { db } from "@/db";
import { organizations } from "@/db/schema";
import { eq } from "drizzle-orm";
import { generateInvoicePDF } from "@/lib/pdf/invoice-generator";

export async function GET(request: NextRequest) {
  try {
    const organizationId = await requireOrganizationId();
    const searchParams = request.nextUrl.searchParams;
    const invoiceId = searchParams.get("invoiceId");

    if (!invoiceId) {
      return NextResponse.json({ error: "Invoice ID required" }, { status: 400 });
    }

    const invoiceData = await getInvoiceById(invoiceId, organizationId);
    if (!invoiceData) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    const client = await getClientById(invoiceData.clientId, organizationId);
    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    const [organization] = await db
      .select()
      .from(organizations)
      .where(eq(organizations.id, organizationId))
      .limit(1);

    if (!organization) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 });
    }

    const pdfBuffer = await generateInvoicePDF({
      invoice: invoiceData,
      items: invoiceData.items,
      client,
      organization,
    });

    return new NextResponse(pdfBuffer as any, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="invoice-${invoiceData.invoiceNumber}.pdf"`,
      },
    });
  } catch (error) {
    console.error("Error generating PDF:", error);
    return NextResponse.json(
      { error: "Failed to generate PDF" },
      { status: 500 }
    );
  }
}

