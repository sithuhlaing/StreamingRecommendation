// src/components/CampaignManager/CampaignForm.tsx
import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Alert,
  Chip,
  Autocomplete,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { campaignAPI, advertiserAPI } from '../../services/api';
import { Campaign } from '../../types';

const validationSchema = Yup.object({
  name: Yup.string()
    .required('Campaign name is required')
    .min(3, 'Campaign name must be at least 3 characters'),
  advertiser_id: Yup.string().required('Advertiser is required'),
  start_date: Yup.date()
    .required('Start date is required')
    .min(new Date(), 'Start date cannot be in the past'),
  end_date: Yup.date()
    .required('End date is required')
    .min(Yup.ref('start_date'), 'End date must be after start date'),
  budget: Yup.number()
    .required('Budget is required')
    .min(100, 'Budget must be at least $100')
    .max(10000000, 'Budget cannot exceed $10M'),
  daily_budget: Yup.number()
    .min(10, 'Daily budget must be at least $10')
    .test('daily-budget-check', 'Daily budget is too high for campaign duration', function(value) {
      const { start_date, end_date, budget } = this.parent;
      if (!value || !start_date || !end_date) return true;
      
      const days = Math.ceil((end_date - start_date) / (1000 * 60 * 60 * 24));
      return value * days <= budget;
    }),
});

const CONTENT_TYPES = [
  { value: 'movies', label: 'Movies' },
  { value: 'tv_shows', label: 'TV Shows' },
  { value: 'documentaries', label: 'Documentaries' },
  { value: 'sports', label: 'Sports' },
  { value: 'news', label: 'News' },
];

const DEMOGRAPHICS = [
  { value: '18-24', label: '18-24 years' },
  { value: '25-34', label: '25-34 years' },
  { value: '35-44', label: '35-44 years' },
  { value: '45-54', label: '45-54 years' },
  { value: '55+', label: '55+ years' },
];

const GEOGRAPHIC_REGIONS = [
  { value: 'us', label: 'United States' },
  { value: 'ca', label: 'Canada' },
  { value: 'uk', label: 'United Kingdom' },
  { value: 'au', label: 'Australia' },
  { value: 'de', label: 'Germany' },
  { value: 'fr', label: 'France' },
];

interface CampaignFormProps {
  campaign?: Campaign;
  onSuccess?: () => void;
}

