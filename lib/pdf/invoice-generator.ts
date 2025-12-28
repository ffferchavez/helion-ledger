import PDFDocument from "pdfkit";
import { Buffer } from "buffer";
import type { Invoice } from "@/db/schema/invoices";
import type { InvoiceItem } from "@/db/schema/invoice-items";
import type { Client } from "@/db/schema/clients";
import type { Organization } from "@/db/schema/organizations";
import { DEFAULT_LOCALE, type Locale } from "@/lib/i18n/constants";
import { getDictionary, translate } from "@/lib/i18n/dictionaries";

interface InvoiceData {
  invoice: Invoice;
  items: InvoiceItem[];
  client: Client;
  organization: Organization;
}

/**
 * Generate PDF for an invoice
 * This is a basic implementation - can be enhanced with better styling
 */
export async function generateInvoicePDF(data: InvoiceData): Promise<Buffer> {
  const { invoice, items, client, organization } = data;
  const locale: Locale =
    invoice.language === "de" || invoice.language === "es" || invoice.language === "en"
      ? invoice.language
      : DEFAULT_LOCALE;
  const dictionary = getDictionary(locale);
  const t = (path: string, values?: Record<string, string | number>) =>
    translate(dictionary, path, values);

  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const buffers: Buffer[] = [];

      doc.on("data", buffers.push.bind(buffers));
      doc.on("end", () => {
        const pdfBuffer = Buffer.concat(buffers);
        resolve(pdfBuffer);
      });
      doc.on("error", reject);

      // Header
      doc.fontSize(20).text(organization.name, { align: "right" });
      doc.fontSize(12).text(t("pdf.invoiceTitle").toUpperCase(), { align: "right" });
      doc.moveDown();

      // Organization address
      if (organization.addressLine1) {
        doc.fontSize(10).text(organization.addressLine1, { align: "right" });
      }
      if (organization.city && organization.postalCode) {
        doc.text(`${organization.postalCode} ${organization.city}`, { align: "right" });
      }
      if (organization.country) {
        doc.text(organization.country, { align: "right" });
      }
      doc.moveDown(2);

      // Invoice details
      doc.fontSize(14).text(`${t("pdf.invoiceNumber")}: ${invoice.invoiceNumber}`);
      doc.fontSize(10).text(`${t("pdf.issueDate")}: ${invoice.issueDate}`);
      doc.text(`${t("pdf.dueDate")}: ${invoice.dueDate}`);
      doc.moveDown();

      // Client information
      doc.fontSize(12).text(`${t("pdf.billTo")}:`, { underline: true });
      doc.fontSize(10).text(client.name);
      if (client.addressLine1) {
        doc.text(client.addressLine1);
      }
      if (client.city && client.postalCode) {
        doc.text(`${client.postalCode} ${client.city}`);
      }
      if (client.country) {
        doc.text(client.country);
      }
      doc.moveDown(2);

      // Line items table
      doc.fontSize(10);
      doc.text(t("pdf.description"), 50, doc.y);
      doc.text(t("pdf.quantity"), 300, doc.y);
      doc.text(t("pdf.price"), 350, doc.y);
      doc.text(t("pdf.tax"), 400, doc.y);
      doc.text(t("pdf.total"), 450, doc.y);
      doc.moveDown(0.5);
      doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
      doc.moveDown(0.5);

      items.forEach((item) => {
        doc.text(item.description, 50);
        doc.text(item.quantity, 300);
        doc.text(item.unitPrice, 350);
        doc.text(`${item.taxRate}%`, 400);
        doc.text(item.lineTotal, 450);
        doc.moveDown(0.5);
      });

      doc.moveDown();
      doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
      doc.moveDown();

      // Totals
      doc.text(`${t("pdf.subtotal")}: ${invoice.subtotalAmount} ${invoice.currency}`, { align: "right" });
      doc.text(`${t("pdf.tax")}: ${invoice.taxAmount} ${invoice.currency}`, { align: "right" });
      doc.fontSize(12).text(`${t("pdf.total")}: ${invoice.totalAmount} ${invoice.currency}`, {
        align: "right",
        underline: true,
      });

      // Notes
      if (invoice.notes) {
        doc.moveDown(2);
        doc.fontSize(10).text(`${t("pdf.notes")}:`, { underline: true });
        doc.text(invoice.notes);
      }

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}
