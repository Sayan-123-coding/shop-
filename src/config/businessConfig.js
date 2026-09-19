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
  ],
  demoLocation: {
    addressLine1: "123 Demo Street, College More",
    addressLine2: "Hooghly, West Bengal 712001",
    mapsLink: "https://maps.google.com",
    mapEmbedUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d117925.33439927714!2d88.2649503!3d22.5354065!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39f882db4908f667%3A0x43e330e68f6c2cbc!2sKolkata%2C%20West%20Bengal!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
  }
};
