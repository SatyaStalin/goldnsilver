import { mmtcAssets } from '../assets/images';

const baseDesc = (name, metal, weight) =>
  `This ${weight}g ${metal} product from MMTC-PAMP — ${name} — is crafted in ${
    metal === 'gold' ? '24K 999.9+' : '999.9+'
  } purity. Each piece arrives in tamper-evident packaging with insured delivery and full authenticity assurance from India’s most trusted precious metal brand.`;

  export const MMTC_PRODUCTS = [
    {
      id: 'mmtc-buddha-50',
      name: 'Lord Buddha Silver Bar',
      displayName: '(999.9+) Purest 50 g Lord Buddha Silver Bar',
      imageUrl: mmtcAssets.buddha,
      gallery: [mmtcAssets.buddha],
      weightGrams: 50,
      weightOptions: [50],
      metal: 'silver',
      price: 14100.0,
      mrp: 14160.0,
      category: ['Bars', 'Devotional'],
      sku: 'MMTC-BUDDHA-50G',
      dimension: 'N/A',
      purity: '999.9',
      shape: 'Rectangular Ingot',
      denomination: 50,
      countryOfOrigin: 'India',
      importer: 'NA',
      description:
        'MMTC-PAMP 999.9+ purest 50 g Lord Buddha silver bar featuring a devotional design, suitable for gifting, worship, and precious metal collection.'
    },
  
    {
      id: 'mmtc-hanuman-50',
      name: 'Lord Hanuman Silver Bar',
      displayName: '(999.9+) Purest 50 g Lord Hanuman Silver Bar',
      imageUrl: mmtcAssets.hanuman,
      gallery: [mmtcAssets.hanuman],
      weightGrams: 50,
      weightOptions: [50],
      metal: 'silver',
      price: 14910.0,
      mrp: 17760.0,
      category: ['Bars', 'Devotional'],
      sku: 'MMTC-HANUMAN-50G',
      dimension: 'N/A',
      purity: '999.9',
      shape: 'Rectangular Ingot',
      denomination: 50,
      countryOfOrigin: 'India',
      importer: 'NA',
      description:
        'MMTC-PAMP 999.9+ purest 50 g Lord Hanuman silver bar featuring a devotional design and investment-grade silver purity.'
    },
  
    {
      id: 'mmtc-bouquet-50',
      name: 'Bouquet of Flowers Silver Coin',
      displayName: '(999.9+) Purest 50 g Bouquet of Flower Silver Coin',
      imageUrl: mmtcAssets.bouquet,
      gallery: [mmtcAssets.bouquet],
      weightGrams: 50,
      weightOptions: [50],
      metal: 'silver',
      price: 14000.0,
      mrp: 16470.0,
      category: ['Coins', 'Gifting'],
      sku: 'MMTC-BOUQUET-50G',
      dimension: 'N/A',
      purity: '999.9',
      shape: 'Coin',
      denomination: 50,
      countryOfOrigin: 'India',
      importer: 'NA',
      description:
        'MMTC-PAMP 999.9+ purest 50 g bouquet of flowers silver coin, designed as an elegant gifting collectible.'
    },
  
    {
      id: 'mmtc-vaishno-50',
      name: 'Vaishno Devi Silver Coin',
      displayName: '(999.9+) Purest 50 g Vaishno Devi Silver Coin',
      imageUrl: mmtcAssets.vaishno,
      gallery: [mmtcAssets.vaishno],
      weightGrams: 50,
      weightOptions: [50],
      metal: 'silver',
      price: 13680.0,
      mrp: 15740.0,
      category: ['Coins', 'Devotional'],
      sku: 'MMTC-VAISHNO-50G',
      dimension: 'N/A',
      purity: '999.9',
      shape: 'Coin',
      denomination: 50,
      countryOfOrigin: 'India',
      importer: 'NA',
      description:
        'MMTC-PAMP 999.9+ purest 50 g Vaishno Devi silver coin featuring a devotional design.'
    },
  
    {
      id: 'mmtc-shiva-50',
      name: 'Lord Shiva Silver Bar',
      displayName: '(999.9+) Purest 50 g Lord Shiva Silver Bar',
      imageUrl: mmtcAssets.shiva,
      gallery: [mmtcAssets.shiva],
      weightGrams: 50,
      weightOptions: [50],
      metal: 'silver',
      price: 13680.0,
      mrp: 15240.0,
      category: ['Bars', 'Devotional'],
      sku: 'MMTC-SHIVA-50G',
      dimension: 'N/A',
      purity: '999.9',
      shape: 'Rectangular Ingot',
      denomination: 50,
      countryOfOrigin: 'India',
      importer: 'NA',
      description:
        'MMTC-PAMP 999.9+ purest 50 g Lord Shiva silver bar with a devotional design.'
    },
  
    {
      id: 'mmtc-banyan-bar-10',
      name: 'Banyan Tree Silver Bar',
      displayName: '(999.9+) Purest 10 g Banyan Tree Silver Bar',
      imageUrl: mmtcAssets.banyanTree,
      gallery: [mmtcAssets.banyanTree],
      weightGrams: 10,
      weightOptions: [10],
      metal: 'silver',
      price: 3050.0,
      mrp: 3510.0,
      category: ['Bars', 'Collectibles'],
      sku: 'MMTC-BANYAN-BAR-10G',
      dimension: 'N/A',
      purity: '999.9',
      shape: 'Rectangular Ingot',
      denomination: 10,
      countryOfOrigin: 'India',
      importer: 'NA',
      description:
        'MMTC-PAMP 999.9+ purest 10 g Banyan Tree silver bar.'
    },
  
    {
      id: 'mmtc-ganesh-laxmi-10',
      name: 'Ganesh Laxmi Silver Coin',
      displayName: '(999.9+) Purest 10 g Ganesh Laxmi Silver Coin',
      imageUrl: mmtcAssets.ganeshLaxmi,
      gallery: [mmtcAssets.ganeshLaxmi],
      weightGrams: 10,
      weightOptions: [10],
      metal: 'silver',
      price: 3050.0,
      mrp: 3510.0,
      category: ['Coins', 'Devotional'],
      sku: 'MMTC-GANESH-LAXMI-10G',
      dimension: 'N/A',
      purity: '999.9',
      shape: 'Coin',
      denomination: 10,
      countryOfOrigin: 'India',
      importer: 'NA',
      description:
        'MMTC-PAMP 999.9+ purest 10 g Ganesh Laxmi silver coin with a devotional design.'
    },
  
    {
      id: 'mmtc-newborn-baby-20',
      name: 'Newborn Baby Silver Coin',
      displayName: '(999.9+) Purest 20 g Newborn Baby (Blue) Silver Coin',
      imageUrl: mmtcAssets.newbornBaby,
      gallery: [mmtcAssets.newbornBaby],
      weightGrams: 20,
      weightOptions: [20],
      metal: 'silver',
      price: 6080.0,
      mrp: 7000.0,
      category: ['Coins', 'Gifting'],
      sku: 'MMTC-NEWBORN-20G',
      dimension: 'N/A',
      purity: '999.9',
      shape: 'Coin',
      denomination: 20,
      countryOfOrigin: 'India',
      importer: 'NA',
      description:
        'MMTC-PAMP 999.9+ purest 20 g Newborn Baby silver coin, designed for gifting and special occasions.'
    },
  
    {
      id: 'mmtc-ashta-laxmi-50',
      name: 'Ashta Laxmi Silver Coin',
      displayName: '(999.9+) Purest 50 g Ashta Laxmi Silver Coin',
      imageUrl: mmtcAssets.ashtaLaxmi,
      gallery: [mmtcAssets.ashtaLaxmi],
      weightGrams: 50,
      weightOptions: [50],
      metal: 'silver',
      price: 13460.0,
      mrp: 15480.0,
      category: ['Coins', 'Devotional'],
      sku: 'MMTC-ASHTA-LAXMI-50G',
      dimension: 'N/A',
      purity: '999.9',
      shape: 'Coin',
      denomination: 50,
      countryOfOrigin: 'India',
      importer: 'NA',
      description:
        'MMTC-PAMP 999.9+ purest 50 g Ashta Laxmi silver coin featuring a devotional design.'
    },
  
    {
      id: 'mmtc-ganesha-colored-50',
      name: 'Ganesha Colored Silver Coin',
      displayName: '(999.9+) Purest 50 gm Ganesha Colored Silver Coin',
      imageUrl: mmtcAssets.ganeshaColored,
      gallery: [mmtcAssets.ganeshaColored],
      weightGrams: 50,
      weightOptions: [50],
      metal: 'silver',
      price: 13460.0,
      mrp: 15480.0,
      category: ['Coins', 'Devotional', 'Collectibles'],
      sku: 'MMTC-GANESHA-COLORED-50G',
      dimension: 'N/A',
      purity: '999.9',
      shape: 'Coin',
      denomination: 50,
      countryOfOrigin: 'India',
      importer: 'NA',
      description:
        'MMTC-PAMP 999.9+ purest 50 g Ganesha colored silver coin with a detailed devotional design.'
    },
  
    {
      id: 'mmtc-laxmi-ganesha-colored-50',
      name: 'Laxmi Ganesha Colored Silver Bar',
      displayName: '(999.9+) Purest 50 g Splendid Laxmi Ganesha Colored Silver Bar',
      imageUrl: mmtcAssets.laxmiGaneshaColored,
      gallery: [mmtcAssets.laxmiGaneshaColored],
      weightGrams: 50,
      weightOptions: [50],
      metal: 'silver',
      price: 15460.0,
      mrp: 45480.0,
      category: ['Bars', 'Devotional', 'Collectibles'],
      sku: 'MMTC-LAXMI-GANESHA-50G',
      dimension: 'N/A',
      purity: '999.9',
      shape: 'Rectangular Ingot',
      denomination: 50,
      countryOfOrigin: 'India',
      importer: 'NA',
      description:
        'MMTC-PAMP 999.9+ purest 50 g Laxmi Ganesha colored silver bar with a devotional design.'
    },
  
    {
      id: 'mmtc-guru-nanak-50',
      name: 'Guru Nanak Dev Colored Silver Coin',
      displayName: '(999.9+) Purest 50 g Guru Nanak Dev Colored Silver Coin',
      imageUrl: mmtcAssets.guruNanak,
      gallery: [mmtcAssets.guruNanak],
      weightGrams: 50,
      weightOptions: [50],
      metal: 'silver',
      price: 15460.0,
      mrp: 45480.0,
      category: ['Coins', 'Devotional', 'Collectibles'],
      sku: 'MMTC-GURU-NANAK-50G',
      dimension: 'N/A',
      purity: '999.9',
      shape: 'Coin',
      denomination: 50,
      countryOfOrigin: 'India',
      importer: 'NA',
      description:
        'MMTC-PAMP 999.9+ purest 50 g Guru Nanak Dev colored silver coin.'
    },
  
    {
      id: 'mmtc-balaji-50',
      name: 'Balaji Silver Bar',
      displayName: '(999.9+) Purest 50 g Balaji Silver Bar',
      imageUrl: mmtcAssets.balaji,
      gallery: [mmtcAssets.balaji],
      weightGrams: 50,
      weightOptions: [50],
      metal: 'silver',
      price: 13460.0,
      mrp: 46480.0,
      category: ['Bars', 'Devotional'],
      sku: 'MMTC-BALAJI-50G',
      dimension: 'N/A',
      purity: '999.9',
      shape: 'Rectangular Ingot',
      denomination: 50,
      countryOfOrigin: 'India',
      importer: 'NA',
      description:
        'MMTC-PAMP 999.9+ purest 50 g Balaji silver bar with a devotional design.'
    },
  
    {
      id: 'mmtc-laxmi-colored-20',
      name: 'Laxmi Colored Silver Bar',
      displayName: '(999.9+) Purest 20 g Laxmi Colored Silver Bar',
      imageUrl: mmtcAssets.laxmiColored,
      gallery: [mmtcAssets.laxmiColored],
      weightGrams: 20,
      weightOptions: [20],
      metal: 'silver',
      price: 6080.0,
      mrp: 7000.0,
      category: ['Bars', 'Devotional', 'Collectibles'],
      sku: 'MMTC-LAXMI-COLORED-20G',
      dimension: 'N/A',
      purity: '999.9',
      shape: 'Rectangular Ingot',
      denomination: 20,
      countryOfOrigin: 'India',
      importer: 'NA',
      description:
        'MMTC-PAMP 999.9+ purest 20 g Laxmi colored silver bar.'
    },
  
    {
      id: 'mmtc-shankha-ganesh-laxmi-set',
      name: 'Shankha Shapa Ganesh Laxmi Silver Coin Set',
      displayName:
        '(999.9+) Purest 50 g Shankha Shapa Ganesh Laxmi Coin Set of (25.0 gms x 2)',
      imageUrl: mmtcAssets.shankhaGaneshLaxmi,
      gallery: [mmtcAssets.shankhaGaneshLaxmi],
      weightGrams: 50,
      weightOptions: [50],
      metal: 'silver',
      price: 15480.0,
      mrp: 45970.0,
      category: ['Coins', 'Devotional', 'Sets'],
      sku: 'MMTC-SHANKHA-GANESH-LAXMI-50G',
      dimension: 'N/A',
      purity: '999.9',
      shape: 'Coin Set',
      denomination: 50,
      countryOfOrigin: 'India',
      importer: 'NA',
      description:
        'MMTC-PAMP 999.9+ purest silver coin set containing two 25 g Shankha Shapa Ganesh Laxmi coins.'
    },
  
    {
      id: 'mmtc-maharishi-mahesh-yogi-31-10',
      name: 'Maharishi Mahesh Yogi Silver Coin',
      displayName: '(999.9+) Purest 31.10 g Maharishi Mahesh Yogi Silver Coin',
      imageUrl: mmtcAssets.maharishiMaheshYogi,
      gallery: [mmtcAssets.maharishiMaheshYogi],
      weightGrams: 31.1,
      weightOptions: [31.1],
      metal: 'silver',
      price: 8940.0,
      mrp: 20290.0,
      category: ['Coins', 'Collectibles'],
      sku: 'MMTC-MAHARISHI-31-10G',
      dimension: 'N/A',
      purity: '999.9',
      shape: 'Coin',
      denomination: 31.1,
      countryOfOrigin: 'India',
      importer: 'NA',
      description:
        'MMTC-PAMP 999.9+ purest 31.10 g Maharishi Mahesh Yogi silver coin.'
    },
  
    {
      id: 'mmtc-adi-shankaracharya-31-10',
      name: 'Adi Shankaracharya Silver Coin',
      displayName: '(999.9+) Purest 31.10 g Adi Shankaracharya Silver Coin',
      imageUrl: mmtcAssets.adiShankaracharya,
      gallery: [mmtcAssets.adiShankaracharya],
      weightGrams: 31.1,
      weightOptions: [31.1],
      metal: 'silver',
      price: 8940.0,
      mrp: 20200.0,
      category: ['Coins', 'Devotional', 'Collectibles'],
      sku: 'MMTC-ADI-SHANKARACHARYA-31-10G',
      dimension: 'N/A',
      purity: '999.9',
      shape: 'Coin',
      denomination: 31.1,
      countryOfOrigin: 'India',
      importer: 'NA',
      description:
        'MMTC-PAMP 999.9+ purest 31.10 g Adi Shankaracharya silver coin.'
    },
  
    {
      id: 'mmtc-swami-brahmananda-31-10',
      name: 'Swami Brahmananda Saraswati Silver Coin',
      displayName:
        '(999.9+) Purest 31.10 g Swami Brahmananda Saraswati Silver Coin',
      imageUrl: mmtcAssets.swamiBrahmananda,
      gallery: [mmtcAssets.swamiBrahmananda],
      weightGrams: 31.1,
      weightOptions: [31.1],
      metal: 'silver',
      price: 8940.0,
      mrp: 20200.0,
      category: ['Coins', 'Devotional', 'Collectibles'],
      sku: 'MMTC-SWAMI-BRAHMANANDA-31-10G',
      dimension: 'N/A',
      purity: '999.9',
      shape: 'Coin',
      denomination: 31.1,
      countryOfOrigin: 'India',
      importer: 'NA',
      description:
        'MMTC-PAMP 999.9+ purest 31.10 g Swami Brahmananda Saraswati silver coin.'
    },
  
    {
      id: 'mmtc-banyan-coin-5',
      name: 'Banyan Tree Silver Coin',
      displayName: '(999.9+) Purest 5 gm Banyan Tree Silver Coin',
      imageUrl: mmtcAssets.banyanCoin,
      gallery: [mmtcAssets.banyanCoin],
      weightGrams: 5,
      weightOptions: [5],
      metal: 'silver',
      price: 1820.0,
      mrp: 2100.0,
      category: ['Coins', 'Collectibles'],
      sku: 'MMTC-BANYAN-COIN-5G',
      dimension: 'N/A',
      purity: '999.9',
      shape: 'Coin',
      denomination: 5,
      countryOfOrigin: 'India',
      importer: 'NA',
      description:
        'MMTC-PAMP 999.9+ purest 5 g Banyan Tree silver coin.'
    }
  ];

export function getMmtcProductById(id) {
  return MMTC_PRODUCTS.find((p) => p.id === id) || null;
}

export function getSimilarMmtcProducts(product, limit = 3) {
  if (!product) return [];
  return MMTC_PRODUCTS.filter((p) => p.id !== product.id && p.metal === product.metal).slice(0, limit);
}
