// src/components/Analytics/PerformanceChart.tsx
import React, { useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  Box,
  Card,
  CardContent,
  Typography,
  ToggleButton,
  ToggleButtonGroup,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
} from '@mui/material';
import { Campaign } from '../../types';

interface PerformanceChartProps {
  campaigns: Campaign[];
  height?: number;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const PerformanceChart: React.FC<PerformanceChartProps> = ({ 
  campaigns, 
  height = 400 
}) => {
  const [chartType, setChartType] = useState<'line' | 'bar' | 'pie'>('line');
  const [metric, setMetric] = useState('impressions');
  const [timeRange, setTimeRange] = useState('7d');

  // Transform campaign data for charts
  const chartData = campaigns.map((campaign, index) => ({
    name: campaign.name.substring(0, 20) + (campaign.name.length > 20 ? '...' : ''),
    impressions: campaign.impressions_served,
    clicks: campaign.clicks,
    conversions: campaign.conversions,
    spend: campaign.spend,
    ctr: campaign.impressions_served > 0 
      ? (campaign.clicks / campaign.impressions_served * 100).toFixed(2)
      : 0,
    cpc: campaign.clicks > 0 
      ? (campaign.spend / campaign.clicks).toFixed(2)
      : 0,
    status: campaign.status,
    fill: COLORS[index % COLORS.length],
  }));

  // Generate time series data (simulated)
  const generateTimeSeriesData = () => {
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
    const data = [];
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      data.push({
        date: date.toLocaleDateString(),
        impressions: Math.floor(Math.random() * 1000000) + 500000,
        clicks: Math.floor(Math.random() * 50000) + 10000,
        conversions: Math.floor(Math.random() * 5000) + 1000,
        spend: Math.floor(Math.random() * 10000) + 2000,
      });
    }
    
    return data;
  };

  const timeSeriesData = generateTimeSeriesData();

  const renderLineChart = () => (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={timeSeriesData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip formatter={(value, name) => [
          typeof value === 'number' ? value.toLocaleString() : value,
          name.charAt(0).toUpperCase() + name.slice(1)
        ]} />
        <Legend />
        <Line 
          type="monotone" 
          dataKey={metric} 
          stroke="#8884d8" 
          strokeWidth={2}
          dot={{ fill: '#8884d8', strokeWidth: 2, r: 4 }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );

  const renderBarChart = () => (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip formatter={(value, name) => [
          typeof value === 'number' ? value.toLocaleString() : value,
          name.charAt(0).toUpperCase() + name.slice(1)
        ]} />
        <Legend />
        <Bar dataKey={metric} fill="#8884d8" />
      </BarChart>
    </ResponsiveContainer>
  );

  const renderPieChart = () => (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, value }) => `${name}: ${value?.toLocaleString()}`}
          outerRadius={120}
          fill="#8884d8"
          dataKey={metric}
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(value) => [
          typeof value === 'number' ? value.toLocaleString() : value,
          metric.charAt(0).toUpperCase() + metric.slice(1)
        ]} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );

  const renderChart = () => {
    switch (chartType) {
      case 'line':
        return renderLineChart();
      case 'bar':
        return renderBarChart();
      case 'pie':
        return renderPieChart();
      default:
        return renderLineChart();
    }
  };

  return (
    <Card>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h6">
            Campaign Performance Analytics
          </Typography>
          
          <Box display="flex" gap={2}>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Metric</InputLabel>
              <Select
                value={metric}
                onChange={(e) => setMetric(e.target.value)}
                label="Metric"
              >
                <MenuItem value="impressions">Impressions</MenuItem>
                <MenuItem value="clicks">Clicks</MenuItem>
                <MenuItem value="conversions">Conversions</MenuItem>
                <MenuItem value="spend">Spend</MenuItem>
                <MenuItem value="ctr">CTR</MenuItem>
                <MenuItem value="cpc">CPC</MenuItem>
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 100 }}>
              <InputLabel>Period</InputLabel>
              <Select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                label="Period"
              >
                <MenuItem value="7d">7 Days</MenuItem>
                <MenuItem value="30d">30 Days</MenuItem>
                <MenuItem value="90d">90 Days</MenuItem>
              </Select>
            </FormControl>

            <ToggleButtonGroup
              value={chartType}
              exclusive
              onChange={(_, newType) => newType && setChartType(newType)}
              size="small"
            >
              <ToggleButton value="line">Line</ToggleButton>
              <ToggleButton value="bar">Bar</ToggleButton>
              <ToggleButton value="pie">Pie</ToggleButton>
            </ToggleButtonGroup>
          </Box>
        </Box>

        <Box sx={{ width: '100%', height: height }}>
          {renderChart()}
        </Box>

        {/* Performance Summary */}
        <Grid container spacing={2} mt={2}>
          <Grid item xs={12} md={3}>
            <Box textAlign="center">
              <Typography variant="h6" color="primary">
                {chartData.reduce((sum, item) => sum + (item.impressions || 0), 0).toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Impressions
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={3}>
            <Box textAlign="center">
              <Typography variant="h6" color="success.main">
                {chartData.reduce((sum, item) => sum + (item.clicks || 0), 0).toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Clicks
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={3}>
            <Box textAlign="center">
              <Typography variant="h6" color="info.main">
                {chartData.reduce((sum, item) => sum + (item.conversions || 0), 0).toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Conversions
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={3}>
            <Box textAlign="center">
              <Typography variant="h6" color="warning.main">
                ${chartData.reduce((sum, item) => sum + (item.spend || 0), 0).toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Spend
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default PerformanceChart;