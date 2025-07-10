// src/components/Common/CampaignStatusChip.tsx
import React from 'react';
import { Chip } from '@mui/material';
import { 
  PlayArrow, 
  Pause, 
  Stop, 
  Draft,
  CheckCircle 
} from '@mui/icons-material';

interface CampaignStatusChipProps {
  status: 'draft' | 'active' | 'paused' | 'completed';
  size?: 'small' | 'medium';
}

const CampaignStatusChip: React.FC<CampaignStatusChipProps> = ({ 
  status, 
  size = 'medium' 
}) => {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'active':
        return {
          label: 'Active',
          color: 'success' as const,
          icon: <PlayArrow />,
        };
      case 'paused':
        return {
          label: 'Paused',
          color: 'warning' as const,
          icon: <Pause />,
        };
      case 'completed':
        return {
          label: 'Completed',
          color: 'info' as const,
          icon: <CheckCircle />,
        };
      case 'draft':
        return {
          label: 'Draft',
          color: 'default' as const,
          icon: <Draft />,
        };
      default:
        return {
          label: 'Unknown',
          color: 'default' as const,
          icon: <Stop />,
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <Chip
      label={config.label}
      color={config.color}
      icon={config.icon}
      size={size}
      variant="filled"
    />
  );
};

export default CampaignStatusChip;