export interface StripeBusinessData {
  businessName: string;
  businessLogo: string | null;
  businessUrl: string | null;
  monthlyRecurringRevenue: number;
  totalCustomers: number;
  totalRevenue: number;
  currency: string;
  lastUpdated: string;
}

export interface MRRCalculation {
  mrr: number;
  currency: string;
}

export interface RevenueData {
  totalRevenue: number;
  currency: string;
}