const CampaignForm: React.FC<CampaignFormProps> = ({ campaign, onSuccess }) => {
  const [selectedContentTypes, setSelectedContentTypes] = useState<string[]>([]);
  const [selectedDemographics, setSelectedDemographics] = useState<string[]>([]);
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);
  
  const queryClient = useQueryClient();

  const { data: advertisers = [] } = useQuery(
    'advertisers',
    advertiserAPI.getAdvertisers
  );

  const createCampaignMutation = useMutation(
    (campaignData: Partial<Campaign>) => campaignAPI.createCampaign(campaignData),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('campaigns');
        onSuccess?.();
      },
    }
  );

  const formik = useFormik({
    initialValues: {
      name: campaign?.name || '',
      advertiser_id: campaign?.advertiser_id || '',
      start_date: campaign?.start_date ? new Date(campaign.start_date) : new Date(),
      end_date: campaign?.end_date ? new Date(campaign.end_date) : new Date(),
      budget: campaign?.budget || 0,
      daily_budget: campaign?.daily_budget || 0,
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        const campaignData = {
          ...values,
          target_content_types: selectedContentTypes.length > 0 ? { types: selectedContentTypes } : undefined,
          target_demographics: selectedDemographics.length > 0 ? { age_groups: selectedDemographics } : undefined,
          geographic_targeting: selectedRegions.length > 0 ? { regions: selectedRegions } : undefined,
        };

        await createCampaignMutation.mutateAsync(campaignData);
      } catch (error) {
        console.error('Campaign creation failed:', error);
      }
    },
  });

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
        <Card>
          <CardContent>
            <Typography variant="h5" mb={3}>
              {campaign ? 'Edit Campaign' : 'Create New Campaign'}
            </Typography>

            {createCampaignMutation.isError && (
              <Alert severity="error" sx={{ mb: 3 }}>
                Failed to create campaign. Please try again.
              </Alert>
            )}

            <form onSubmit={formik.handleSubmit}>
              <Grid container spacing={3}>
                {/* Basic Information */}
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    Basic Information
                  </Typography>
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Campaign Name"
                    name="name"
                    value={formik.values.name}
                    onChange={formik.handleChange}
                    error={formik.touched.name && Boolean(formik.errors.name)}
                    helperText={formik.touched.name && formik.errors.name}
                    placeholder="e.g., Disney+ Holiday Movie Marathon"
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <FormControl fullWidth error={formik.touched.advertiser_id && Boolean(formik.errors.advertiser_id)}>
                    <InputLabel>Advertiser</InputLabel>
                    <Select
                      name="advertiser_id"
                      value={formik.values.advertiser_id}
                      onChange={formik.handleChange}
                      label="Advertiser"
                    >
                      {advertisers.map((advertiser) => (
                        <MenuItem key={advertiser.id} value={advertiser.id}>
                          {advertiser.name} - {advertiser.company_name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                {/* Campaign Dates */}
                <Grid item xs={12} md={6}>
                  <DatePicker
                    label="Start Date"
                    value={formik.values.start_date}
                    onChange={(date) => formik.setFieldValue('start_date', date)}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        fullWidth
                        error={formik.touched.start_date && Boolean(formik.errors.start_date)}
                        helperText={formik.touched.start_date && formik.errors.start_date}
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <DatePicker
                    label="End Date"
                    value={formik.values.end_date}
                    onChange={(date) => formik.setFieldValue('end_date', date)}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        fullWidth
                        error={formik.touched.end_date && Boolean(formik.errors.end_date)}
                        helperText={formik.touched.end_date && formik.errors.end_date}
                      />
                    )}
                  />
                </Grid>

                {/* Budget */}
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    Budget Configuration
                  </Typography>
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Total Budget"
                    name="budget"
                    type="number"
                    value={formik.values.budget}
                    onChange={formik.handleChange}
                    error={formik.touched.budget && Boolean(formik.errors.budget)}
                    helperText={formik.touched.budget && formik.errors.budget}
                    InputProps={{
                      startAdornment: ',
                    }}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Daily Budget (Optional)"
                    name="daily_budget"
                    type="number"
                    value={formik.values.daily_budget}
                    onChange={formik.handleChange}
                    error={formik.touched.daily_budget && Boolean(formik.errors.daily_budget)}
                    helperText={formik.touched.daily_budget && formik.errors.daily_budget}
                    InputProps={{
                      startAdornment: ',
                    }}
                  />
                </Grid>

                {/* Targeting */}
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    Targeting Options
                  </Typography>
                </Grid>

                <Grid item xs={12} md={4}>
                  <Autocomplete
                    multiple
                    options={CONTENT_TYPES}
                    getOptionLabel={(option) => option.label}
                    value={CONTENT_TYPES.filter(ct => selectedContentTypes.includes(ct.value))}
                    onChange={(_, newValue) => {
                      setSelectedContentTypes(newValue.map(v => v.value));
                    }}
                    renderTags={(value, getTagProps) =>
                      value.map((option, index) => (
                        <Chip
                          variant="outlined"
                          label={option.label}
                          {...getTagProps({ index })}
                        />
                      ))
                    }
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Content Types"
                        placeholder="Select content types"
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <Autocomplete
                    multiple
                    options={DEMOGRAPHICS}
                    getOptionLabel={(option) => option.label}
                    value={DEMOGRAPHICS.filter(d => selectedDemographics.includes(d.value))}
                    onChange={(_, newValue) => {
                      setSelectedDemographics(newValue.map(v => v.value));
                    }}
                    renderTags={(value, getTagProps) =>
                      value.map((option, index) => (
                        <Chip
                          variant="outlined"
                          label={option.label}
                          {...getTagProps({ index })}
                        />
                      ))
                    }
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Demographics"
                        placeholder="Select age groups"
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <Autocomplete
                    multiple
                    options={GEOGRAPHIC_REGIONS}
                    getOptionLabel={(option) => option.label}
                    value={GEOGRAPHIC_REGIONS.filter(r => selectedRegions.includes(r.value))}
                    onChange={(_, newValue) => {
                      setSelectedRegions(newValue.map(v => v.value));
                    }}
                    renderTags={(value, getTagProps) =>
                      value.map((option, index) => (
                        <Chip
                          variant="outlined"
                          label={option.label}
                          {...getTagProps({ index })}
                        />
                      ))
                    }
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Geographic Regions"
                        placeholder="Select regions"
                      />
                    )}
                  />
                </Grid>

                {/* Submit Button */}
                <Grid item xs={12}>
                  <Box display="flex" justifyContent="flex-end" gap={2}>
                    <Button
                      variant="outlined"
                      onClick={() => window.history.back()}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="contained"
                      disabled={createCampaignMutation.isLoading}
                    >
                      {createCampaignMutation.isLoading ? 'Creating...' : 'Create Campaign'}
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </form>
          </CardContent>
        </Card>
      </Box>
    </LocalizationProvider>
  );
};

export default CampaignForm;