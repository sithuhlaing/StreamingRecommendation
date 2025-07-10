// src/utils/analytics.ts
import { Campaign, AdMetrics, CampaignPerformance } from '../types';

export interface CalculatedMetrics {
  ctr: number;
  cvr: number;
  cpc: number;
  cpm: number;
  roas: number;
  costPerAcquisition: number;
  profit: number;
  profitMargin: number;
  impressionShare: number;
  qualityScore: number;
}

export interface TrendData {
  period: string;
  value: number;
  change: number;
  changePercent: number;
}

export const calculateMetrics = (
  impressions: number,
  clicks: number,
  conversions: number,
  spend: number,
  revenue: number = 0
): CalculatedMetrics => {
  const ctr = impressions > 0 ? (clicks / impressions) * 100 : 0;
  const cvr = clicks > 0 ? (conversions / clicks) * 100 : 0;
  const cpc = clicks > 0 ? spend / clicks : 0;
  const cpm = impressions > 0 ? (spend / impressions) * 1000 : 0;
  const roas = spend > 0 ? revenue / spend : 0;
  const costPerAcquisition = conversions > 0 ? spend / conversions : 0;
  const profit = revenue - spend;
  const profitMargin = revenue > 0 ? (profit / revenue) * 100 : 0;
  
  // Industry benchmarks for quality score calculation
  const benchmarks = {
    ctr: 2.5, // 2.5% average CTR
    cvr: 2.0, // 2% average CVR
    cpc: 1.0, // $1.00 average CPC
  };
  
  // Calculate quality score (0-10 scale)
  let qualityScore = 5; // Base score
  
  if (ctr > benchmarks.ctr) qualityScore += Math.min(2, (ctr - benchmarks.ctr) / benchmarks.ctr);
  if (ctr < benchmarks.ctr) qualityScore -= Math.min(2, (benchmarks.ctr - ctr) / benchmarks.ctr);
  
  if (cvr > benchmarks.cvr) qualityScore += Math.min(2, (cvr - benchmarks.cvr) / benchmarks.cvr);
  if (cvr < benchmarks.cvr) qualityScore -= Math.min(2, (benchmarks.cvr - cvr) / benchmarks.cvr);
  
  if (cpc < benchmarks.cpc) qualityScore += Math.min(1, (benchmarks.cpc - cpc) / benchmarks.cpc);
  if (cpc > benchmarks.cpc) qualityScore -= Math.min(1, (cpc - benchmarks.cpc) / benchmarks.cpc);
  
  qualityScore = Math.max(0, Math.min(10, qualityScore));
  
  // Impression share calculation (simulated based on performance)
  const impressionShare = Math.min(100, Math.max(10, 50 + (qualityScore - 5) * 8));
  
  return {
    ctr: Number(ctr.toFixed(2)),
    cvr: Number(cvr.toFixed(2)),
    cpc: Number(cpc.toFixed(2)),
    cpm: Number(cpm.toFixed(2)),
    roas: Number(roas.toFixed(2)),
    costPerAcquisition: Number(costPerAcquisition.toFixed(2)),
    profit: Number(profit.toFixed(2)),
    profitMargin: Number(profitMargin.toFixed(2)),
    impressionShare: Number(impressionShare.toFixed(1)),
    qualityScore: Number(qualityScore.toFixed(1)),
  };
};

export const calculateTrends = (
  data: Array<{ date: string; value: number }>,
  periods: number = 7
): TrendData[] => {
  if (data.length < 2) {
    return data.map(item => ({
      period: item.date,
      value: item.value,
      change: 0,
      changePercent: 0,
    }));
  }
  
  // Sort data by date
  const sortedData = [...data].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  
  return sortedData.map((item, index) => {
    if (index === 0) {
      return {
        period: item.date,
        value: item.value,
        change: 0,
        changePercent: 0,
      };
    }
    
    const previousValue = sortedData[index - 1].value;
    const change = item.value - previousValue;
    const changePercent = previousValue > 0 ? (change / previousValue) * 100 : 0;
    
    return {
      period: item.date,
      value: item.value,
      change: Number(change.toFixed(2)),
      changePercent: Number(changePercent.toFixed(2)),
    };
  });
};

export const calculateCampaignROI = (campaign: Campaign): number => {
  // Estimated revenue based on conversions (assuming $50 average order value)
  const estimatedRevenue = campaign.conversions * 50;
  const roi = campaign.spend > 0 ? ((estimatedRevenue - campaign.spend) / campaign.spend) * 100 : 0;
  return Number(roi.toFixed(2));
};

export const calculatePerformanceGrade = (metrics: CalculatedMetrics): string => {
  const score = (metrics.qualityScore / 10) * 100;
  
  if (score >= 90) return 'A+';
  if (score >= 85) return 'A';
  if (score >= 80) return 'A-';
  if (score >= 75) return 'B+';
  if (score >= 70) return 'B';
  if (score >= 65) return 'B-';
  if (score >= 60) return 'C+';
  if (score >= 55) return 'C';
  if (score >= 50) return 'C-';
  if (score >= 45) return 'D+';
  if (score >= 40) return 'D';
  return 'F';
};

