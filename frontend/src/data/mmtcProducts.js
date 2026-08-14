import { mmtcAssets } from '../assets/images';

const img = (n) => mmtcAssets[`p${n}`];

const product = (n, data) => ({
  ...data,
  imageUrl: img(n),
  gallery: [img(n)],
  metal: 'silver',
  dimension: 'N/A',
  purity: '999.9',
  countryOfOrigin: 'India',
  importer: 'NA'
});

/** Ordered to match attached files mmtc-1.png … mmtc-19.png */
export const MMTC_PRODUCTS = [
  product(1, {
    id: 'mmtc-buddha-50',
    name: 'Lord Buddha Silver Bar',
    displayName: '(999.9+) Purity 50 g Purest Lord Buddha Silver Bar',
    weightGrams: 50,
    weightOptions: [50],
    price: 14100.0,
    mrp: 14160.0,
    category: ['Bars', 'Devotional'],
    sku: 'MMTC-BUDDHA-50G',
    shape: 'Rectangular Ingot',
    denomination: 50,
    description:
      'MMTC-PAMP 999.9+ purest 50 g Lord Buddha silver bar featuring a devotional design, suitable for gifting, worship, and precious metal collection.'
  }),
  product(2, {
    id: 'mmtc-hanuman-50',
    name: 'Lord Hanuman Silver Bar',
    displayName: '(999.9+) Purest 50 g Lord Hanuman Silver Bar',
    weightGrams: 50,
    weightOptions: [50],
    price: 14910.0,
    mrp: 17760.0,
    category: ['Bars', 'Devotional'],
    sku: 'MMTC-HANUMAN-50G',
    shape: 'Rectangular Ingot',
    denomination: 50,
    description:
      'MMTC-PAMP 999.9+ purest 50 g Lord Hanuman silver bar featuring a devotional design and investment-grade silver purity.'
  }),
  product(3, {
    id: 'mmtc-bouquet-50',
    name: 'Bouquet of Flowers Silver Coin',
    displayName: '(999.9+) Purest 50 g Bouquet of Flower Silver Coin',
    weightGrams: 50,
    weightOptions: [50],
    price: 14060.0,
    mrp: 16470.0,
    category: ['Coins', 'Gifting'],
    sku: 'MMTC-BOUQUET-50G',
    shape: 'Coin',
    denomination: 50,
    description:
      'MMTC-PAMP 999.9+ purest 50 g bouquet of flowers silver coin, designed as an elegant gifting collectible.'
  }),
  product(4, {
    id: 'mmtc-vaishno-50',
    name: 'Vaishno Devi Silver Coin',
    displayName: '(999.9+) Purest 50 g Vaishno Devi Silver Coin',
    weightGrams: 50,
    weightOptions: [50],
    price: 13680.0,
    mrp: 15740.0,
    category: ['Coins', 'Devotional'],
    sku: 'MMTC-VAISHNO-50G',
    shape: 'Coin',
    denomination: 50,
    description:
      'MMTC-PAMP 999.9+ purest 50 g Vaishno Devi silver coin featuring a devotional design.'
  }),
  product(5, {
    id: 'mmtc-shiva-50',
    name: 'Lord Shiva Silver Bar',
    displayName: '(999.9+) Purest 50 g Lord Shiva Silver Bar',
    weightGrams: 50,
    weightOptions: [50],
    price: 13680.0,
    mrp: 15240.0,
    category: ['Bars', 'Devotional'],
    sku: 'MMTC-SHIVA-50G',
    shape: 'Rectangular Ingot',
    denomination: 50,
    description: 'MMTC-PAMP 999.9+ purest 50 g Lord Shiva silver bar with a devotional design.'
  }),
  product(6, {
    id: 'mmtc-banyan-bar-10',
    name: 'Banyan Tree Silver Bar',
    displayName: '(999.9+) Purest 10 g Banyan Tree Silver Bar',
    weightGrams: 10,
    weightOptions: [10],
    price: 3050.0,
    mrp: 3510.0,
    category: ['Bars', 'Collectibles'],
    sku: 'MMTC-BANYAN-BAR-10G',
    shape: 'Rectangular Ingot',
    denomination: 10,
    description: 'MMTC-PAMP 999.9+ purest 10 g Banyan Tree silver bar.'
  }),
  product(7, {
    id: 'mmtc-ganesh-laxmi-10',
    name: 'Ganesh Laxmi Silver Coin',
    displayName: '(999.9+) Purest 10 g Ganesh Laxmi Silver Coin',
    weightGrams: 10,
    weightOptions: [10],
    price: 3050.0,
    mrp: 3510.0,
    category: ['Coins', 'Devotional'],
    sku: 'MMTC-GANESH-LAXMI-10G',
    shape: 'Coin',
    denomination: 10,
    description:
      'MMTC-PAMP 999.9+ purest 10 g Ganesh Laxmi silver coin with a devotional design.'
  }),
  product(8, {
    id: 'mmtc-newborn-baby-20',
    name: 'Newborn Baby Silver Coin',
    displayName: '(999.9+) Purest 20 g Newborn Baby (Blue) Silver Coin',
    weightGrams: 20,
    weightOptions: [20],
    price: 6080.0,
    mrp: 7000.0,
    category: ['Coins', 'Gifting'],
    sku: 'MMTC-NEWBORN-20G',
    shape: 'Coin',
    denomination: 20,
    description:
      'MMTC-PAMP 999.9+ purest 20 g Newborn Baby silver coin, designed for gifting and special occasions.'
  }),
  product(9, {
    id: 'mmtc-ashta-laxmi-50',
    name: 'Ashta Laxmi Silver Coin',
    displayName: '(999.9+) Purest 50 g Ashta Laxmi Silver Coin',
    weightGrams: 50,
    weightOptions: [50],
    price: 13460.0,
    mrp: 15480.0,
    category: ['Coins', 'Devotional'],
    sku: 'MMTC-ASHTA-LAXMI-50G',
    shape: 'Coin',
    denomination: 50,
    description:
      'MMTC-PAMP 999.9+ purest 50 g Ashta Laxmi silver coin featuring a devotional design.'
  }),
  product(10, {
    id: 'mmtc-ganesha-colored-50',
    name: 'Ganesha Colored Silver Coin',
    displayName: '(999.9+) Purest 50 gm Ganesha Colored Silver Coin',
    weightGrams: 50,
    weightOptions: [50],
    price: 13460.0,
    mrp: 15480.0,
    category: ['Coins', 'Devotional', 'Collectibles'],
    sku: 'MMTC-GANESHA-COLORED-50G',
    shape: 'Coin',
    denomination: 50,
    description:
      'MMTC-PAMP 999.9+ purest 50 g Ganesha colored silver coin with a detailed devotional design.'
  }),
  product(11, {
    id: 'mmtc-laxmi-ganesha-colored-50',
    name: 'Laxmi Ganesha Colored Silver Bar',
    displayName: '(999.9+) Purest 50 g Stylized Laxmi Ganesha Colored Silver Bar',
    weightGrams: 50,
    weightOptions: [50],
    price: 13460.0,
    mrp: 45480.0,
    category: ['Bars', 'Devotional', 'Collectibles'],
    sku: 'MMTC-LAXMI-GANESHA-50G',
    shape: 'Rectangular Ingot',
    denomination: 50,
    description:
      'MMTC-PAMP 999.9+ purest 50 g Laxmi Ganesha colored silver bar with a devotional design.'
  }),
  product(12, {
    id: 'mmtc-guru-nanak-50',
    name: 'Guru Nanak Dev Colored Silver Bar',
    displayName: '(999.9+) Purest 50 g Guru Nanak Dev Colored Silver Bar',
    weightGrams: 50,
    weightOptions: [50],
    price: 13460.0,
    mrp: 45480.0,
    category: ['Bars', 'Devotional', 'Collectibles'],
    sku: 'MMTC-GURU-NANAK-50G',
    shape: 'Rectangular Ingot',
    denomination: 50,
    description: 'MMTC-PAMP 999.9+ purest 50 g Guru Nanak Dev colored silver bar.'
  }),
  product(13, {
    id: 'mmtc-balaji-50',
    name: 'Balaji Silver Bar',
    displayName: '(999.9+) Purest 50 g Balaji Silver Bar',
    weightGrams: 50,
    weightOptions: [50],
    price: 13460.0,
    mrp: 46480.0,
    category: ['Bars', 'Devotional'],
    sku: 'MMTC-BALAJI-50G',
    shape: 'Rectangular Ingot',
    denomination: 50,
    description: 'MMTC-PAMP 999.9+ purest 50 g Balaji silver bar with a devotional design.'
  }),
  product(14, {
    id: 'mmtc-laxmi-colored-20',
    name: 'Laxmi Colored Silver Bar',
    displayName: '(999.9+) Purest 20 g Laxmi Colored Silver Bar',
    weightGrams: 20,
    weightOptions: [20],
    price: 6080.0,
    mrp: 7000.0,
    category: ['Bars', 'Devotional', 'Collectibles'],
    sku: 'MMTC-LAXMI-COLORED-20G',
    shape: 'Rectangular Ingot',
    denomination: 20,
    description: 'MMTC-PAMP 999.9+ purest 20 g Laxmi colored silver bar.'
  }),
  product(15, {
    id: 'mmtc-shankha-ganesh-laxmi-set',
    name: 'Shankha Shapa Ganesh Laxmi Silver Coin Set',
    displayName: '(999.9+) Purest 50 g Shankha Shapa Ganesh Laxmi Coin Set of (25.0 gms x 2)',
    weightGrams: 50,
    weightOptions: [50],
    price: 13880.0,
    mrp: 45970.0,
    category: ['Coins', 'Devotional', 'Sets'],
    sku: 'MMTC-SHANKHA-GANESH-LAXMI-50G',
    shape: 'Coin Set',
    denomination: 50,
    description:
      'MMTC-PAMP 999.9+ purest silver coin set containing two 25 g Shankha Shapa Ganesh Laxmi coins.'
  }),
  product(16, {
    id: 'mmtc-maharishi-mahesh-yogi-31-10',
    name: 'Maharishi Mahesh Yogi Silver Coin',
    displayName: '(999.9+) Purest 31.10 g Maharishi Mahesh Yogi Silver Coin',
    weightGrams: 31.1,
    weightOptions: [31.1],
    price: 8940.0,
    mrp: 20290.0,
    category: ['Coins', 'Collectibles'],
    sku: 'MMTC-MAHARISHI-31-10G',
    shape: 'Coin',
    denomination: 31.1,
    description: 'MMTC-PAMP 999.9+ purest 31.10 g Maharishi Mahesh Yogi silver coin.'
  }),
  product(17, {
    id: 'mmtc-adi-shankaracharya-31-10',
    name: 'Adi Shankaracharya Silver Coin',
    displayName: '(999.9+) Purest 31.10 g Adi Shankaracharya Silver Coin',
    weightGrams: 31.1,
    weightOptions: [31.1],
    price: 8940.0,
    mrp: 20200.0,
    category: ['Coins', 'Devotional', 'Collectibles'],
    sku: 'MMTC-ADI-SHANKARACHARYA-31-10G',
    shape: 'Coin',
    denomination: 31.1,
    description: 'MMTC-PAMP 999.9+ purest 31.10 g Adi Shankaracharya silver coin.'
  }),
  product(18, {
    id: 'mmtc-swami-brahmananda-31-10',
    name: 'Swami Brahmananda Saraswati Silver Coin',
    displayName: '(999.9+) Purest 31.10 g Swami Brahmananda Saraswati Silver Coin',
    weightGrams: 31.1,
    weightOptions: [31.1],
    price: 8940.0,
    mrp: 20200.0,
    category: ['Coins', 'Devotional', 'Collectibles'],
    sku: 'MMTC-SWAMI-BRAHMANANDA-31-10G',
    shape: 'Coin',
    denomination: 31.1,
    description: 'MMTC-PAMP 999.9+ purest 31.10 g Swami Brahmananda Saraswati silver coin.'
  }),
  product(19, {
    id: 'mmtc-banyan-coin-5',
    name: 'Banyan Tree Silver Coin',
    displayName: '(999.9+) Purest 5 gm Banyan Tree Silver Coin',
    weightGrams: 5,
    weightOptions: [5],
    price: 1820.0,
    mrp: 2100.0,
    category: ['Coins', 'Collectibles'],
    sku: 'MMTC-BANYAN-COIN-5G',
    shape: 'Coin',
    denomination: 5,
    description: 'MMTC-PAMP 999.9+ purest 5 g Banyan Tree silver coin.'
  })
];

export function getMmtcProductById(id) {
  return MMTC_PRODUCTS.find((p) => p.id === id) || null;
}

export function getSimilarMmtcProducts(productItem, limit = 3) {
  if (!productItem) return [];
  return MMTC_PRODUCTS.filter((p) => p.id !== productItem.id && p.metal === productItem.metal).slice(
    0,
    limit
  );
}
