export const productConfig = {
  app: {
    displayName: "Gerbang Edukasi – IFP Apps",
    publisherName: "Gerbang Edukasi",
    productId: "ifp-learning"
  },
  platform: {
    windowsIdentifier: "id.gerbangedukasi.ifp",
    androidApplicationId: "id.gerbangedukasi.ifp"
  },
  licensing: {
    productId: "ifp-learning"
  }
} as const;

export type ProductConfig = typeof productConfig;
