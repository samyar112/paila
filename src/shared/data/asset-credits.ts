export interface AssetCredit {
  assetDescription: string;
  photographer: string;
  source: string;
  sourceUrl: string;
  license: string;
  licenseUrl: string;
  attributionRequired: boolean;
}

// Credits for all bundled image assets.
// Add an entry here for every image added to assets/images/.
// This data is displayed in the in-app Acknowledgements screen.
export const ASSET_CREDITS: AssetCredit[] = [
  // Trail map
  {
    assetDescription: 'Everest region satellite image',
    photographer: 'ISS Expedition 66 crew',
    source: 'NASA Earth Observatory',
    sourceUrl: 'https://earthobservatory.nasa.gov/images/149632/close-up-of-mount-everest',
    license: 'Public Domain (US Government)',
    licenseUrl: 'https://earthobservatory.nasa.gov/image-use-policy',
    attributionRequired: false,
  },
  // Milestone photos (all Unsplash License — no attribution required)
  { assetDescription: 'Lukla', photographer: 'Unsplash', source: 'Unsplash', sourceUrl: 'https://unsplash.com/photos/photo-1544735716-392fe2489ffa', license: 'Unsplash License', licenseUrl: 'https://unsplash.com/license', attributionRequired: false },
  { assetDescription: 'Phakding', photographer: 'Unsplash', source: 'Unsplash', sourceUrl: 'https://unsplash.com/photos/photo-1590523278191-995cbcda646b', license: 'Unsplash License', licenseUrl: 'https://unsplash.com/license', attributionRequired: false },
  { assetDescription: 'Namche Bazaar', photographer: 'Unsplash', source: 'Unsplash', sourceUrl: 'https://unsplash.com/photos/6F-uGWod7Xk', license: 'Unsplash License', licenseUrl: 'https://unsplash.com/license', attributionRequired: false },
  { assetDescription: 'Tengboche', photographer: 'Unsplash', source: 'Unsplash', sourceUrl: 'https://unsplash.com/photos/photo-1585409677983-0f6c41ca9c3b', license: 'Unsplash License', licenseUrl: 'https://unsplash.com/license', attributionRequired: false },
  { assetDescription: 'Dingboche', photographer: 'Unsplash', source: 'Unsplash', sourceUrl: 'https://unsplash.com/photos/photo-1486911278844-a81c5267e227', license: 'Unsplash License', licenseUrl: 'https://unsplash.com/license', attributionRequired: false },
  { assetDescription: 'Lobuche', photographer: 'Unsplash', source: 'Unsplash', sourceUrl: 'https://unsplash.com/photos/photo-1464822759023-fed622ff2c3b', license: 'Unsplash License', licenseUrl: 'https://unsplash.com/license', attributionRequired: false },
  { assetDescription: 'Gorak Shep', photographer: 'Unsplash', source: 'Unsplash', sourceUrl: 'https://unsplash.com/photos/photo-1454496522488-7a8e488e8606', license: 'Unsplash License', licenseUrl: 'https://unsplash.com/license', attributionRequired: false },
  { assetDescription: 'Everest Base Camp', photographer: 'Unsplash', source: 'Unsplash', sourceUrl: 'https://unsplash.com/photos/photo-1576085898323-218337e3e43c', license: 'Unsplash License', licenseUrl: 'https://unsplash.com/license', attributionRequired: false },
  { assetDescription: 'Camp 1 — Khumbu Icefall', photographer: 'Unsplash', source: 'Unsplash', sourceUrl: 'https://unsplash.com/photos/photo-1484591974057-265bb767ef71', license: 'Unsplash License', licenseUrl: 'https://unsplash.com/license', attributionRequired: false },
  { assetDescription: 'Camp 2 — Western Cwm', photographer: 'Unsplash', source: 'Unsplash', sourceUrl: 'https://unsplash.com/photos/photo-1519681393784-d120267933ba', license: 'Unsplash License', licenseUrl: 'https://unsplash.com/license', attributionRequired: false },
  { assetDescription: 'Camp 3 — Lhotse Face', photographer: 'Unsplash', source: 'Unsplash', sourceUrl: 'https://unsplash.com/photos/photo-1491002052546-bf38f186af56', license: 'Unsplash License', licenseUrl: 'https://unsplash.com/license', attributionRequired: false },
  { assetDescription: 'Camp 4 — South Col', photographer: 'Unsplash', source: 'Unsplash', sourceUrl: 'https://unsplash.com/photos/photo-1434394354979-a235cd36269d', license: 'Unsplash License', licenseUrl: 'https://unsplash.com/license', attributionRequired: false },
  { assetDescription: 'The Summit', photographer: 'Unsplash', source: 'Unsplash', sourceUrl: 'https://unsplash.com/photos/photo-1486870591958-9b9d0d1dda99', license: 'Unsplash License', licenseUrl: 'https://unsplash.com/license', attributionRequired: false },
  { assetDescription: 'Base Camp Return', photographer: 'Unsplash', source: 'Unsplash', sourceUrl: 'https://unsplash.com/photos/photo-1506905925346-21bda4d32df4', license: 'Unsplash License', licenseUrl: 'https://unsplash.com/license', attributionRequired: false },
  { assetDescription: 'Lukla Return', photographer: 'Unsplash', source: 'Unsplash', sourceUrl: 'https://unsplash.com/photos/photo-1551632811-561732d1e306', license: 'Unsplash License', licenseUrl: 'https://unsplash.com/license', attributionRequired: false },
  { assetDescription: 'Kathmandu', photographer: 'Unsplash', source: 'Unsplash', sourceUrl: 'https://unsplash.com/photos/photo-1558799401-1dcba79834c2', license: 'Unsplash License', licenseUrl: 'https://unsplash.com/license', attributionRequired: false },
  // Airplane intro
  { assetDescription: 'Aerial mountain view', photographer: 'Unsplash', source: 'Unsplash', sourceUrl: 'https://unsplash.com/photos/photo-1464037866556-6812c9d1c72e', license: 'Unsplash License', licenseUrl: 'https://unsplash.com/license', attributionRequired: false },
];
