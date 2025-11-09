import { Injectable } from "@nestjs/common";
import * as PDFDocument from "pdfkit";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { join } from "path";
import type { ServiceOrderResponseDto } from "./dto/service-order-response.dto";

@Injectable()
export class ServiceOrderPdfService {
  // Shadcn UI color palette
  private readonly colors = {
    slate900: "#0f172a", // Primary text
    slate700: "#334155", // Secondary text
    slate500: "#64748b", // Muted text
    slate200: "#e2e8f0", // Borders
    slate100: "#f1f5f9", // Light background
    slate50: "#f8fafc", // Lighter background
    blue600: "#2563eb", // Primary color
    blue50: "#eff6ff", // Light blue background
    white: "#ffffff",
  };

  /**
   * Generates PDF buffer for service order results using PDFKit
   * Styled with shadcn UI design system
   */
  async generateResultsPdf(order: ServiceOrderResponseDto): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new (PDFDocument as any)({
          size: "A4",
          margins: {
            top: 50,
            bottom: 50,
            left: 50,
            right: 50,
          },
        });

        const buffers: Buffer[] = [];

        doc.on("data", (buffer: Buffer) => buffers.push(buffer));
        doc.on("end", () => resolve(Buffer.concat(buffers)));
        doc.on("error", reject);

        // Register DejaVu Sans fonts for Cyrillic support
        const fontPath = join(__dirname, "..", "..", "..", "assets", "fonts");
        doc.registerFont("DejaVu", join(fontPath, "DejaVuSans.ttf"));
        doc.registerFont("DejaVu-Bold", join(fontPath, "DejaVuSans-Bold.ttf"));

        // Set default font to DejaVu
        doc.font("DejaVu");

        const pageWidth = doc.page.width;

        // Header with modern design
        doc
          .font("DejaVu-Bold")
          .fontSize(20)
          .fillColor(this.colors.slate900)
          .text("Результаты исследования", { align: "center" })
          .moveDown(0.3);

        doc
          .font("DejaVu")
          .fontSize(10)
          .fillColor(this.colors.slate500)
          .text(
            `№ ${order.id.substring(0, 8).toUpperCase()}${
              order.resultAt
                ? ` • ${format(new Date(order.resultAt), "dd.MM.yyyy HH:mm", { locale: ru })}`
                : ""
            }`,
            { align: "center" }
          )
          .moveDown(2);

        // Patient card
        const patientY = doc.y;
        this.drawCard(doc, patientY, 70);

        doc
          .font("DejaVu-Bold")
          .fontSize(11)
          .fillColor(this.colors.slate900)
          .text("Пациент", 60, patientY + 12);

        const patientName = [
          order.patient.lastName,
          order.patient.firstName,
          order.patient.middleName,
        ]
          .filter(Boolean)
          .join(" ");

        doc
          .font("DejaVu")
          .fontSize(10)
          .fillColor(this.colors.slate700)
          .text(patientName, 60, patientY + 30);

        if (order.patient.patientId) {
          doc
            .fontSize(9)
            .fillColor(this.colors.slate500)
            .text(`ID: ${order.patient.patientId}`, 60, patientY + 47);
        }

        doc.y = patientY + 85;

        // Service card
        const serviceY = doc.y;
        this.drawCard(doc, serviceY, 90);

        doc
          .font("DejaVu-Bold")
          .fontSize(11)
          .fillColor(this.colors.slate900)
          .text("Услуга", 60, serviceY + 12);

        doc
          .font("DejaVu")
          .fontSize(10)
          .fillColor(this.colors.slate700)
          .text(order.service.name, 60, serviceY + 30);

        if (order.service.code) {
          doc
            .fontSize(9)
            .fillColor(this.colors.slate500)
            .text(`Код: ${order.service.code}`, 60, serviceY + 47);
        }

        const doctorName = [
          order.doctor.lastName,
          order.doctor.firstName,
          order.doctor.middleName,
        ]
          .filter(Boolean)
          .join(" ");

        doc
          .fontSize(9)
          .fillColor(this.colors.slate500)
          .text(`Врач: ${doctorName}`, 60, serviceY + 64);

        doc.y = serviceY + 105;

        // Results section
        doc
          .font("DejaVu-Bold")
          .fontSize(14)
          .fillColor(this.colors.slate900)
          .text("Результаты");

        // Divider line
        doc
          .moveTo(50, doc.y + 10)
          .lineTo(pageWidth - 50, doc.y + 10)
          .strokeColor(this.colors.slate200)
          .lineWidth(1)
          .stroke();

        doc.moveDown(1.5);

        // Check result type
        const isAnalysisResult =
          order.resultData &&
          "templateId" in order.resultData &&
          (("filledData" in order.resultData &&
            "rows" in (order.resultData as any).filledData) ||
            ("rows" in order.resultData && !("formData" in order.resultData)));

        const isProtocolResult =
          order.resultData &&
          "templateId" in order.resultData &&
          (("filledData" in order.resultData &&
            !("rows" in (order.resultData as any).filledData)) ||
            "formData" in order.resultData);

        if (isAnalysisResult) {
          this.addAnalysisResults(doc, order.resultData as any);
        } else if (isProtocolResult) {
          this.addProtocolResults(doc, order.resultData as any);
        } else if (order.resultText) {
          doc
            .fontSize(10)
            .fillColor(this.colors.slate700)
            .text(order.resultText);
        } else {
          doc
            .fontSize(10)
            .fillColor(this.colors.slate500)
            .text("Результаты не внесены", { align: "center" });
        }

        // Footer
        const footerY = doc.page.height - 70;
        doc.y = footerY;

