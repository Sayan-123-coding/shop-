import { labels } from './labels';

export const businessConfig = {
  businessType: "shoes",
  labels,
  pricing: {
    mode: "fixed",
    showPrice: true,
    currency: "USD", // Default currency
  },
  fields: [
    "brand",
    "size",
    "colour",
    "material",
    "gender"
  ]
};
