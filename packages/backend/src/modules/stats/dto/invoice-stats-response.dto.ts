import { Expose, Exclude, Type } from "class-transformer";
import { ApiProperty } from "@nestjs/swagger";

@Exclude()
export class PaymentStatusDistributionDto {
  @Expose()
  @ApiProperty({ description: "Number of unpaid invoices" })
  unpaid: number;

  @Expose()
  @ApiProperty({ description: "Number of partially paid invoices" })
  partiallyPaid: number;

  @Expose()
  @ApiProperty({ description: "Number of fully paid invoices" })
  paid: number;

  @Expose()
  @ApiProperty({ description: "Percentage of unpaid invoices" })
  unpaidPercent: number;

  @Expose()
  @ApiProperty({ description: "Percentage of partially paid invoices" })
  partiallyPaidPercent: number;

  @Expose()
  @ApiProperty({ description: "Percentage of paid invoices" })
  paidPercent: number;
}

@Exclude()
export class PaymentMethodDistributionDto {
  @Expose()
  @ApiProperty({ description: "Payment method name" })
  method: string;

  @Expose()
  @ApiProperty({ description: "Number of payments" })
  count: number;

  @Expose()
  @ApiProperty({ description: "Total amount for this method" })
  amount: number;

  @Expose()
  @ApiProperty({ description: "Percentage of total payments" })
  percent: number;
}

@Exclude()
export class InvoiceMonthlyTrendDto {
  @Expose()
  @ApiProperty({ description: "Month label (e.g., 'Январь')" })
  month: string;

  @Expose()
  @ApiProperty({ description: "Short month label (e.g., 'Янв')" })
  monthShort: string;

  @Expose()
  @ApiProperty({ description: "Year" })
  year: number;

  @Expose()
  @ApiProperty({ description: "Number of invoices created this month" })
  invoicesCount: number;

  @Expose()
  @ApiProperty({ description: "Total revenue this month" })
  revenue: number;
}

@Exclude()
export class InvoiceStatsResponseDto {
  @Expose()
  @ApiProperty({ description: "Total number of invoices" })
  totalInvoices: number;

  @Expose()
  @ApiProperty({ description: "Total revenue (all invoices total amount)" })
  totalRevenue: number;

  @Expose()
  @ApiProperty({ description: "Total amount collected (paid)" })
  totalCollected: number;

  @Expose()
  @ApiProperty({ description: "Total outstanding balance (unpaid)" })
  totalOutstanding: number;

  @Expose()
  @ApiProperty({ description: "Revenue this month" })
  revenueThisMonth: number;

  @Expose()
  @ApiProperty({ description: "Revenue last month" })
  revenueLastMonth: number;

  @Expose()
  @ApiProperty({
    description: "Revenue growth percentage compared to last month",
  })
  growthPercent: number;

  @Expose()
  @ApiProperty({ description: "Average invoice amount" })
  averageInvoiceAmount: number;

  @Expose()
  @Type(() => PaymentStatusDistributionDto)
  @ApiProperty({
    description: "Payment status distribution",
    type: PaymentStatusDistributionDto,
  })
  statusDistribution: PaymentStatusDistributionDto;

  @Expose()
  @Type(() => PaymentMethodDistributionDto)
  @ApiProperty({
    description: "Payment method distribution",
    type: [PaymentMethodDistributionDto],
  })
  paymentMethodDistribution: PaymentMethodDistributionDto[];

  @Expose()
  @Type(() => InvoiceMonthlyTrendDto)
  @ApiProperty({
    description: "Monthly revenue trends (last 6 months)",
    type: [InvoiceMonthlyTrendDto],
  })
  monthlyTrends: InvoiceMonthlyTrendDto[];
}
