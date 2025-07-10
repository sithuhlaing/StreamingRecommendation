// src/components/Dashboard/Dashboard.tsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Alert,
} from '@mui/material';
import { Add, TrendingUp, Campaign, AttachMoney } from '@mui/icons-material';
import { useQuery } from 'react-query';
import { campaignAPI } from '../../services/api';
import { Campaign } from '../../types';
import { formatCurrency, formatNumber } from '../../utils/formatters';
import PerformanceChart from './PerformanceChart';
import CampaignStatusChip from '../Common/CampaignStatusChip';

const Dashboard: React.FC = () => {
  const [selectedTimeRange, setSelectedTimeRange] = useState('7d');

  const { data: campaigns, isLoading, error } = useQuery(
    ['campaigns', selectedTimeRange],
    () => campaignAPI.getCampaigns({ limit: 10 }),
    { refetchInterval: 30000 } // Refresh every 30 seconds
  );

  const calculateTotals = (campaigns: Campaign[]) => {
    return campaigns.reduce(
      (acc, campaign) => ({
        totalSpend: acc.totalSpend + campaign.spend,
        totalImpressions: acc.totalImpressions + campaign.impressions_served,
        totalClicks: acc.totalClicks + campaign.clicks,
        totalConversions: acc.totalConversions + campaign.conversions,
      }),
      { totalSpend: 0, totalImpressions: 0, totalClicks: 0, totalConversions: 0 }
    );
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        Error loading dashboard data. Please try again.
      </Alert>
    );
  }

  const totals = calculateTotals(campaigns || []);
  const averageCTR = totals.totalImpressions > 0 
    ? (totals.totalClicks / totals.totalImpressions) * 100 
    : 0;

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Disney Streaming Ad Campaign Dashboard
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<Add />}
          onClick={() => window.location.href = '/campaigns/create'}
        >
          Create Campaign
        </Button>
      </Box>

      {/* KPI Cards */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={1}>
                <AttachMoney color="primary" />
                <Typography variant="h6" ml={1}>
                  Total Spend
                </Typography>
              </Box>
              <Typography variant="h4" color="primary">
                {formatCurrency(totals.totalSpend)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Across all active campaigns
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={1}>
                <TrendingUp color="success" />
                <Typography variant="h6" ml={1}>
                  Impressions
                </Typography>
              </Box>
              <Typography variant="h4" color="success.main">
                {formatNumber(totals.totalImpressions)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total ad impressions served
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={1}>
                <Campaign color="info" />
                <Typography variant="h6" ml={1}>
                  Clicks
                </Typography>
              </Box>
              <Typography variant="h4" color="info.main">
                {formatNumber(totals.totalClicks)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total clicks generated
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={1}>
                <TrendingUp color="warning" />
                <Typography variant="h6" ml={1}>
                  Avg CTR
                </Typography>
              </Box>
              <Typography variant="h4" color="warning.main">
                {averageCTR.toFixed(2)}%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Click-through rate
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Performance Chart */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" mb={2}>
                Performance Overview
              </Typography>
              <PerformanceChart campaigns={campaigns || []} />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Recent Campaigns Table */}
      <Card>
        <CardContent>
          <Typography variant="h6" mb={2}>
            Recent Campaigns
          </Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Campaign Name</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Budget</TableCell>
                  <TableCell align="right">Spend</TableCell>
                  <TableCell align="right">Impressions</TableCell>
                  <TableCell align="right">Clicks</TableCell>
                  <TableCell align="right">CTR</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {campaigns?.map((campaign) => {
                  const ctr = campaign.impressions_served > 0 
                    ? (campaign.clicks / campaign.impressions_served) * 100 
                    : 0;
                  
                  return (
                    <TableRow key={campaign.id}>
                      <TableCell>
                        <Typography variant="body2" fontWeight="bold">
                          {campaign.name}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <CampaignStatusChip status={campaign.status} />
                      </TableCell>
                      <TableCell align="right">
                        {formatCurrency(campaign.budget)}
                      </TableCell>
                      <TableCell align="right">
                        {formatCurrency(campaign.spend)}
                      </TableCell>
                      <TableCell align="right">
                        {formatNumber(campaign.impressions_served)}
                      </TableCell>
                      <TableCell align="right">
                        {formatNumber(campaign.clicks)}
                      </TableCell>
                      <TableCell align="right">
                        {ctr.toFixed(2)}%
                      </TableCell>
                      <TableCell>
                        <Button
                          size="small"
                          onClick={() => window.location.href = `/campaigns/${campaign.id}`}
                        >
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Dashboard;