        // Footer divider
        doc
          .moveTo(50, footerY)
          .lineTo(pageWidth - 50, footerY)
          .strokeColor(this.colors.slate200)
          .lineWidth(1)
          .stroke();

        doc
          .font("DejaVu")
          .fontSize(8)
          .fillColor(this.colors.slate500)
          .text(
            `Создано: ${format(new Date(), "dd.MM.yyyy HH:mm")}`,
            50,
            footerY + 15,
            { align: "center", width: pageWidth - 100 }
          );

        // Performer signature if available
        if (order.performedBy) {
          const performedByName = [
            order.performedBy.lastName,
            order.performedBy.firstName,
            order.performedBy.middleName,
          ]
            .filter(Boolean)
            .join(" ");

          doc
            .fontSize(8)
            .fillColor(this.colors.slate500)
            .text(`Исполнитель: ${performedByName}`, 50, footerY + 30, {
              align: "right",
              width: pageWidth - 100,
            });
        }

        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }

  private addAnalysisResults(doc: any, data: any) {
    const filledData = "filledData" in data ? data.filledData : data;
    const rows = filledData.rows || [];
    const pageWidth = doc.page.width;

    if (data.templateName) {
      doc
        .fontSize(9)
        .fillColor(this.colors.slate500)
        .text(`Шаблон: ${data.templateName}`)
        .moveDown(0.5);
    }

    // Table header
    const tableStartY = doc.y;
    const tableLeft = 50;
    const tableWidth = pageWidth - 100;

    // Header row with blue background
    doc
      .rect(tableLeft, tableStartY, tableWidth, 25)
      .fill(this.colors.blue50);

    doc
      .font("DejaVu-Bold")
      .fontSize(9)
      .fillColor(this.colors.slate900)
      .text("Параметр", tableLeft + 10, tableStartY + 8)
      .text("Значение", tableLeft + tableWidth * 0.45, tableStartY + 8)
      .text("Ед.изм.", tableLeft + tableWidth * 0.6, tableStartY + 8)
      .text("Референс", tableLeft + tableWidth * 0.75, tableStartY + 8);

    let currentY = tableStartY + 25;

    // Table rows
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowHeight = 22;
      const isEven = i % 2 === 0;

      // Alternating row colors
      doc
        .rect(tableLeft, currentY, tableWidth, rowHeight)
        .fillAndStroke(
          isEven ? this.colors.white : this.colors.slate50,
          this.colors.slate200
        );

      // Parameter name
      doc
        .font("DejaVu")
        .fontSize(9)
        .fillColor(this.colors.slate700)
        .text(row.parameterName || "", tableLeft + 10, currentY + 6, {
          width: tableWidth * 0.35,
        });

      // Value (bold)
      doc
        .font("DejaVu-Bold")
        .fontSize(10)
        .fillColor(this.colors.slate900)
        .text(
          row.value?.toString() || "",
          tableLeft + tableWidth * 0.45,
          currentY + 5,
          { width: tableWidth * 0.12 }
        );

      // Unit
      doc
        .font("DejaVu")
        .fontSize(8)
        .fillColor(this.colors.slate500)
        .text(row.unit || "", tableLeft + tableWidth * 0.6, currentY + 6, {
          width: tableWidth * 0.12,
        });

      // Reference range
      let ref = "";
      if (row.referenceMin !== undefined && row.referenceMax !== undefined) {
        ref = `${row.referenceMin} - ${row.referenceMax}`;
      } else if (row.referenceText) {
        ref = row.referenceText;
      }

      doc
        .fontSize(8)
        .fillColor(this.colors.slate500)
        .text(ref, tableLeft + tableWidth * 0.75, currentY + 6, {
          width: tableWidth * 0.2,
        });

      currentY += rowHeight;
    }

    doc.y = currentY + 10;
  }

  private addProtocolResults(doc: any, data: any) {
    const filledData = "filledData" in data ? data.filledData : data.formData;

    if (data.templateName) {
      doc
        .fontSize(9)
        .fillColor(this.colors.slate500)
        .text(`Шаблон: ${data.templateName}`)
        .moveDown(0.5);
    }

    // Parse template for labels
    const fieldLabels = new Map<string, string>();
    try {
      const templateContent =
        typeof data.templateContent === "string"
          ? JSON.parse(data.templateContent)
          : data.templateContent;

      if (templateContent && templateContent.sections) {
        for (const section of templateContent.sections) {
          if (section.fields) {
            for (const field of section.fields) {
              fieldLabels.set(field.id, field.label || field.id);
            }
          }
        }
      }
    } catch (error) {
      // Fallback
    }

    // Render fields with cards
    Object.entries(filledData).forEach(([fieldId, value]) => {
      if (value !== null && value !== undefined && value !== "") {
        const label = fieldLabels.get(fieldId) || fieldId;
        const fieldY = doc.y;

        // Field card
        this.drawCard(doc, fieldY, 30);

        doc
          .font("DejaVu")
          .fontSize(9)
          .fillColor(this.colors.slate500)
          .text(label, 60, fieldY + 8);

        doc
          .fontSize(10)
          .fillColor(this.colors.slate900)
          .text(String(value), 250, fieldY + 8);

        doc.y = fieldY + 40;
      }
    });
  }

  /**
   * Draw a card (rectangle with border) - shadcn UI style
   */
  private drawCard(doc: any, y: number, height: number) {
    const pageWidth = doc.page.width;
    doc
      .rect(50, y, pageWidth - 100, height)
      .fillAndStroke(this.colors.slate50, this.colors.slate200);
  }
}
