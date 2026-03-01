export interface InstallmentCardProps {
  allowInstallments: boolean;
  onAllowInstallmentsChange: (value: boolean) => void;
  minimumInstallmentAmount: string;
  onMinimumInstallmentAmountChange: (value: string) => void;
  minimumInstallmentAmountError?: string;
  minimumSaleAmount: string;
  installmentCount: string;
  onInstallmentCountChange: (value: string) => void;
  installmentCountError?: string;
  globalIntervalDays: string;
  onGlobalIntervalDaysChange: (value: string) => void;
  useIndividualIntervals: boolean;
  onUseIndividualIntervalsChange: (value: boolean) => void;
  installmentPercentages: string[];
  onInstallmentPercentageChange: (index: number, value: string) => void;
  installmentIntervals: string[];
  onInstallmentIntervalChange: (index: number, value: string) => void;
  percentagesError?: string;
  installmentValueError?: string;
}
