import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { licenseService } from '../../services';

export const useLicenseKeys = ({ page, pageSize, search, status, license_type }) => {
  return useQuery({
    queryKey: ['admin_license_keys', page, pageSize, search, status, license_type],
    queryFn: () => licenseService.listLicenseKeys({ 
      page, 
      pageSize, 
      search, 
      status, 
      license_type 
    }),
    keepPreviousData: true,
  });
};

export const useLicenseKeyDetail = (licenseKeyId) => {
  return useQuery({
    queryKey: ['admin_license_key_detail', licenseKeyId],
    queryFn: () => licenseService.getLicenseKey(licenseKeyId),
    enabled: !!licenseKeyId,
  });
};

export const useCreateLicenseKey = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (licenseData) => licenseService.createLicenseKey(licenseData),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin_license_keys']);
    },
  });
};

export const useRevokeLicenseKey = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ licenseKeyId, reason }) => licenseService.revokeLicenseKey(licenseKeyId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin_license_keys']);
      queryClient.invalidateQueries(['admin_license_key_detail']);
    },
  });
};
