// src/hooks/useCampaigns.ts
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { campaignAPI } from '../services/api';
import { Campaign } from '../types';
import { useCallback } from 'react';

interface UseCampaignsOptions {
  skip?: number;
  limit?: number;
  status?: string;
  advertiser_id?: string;
}

export const useCampaigns = (options: UseCampaignsOptions = {}) => {
  const queryClient = useQueryClient();

  const campaignsQuery = useQuery(
    ['campaigns', options],
    () => campaignAPI.getCampaigns(options),
    {
      refetchInterval: 30000, // Refetch every 30 seconds
      staleTime: 10000, // Data is fresh for 10 seconds
    }
  );

  const createCampaignMutation = useMutation(
    (campaignData: Partial<Campaign>) => campaignAPI.createCampaign(campaignData),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('campaigns');
      },
    }
  );

  const updateCampaignStatusMutation = useMutation(
    ({ id, status }: { id: string; status: string }) =>
      campaignAPI.updateCampaignStatus(id, status),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('campaigns');
      },
    }
  );

  const createCampaign = useCallback(
    (campaignData: Partial<Campaign>) => {
      return createCampaignMutation.mutateAsync(campaignData);
    },
    [createCampaignMutation]
  );

  const updateCampaignStatus = useCallback(
    (id: string, status: string) => {
      return updateCampaignStatusMutation.mutateAsync({ id, status });
    },
    [updateCampaignStatusMutation]
  );

  return {
    campaigns: campaignsQuery.data || [],
    isLoading: campaignsQuery.isLoading,
    error: campaignsQuery.error,
    refetch: campaignsQuery.refetch,
    createCampaign,
    updateCampaignStatus,
    isCreating: createCampaignMutation.isLoading,
    isUpdating: updateCampaignStatusMutation.isLoading,
  };
};

export default useCampaigns;