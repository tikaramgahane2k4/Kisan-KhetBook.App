// Shared enums used across Dashboard and CropDetails
// Kept in a separate file so Vite HMR / React Fast Refresh works correctly
// (Fast Refresh requires files that export components to export ONLY components)

export const CropStatus = {
    ACTIVE: 'Active',
    COMPLETED: 'Completed',
};

export const ExpenseType = {
    LABOUR: 'Labour',
    TRACTOR: 'Tractor',
    THRESHING: 'Paddy Threshing',
    FERTILIZER: 'Fertilizer',
    SEEDS: 'Seeds',
    IRRIGATION: 'Water / Paani',
    OTHER: 'Other',
};
