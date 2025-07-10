export interface Campaign {
  id: string;
  name: string;
  advertiser_id: string;
  start_date: string;
  end_date: string;
  budget: number;
  daily_budget?: number;
  status: 'draft' | 'active' | 'paused' | 'completed';
  impressions_served: number;
  clicks: number;
  conversions: number;
  spend: number;
  target_demographics?: Record<string, any>;
  target_content_types?: Record<string, any>;
  geographic_targeting?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface Advertiser {
  id: string;
  name: string;
  company_name: string;
  industry: string;
  contact_email: string;
  monthly_ad_spend: number;
  tier: 'premium' | 'standard' | 'basic';
  is_active: boolean;
}

export interface AdMetrics {
  id: string;
  campaign_id: string;
  date: string;
  impressions: number;
  clicks: number;
  conversions: number;
  spend: number;
  revenue: number;
  ctr: number;
  cpc: number;
  cpm: number;
  roas: number;
}

export interface CampaignPerformance {
  campaign_id: string;
  campaign_name: string;
  total_impressions: number;
  total_clicks: number;
  total_conversions: number;
  total_spend: number;
  total_revenue: number;
  calculated_metrics: {
    ctr_percent: number;
    cvr_percent: number;
    cpc: number;
    cpm: number;
    roas: number;
    cost_per_acquisition: number;
    profit: number;
    profit_margin_percent: number;
    risk_score: number;
    projected_monthly_revenue: number;
  };
  daily_metrics: Array<{
    date: string;
    impressions: number;
    clicks: number;
    conversions: number;
    spend: number;
    revenue: number;
  }>;
}