export const calculateSeasonalityIndex = (
  monthlyData: Array<{ month: number; value: number }>
): Array<{ month: number; index: number }> => {
  const avgValue = monthlyData.reduce((sum, item) => sum + item.value, 0) / monthlyData.length;
  
  return monthlyData.map(item => ({
    month: item.month,
    index: Number((item.value / avgValue).toFixed(2)),
  }));
};

export const calculateAudienceOverlap = (
  audience1: string[],
  audience2: string[]
): number => {
  const set1 = new Set(audience1);
  const set2 = new Set(audience2);
  const intersection = new Set([...set1].filter(x => set2.has(x)));
  const union = new Set([...set1, ...set2]);
  
  return union.size > 0 ? (intersection.size / union.size) * 100 : 0;
};

export const calculateLifetimeValue = (
  averageOrderValue: number,
  purchaseFrequency: number,
  customerLifespan: number
): number => {
  return averageOrderValue * purchaseFrequency * customerLifespan;
};

export const calculateAttributionModel = (
  touchpoints: Array<{ channel: string; timestamp: string; value: number }>,
  model: 'first-click' | 'last-click' | 'linear' | 'time-decay' = 'linear'
): Array<{ channel: string; attribution: number }> => {
  const channels = [...new Set(touchpoints.map(t => t.channel))];
  
  switch (model) {
    case 'first-click':
      return channels.map(channel => ({
        channel,
        attribution: touchpoints[0]?.channel === channel ? 100 : 0,
      }));
      
    case 'last-click':
      const lastTouchpoint = touchpoints[touchpoints.length - 1];
      return channels.map(channel => ({
        channel,
        attribution: lastTouchpoint?.channel === channel ? 100 : 0,
      }));
      
    case 'linear':
      const equalWeight = 100 / touchpoints.length;
      return channels.map(channel => ({
        channel,
        attribution: touchpoints.filter(t => t.channel === channel).length * equalWeight,
      }));
      
    case 'time-decay':
      const totalWeight = touchpoints.reduce((sum, _, index) => sum + Math.pow(2, index), 0);
      return channels.map(channel => {
        const channelWeight = touchpoints
          .map((t, index) => t.channel === channel ? Math.pow(2, index) : 0)
          .reduce((sum, weight) => sum + weight, 0);
        return {
          channel,
          attribution: (channelWeight / totalWeight) * 100,
        };
      });
      
    default:
      return channels.map(channel => ({ channel, attribution: 0 }));
  }
};

export const calculateConfidenceInterval = (
  data: number[],
  confidenceLevel: number = 0.95
): { lower: number; upper: number; margin: number } => {
  if (data.length === 0) {
    return { lower: 0, upper: 0, margin: 0 };
  }
  
  const mean = data.reduce((sum, value) => sum + value, 0) / data.length;
  const variance = data.reduce((sum, value) => sum + Math.pow(value - mean, 2), 0) / (data.length - 1);
  const standardError = Math.sqrt(variance / data.length);
  
  // Approximate z-score for common confidence levels
  const zScores: { [key: number]: number } = {
    0.90: 1.645,
    0.95: 1.96,
    0.99: 2.576,
  };
  
  const zScore = zScores[confidenceLevel] || 1.96;
  const margin = zScore * standardError;
  
  return {
    lower: Number((mean - margin).toFixed(2)),
    upper: Number((mean + margin).toFixed(2)),
    margin: Number(margin.toFixed(2)),
  };
};

export const calculateCohortAnalysis = (
  users: Array<{ userId: string; acquisitionDate: string; events: Array<{ date: string; value: number }> }>,
  periods: number = 12
): Array<{ cohort: string; period: number; retention: number; revenue: number }> => {
  const cohorts: { [key: string]: any[] } = {};
  
  // Group users by acquisition month
  users.forEach(user => {
    const cohortKey = user.acquisitionDate.substring(0, 7); // YYYY-MM format
    if (!cohorts[cohortKey]) {
      cohorts[cohortKey] = [];
    }
    cohorts[cohortKey].push(user);
  });
  
  const results: Array<{ cohort: string; period: number; retention: number; revenue: number }> = [];
  
  Object.entries(cohorts).forEach(([cohortKey, cohortUsers]) => {
    for (let period = 0; period < periods; period++) {
      const cohortDate = new Date(cohortKey + '-01');
      const periodDate = new Date(cohortDate);
      periodDate.setMonth(periodDate.getMonth() + period);
      
      const activeUsers = cohortUsers.filter(user =>
        user.events.some(event => {
          const eventDate = new Date(event.date);
          return eventDate.getMonth() === periodDate.getMonth() &&
                 eventDate.getFullYear() === periodDate.getFullYear();
        })
      );
      
      const retention = (activeUsers.length / cohortUsers.length) * 100;
      const revenue = activeUsers.reduce((sum, user) => {
        const periodRevenue = user.events
          .filter(event => {
            const eventDate = new Date(event.date);
            return eventDate.getMonth() === periodDate.getMonth() &&
                   eventDate.getFullYear() === periodDate.getFullYear();
          })
          .reduce((eventSum, event) => eventSum + event.value, 0);
        return sum + periodRevenue;
      }, 0);
      
      results.push({
        cohort: cohortKey,
        period,
        retention: Number(retention.toFixed(2)),
        revenue: Number(revenue.toFixed(2)),
      });
    }
  });
  
  return results;
};