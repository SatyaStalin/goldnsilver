import { mmtcAssets } from '../assets/images';

const baseDesc = (name, metal, weight) =>
  `This ${weight}g ${metal} product from MMTC-PAMP — ${name} — is crafted in ${
    metal === 'gold' ? '24K 999.9+' : '999.9+'
  } purity. Each piece arrives in tamper-evident packaging with insured delivery and full authenticity assurance from India’s most trusted precious metal brand.`;

export const MMTC_PRODUCTS = [
  {
    id: 'mmtc-vaishno-10',
    name: 'Shri Mata Vaishno Devi Silver Coin',
    displayName: '(999.9+) Purest 10 g Shri Mata Vaishno Devi Silver Coin',
    imageUrl: mmtcAssets.vaishno,
    gallery: [mmtcAssets.vaishno, mmtcAssets.hanuman, mmtcAssets.buddha, mmtcAssets.bouquet],
    weightGrams: 10,
    weightOptions: [10],
    metal: 'silver',
    price: 1450.0,
    mrp: 1680.0,
    category: ['Coins', 'Devotional'],
    sku: 'AGYyRVC10-01370',
    dimension: '32.0 x 32.0 x 2.00 mm',
    purity: '999.9',
    shape: 'Coin',
    denomination: 10,
    countryOfOrigin: 'India',
    importer: 'NA',
    description:
      'Shri Mata Vaishno Devi Silver Coin from MMTC-PAMP combines devotion with investment-grade purity. Ideal for gifting and daily worship, this coin is minted in 999.9 fine silver with Swiss refining excellence made in India.'
  },
  {
    id: 'mmtc-buddha-50',
    name: 'Lord Buddha 999.9 Fine Silver Bar',
    displayName: '(999.9+) Purest 50 g Lord Buddha Silver Bar',
    imageUrl: mmtcAssets.buddha,
    gallery: [mmtcAssets.buddha, mmtcAssets.hanuman, mmtcAssets.vaishno, mmtcAssets.bouquet],
    weightGrams: 50,
    weightOptions: [50],
    metal: 'silver',
    price: 7200.0,
    mrp: 8400.0,
    category: ['Bars', 'Devotional'],
    sku: 'AGYyRBB50-01375',
    dimension: '60.0 x 35.0 x 2.30 mm',
    purity: '999.9',
    shape: 'Rectangular Ingot',
    denomination: 50,
    countryOfOrigin: 'India',
    importer: 'NA',
    description:
      'The Lord Buddha Silver Bar is a serene collectible in 999.9 fine silver. Its rectangular ingot form and sacred imagery make it a meaningful gift and a solid store of value.'
  },
  {
    id: 'mmtc-bouquet-20',
    name: 'Floral Bouquet Silver Collectible',
    displayName: '(999.9+) Purest 20 g Floral Bouquet Silver Collectible',
    imageUrl: mmtcAssets.bouquet,
    gallery: [mmtcAssets.bouquet, mmtcAssets.vaishno, mmtcAssets.buddha, mmtcAssets.hanuman],
    weightGrams: 20,
    weightOptions: [20],
    metal: 'silver',
    price: 2890.0,
    mrp: 3350.0,
    category: ['Collectibles', 'Gifting'],
    sku: 'AGYyRFB20-01378',
    dimension: '45.0 x 30.0 x 2.10 mm',
    purity: '999.9',
    shape: 'Collectible',
    denomination: 20,
    countryOfOrigin: 'India',
    importer: 'NA',
    description:
      'A floral bouquet silver collectible from MMTC-PAMP — elegant, giftable, and minted in 999.9 purity with insured doorstep delivery.'
  },
  {
    id: 'mmtc-hanuman-50',
    name: 'Lord Hanuman Silver Bar',
    displayName: '(999.9+) Purest 50 g Lord Hanuman Silver Bar',
    imageUrl: mmtcAssets.hanuman,
    gallery: [mmtcAssets.hanuman, mmtcAssets.buddha, mmtcAssets.vaishno, mmtcAssets.bouquet],
    weightGrams: 50,
    weightOptions: [50],
    metal: 'silver',
    price: 14950.0,
    mrp: 17200.0,
    category: ['Bars', 'Devotional'],
    sku: 'AGYyRIG50-01381',
    dimension: '60.0 x 35.0 x 2.30 mm',
    purity: '999.9',
    shape: 'Rectangular Ingot',
    denomination: 50,
    countryOfOrigin: 'India',
    importer: 'NA',
    description:
      'Lord Hanuman is revered as a symbol of strength, devotion, courage, and unwavering faith. This silver bar is a powerful representation of divine protection and spiritual energy. Crafted in the purest 999.9 fine silver, this MMTC-PAMP Lord Hanuman Silver Bar combines sacred symbolism with investment-grade purity. Ideal for gifting, worship, or adding spiritual value to your precious metal collection.'
  },
  {
    id: 'mmtc-gold-bar-50',
    name: 'MMTC-PAMP 50g 24K 999.9 Fine Gold Bar',
    displayName: '(999.9+) Purest 50 g Fine Gold Bar',
    imageUrl: mmtcAssets.hero,
    gallery: [mmtcAssets.hero, mmtcAssets.hanuman, mmtcAssets.buddha, mmtcAssets.vaishno],
    weightGrams: 50,
    weightOptions: [50],
    metal: 'gold',
    price: 492500.0,
    mrp: 512000.0,
    category: ['Bars', 'Investment'],
    sku: 'AGYyGGB50-02001',
    dimension: '55.0 x 32.0 x 2.50 mm',
    purity: '999.9',
    shape: 'Rectangular Ingot',
    denomination: 50,
    countryOfOrigin: 'India',
    importer: 'NA',
    description: baseDesc('Fine Gold Bar', 'gold', 50)
  },
  {
    id: 'mmtc-gold-coin-10',
    name: 'MMTC-PAMP 10g 24K Gold Coin',
    displayName: '(999.9+) Purest 10 g Fine Gold Coin',
    imageUrl: mmtcAssets.hero,
    gallery: [mmtcAssets.hero, mmtcAssets.vaishno, mmtcAssets.bouquet, mmtcAssets.buddha],
    weightGrams: 10,
    weightOptions: [10],
    metal: 'gold',
    price: 98500.0,
    mrp: 102000.0,
    category: ['Coins', 'Investment'],
    sku: 'AGYyGGC10-02010',
    dimension: '24.0 x 24.0 x 1.80 mm',
    purity: '999.9',
    shape: 'Coin',
    denomination: 10,
    countryOfOrigin: 'India',
    importer: 'NA',
    description: baseDesc('Fine Gold Coin', 'gold', 10)
  },
  {
    id: 'mmtc-silver-bar-100',
    name: 'MMTC-PAMP 100g 999+ Fine Silver Bar',
    displayName: '(999.9+) Purest 100 g Fine Silver Bar',
    imageUrl: mmtcAssets.hero,
    gallery: [mmtcAssets.hero, mmtcAssets.hanuman, mmtcAssets.buddha, mmtcAssets.bouquet],
    weightGrams: 100,
    weightOptions: [100],
    metal: 'silver',
    price: 14200.0,
    mrp: 16500.0,
    category: ['Bars', 'Investment'],
    sku: 'AGYyRSB100-01390',
    dimension: '80.0 x 40.0 x 3.00 mm',
    purity: '999.9',
    shape: 'Rectangular Ingot',
    denomination: 100,
    countryOfOrigin: 'India',
    importer: 'NA',
    description: baseDesc('Fine Silver Bar', 'silver', 100)
  },
  {
    id: 'mmtc-ganesha-coin-5',
    name: 'MMTC-PAMP Ganesha Gold Coin',
    displayName: '(999.9+) Purest 5 g Ganesha Gold Coin',
    imageUrl: mmtcAssets.hero,
    gallery: [mmtcAssets.hero, mmtcAssets.vaishno, mmtcAssets.bouquet, mmtcAssets.hanuman],
    weightGrams: 5,
    weightOptions: [5],
    metal: 'gold',
    price: 49250.0,
    mrp: 52000.0,
    category: ['Coins', 'Devotional'],
    sku: 'AGYyGGC05-02015',
    dimension: '18.0 x 18.0 x 1.50 mm',
    purity: '999.9',
    shape: 'Coin',
    denomination: 5,
    countryOfOrigin: 'India',
    importer: 'NA',
    description: baseDesc('Ganesha Gold Coin', 'gold', 5)
  }
];

export function getMmtcProductById(id) {
  return MMTC_PRODUCTS.find((p) => p.id === id) || null;
}

export function getSimilarMmtcProducts(product, limit = 3) {
  if (!product) return [];
  return MMTC_PRODUCTS.filter((p) => p.id !== product.id && p.metal === product.metal).slice(0, limit);
}
