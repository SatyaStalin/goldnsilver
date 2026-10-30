const Product = require('../models/Product');

const STOCK = 25;

function row(sortOrder, imageNo, data) {
  const tags = data.tags;
  const isCoin = tags.includes('Coins') || tags.includes('Sets');
  return {
    sortOrder,
    name: data.name,
    slug: data.slug,
    displayName: data.displayName,
    catalog: 'mmtc-pamp',
    metal: 'silver',
    type: isCoin ? 'physical_coin' : 'physical_bar',
    category: tags.join(', '),
    tags,
    description: data.description,
    pricePerUnit: data.price,
    mrp: data.mrp,
    pricingMode: 'fixed',
    metalGrams: data.weightGrams,
    denomination: data.denomination,
    unit: 'gram',
    stock: STOCK,
    imageUrl: `/mmtc/mmtc-${imageNo}.png`,
    sku: data.sku,
    shape: data.shape,
    purity: '999.9',
    dimension: 'N/A',
    countryOfOrigin: 'India',
    importer: 'NA',
    isFeatured: false,
    isActive: true
  };
}

/** Same 19 MMTC-PAMP products that used to be hardcoded on the shop page. */
const MMTC_SEED = [
  row(1, 1, {
    slug: 'mmtc-buddha-50',
    name: 'Lord Buddha Silver Bar',
    displayName: '(999.9+) Purity 50 g Purest Lord Buddha Silver Bar',
    weightGrams: 50,
    price: 14100,
    mrp: 14160,
    tags: ['Bars', 'Devotional'],
    sku: 'MMTC-BUDDHA-50G',
    shape: 'Rectangular Ingot',
    denomination: 50,
    description:
      'MMTC-PAMP 999.9+ purest 50 g Lord Buddha silver bar featuring a devotional design, suitable for gifting, worship, and precious metal collection.'
  }),
  row(2, 2, {
    slug: 'mmtc-hanuman-50',
    name: 'Lord Hanuman Silver Bar',
    displayName: '(999.9+) Purest 50 g Lord Hanuman Silver Bar',
    weightGrams: 50,
    price: 14910,
    mrp: 17760,
    tags: ['Bars', 'Devotional'],
    sku: 'MMTC-HANUMAN-50G',
    shape: 'Rectangular Ingot',
    denomination: 50,
    description:
      'MMTC-PAMP 999.9+ purest 50 g Lord Hanuman silver bar featuring a devotional design and investment-grade silver purity.'
  }),
  row(3, 3, {
    slug: 'mmtc-bouquet-50',
    name: 'Bouquet of Flowers Silver Coin',
    displayName: '(999.9+) Purest 50 g Bouquet of Flower Silver Coin',
    weightGrams: 50,
    price: 14060,
    mrp: 16470,
    tags: ['Coins', 'Gifting'],
    sku: 'MMTC-BOUQUET-50G',
    shape: 'Coin',
    denomination: 50,
    description:
      'MMTC-PAMP 999.9+ purest 50 g bouquet of flowers silver coin, designed as an elegant gifting collectible.'
  }),
  row(4, 4, {
    slug: 'mmtc-vaishno-50',
    name: 'Vaishno Devi Silver Coin',
    displayName: '(999.9+) Purest 50 g Vaishno Devi Silver Coin',
    weightGrams: 50,
    price: 13680,
    mrp: 15740,
    tags: ['Coins', 'Devotional'],
    sku: 'MMTC-VAISHNO-50G',
    shape: 'Coin',
    denomination: 50,
    description: 'MMTC-PAMP 999.9+ purest 50 g Vaishno Devi silver coin featuring a devotional design.'
  }),
  row(5, 5, {
    slug: 'mmtc-shiva-50',
    name: 'Lord Shiva Silver Bar',
    displayName: '(999.9+) Purest 50 g Lord Shiva Silver Bar',
    weightGrams: 50,
    price: 13680,
    mrp: 15240,
    tags: ['Bars', 'Devotional'],
    sku: 'MMTC-SHIVA-50G',
    shape: 'Rectangular Ingot',
    denomination: 50,
    description: 'MMTC-PAMP 999.9+ purest 50 g Lord Shiva silver bar with a devotional design.'
  }),
  row(6, 6, {
    slug: 'mmtc-banyan-bar-10',
    name: 'Banyan Tree Silver Bar',
    displayName: '(999.9+) Purest 10 g Banyan Tree Silver Bar',
    weightGrams: 10,
    price: 3050,
    mrp: 3510,
    tags: ['Bars', 'Collectibles'],
    sku: 'MMTC-BANYAN-BAR-10G',
    shape: 'Rectangular Ingot',
    denomination: 10,
    description: 'MMTC-PAMP 999.9+ purest 10 g Banyan Tree silver bar.'
  }),
  row(7, 7, {
    slug: 'mmtc-ganesh-laxmi-10',
    name: 'Ganesh Laxmi Silver Coin',
    displayName: '(999.9+) Purest 10 g Ganesh Laxmi Silver Coin',
    weightGrams: 10,
    price: 3050,
    mrp: 3510,
    tags: ['Coins', 'Devotional'],
    sku: 'MMTC-GANESH-LAXMI-10G',
    shape: 'Coin',
    denomination: 10,
    description: 'MMTC-PAMP 999.9+ purest 10 g Ganesh Laxmi silver coin with a devotional design.'
  }),
  row(8, 8, {
    slug: 'mmtc-newborn-baby-20',
    name: 'Newborn Baby Silver Coin',
    displayName: '(999.9+) Purest 20 g Newborn Baby (Blue) Silver Coin',
    weightGrams: 20,
    price: 6080,
    mrp: 7000,
    tags: ['Coins', 'Gifting'],
    sku: 'MMTC-NEWBORN-20G',
    shape: 'Coin',
    denomination: 20,
    description:
      'MMTC-PAMP 999.9+ purest 20 g Newborn Baby silver coin, designed for gifting and special occasions.'
  }),
  row(9, 9, {
    slug: 'mmtc-ashta-laxmi-50',
    name: 'Ashta Laxmi Silver Coin',
    displayName: '(999.9+) Purest 50 g Ashta Laxmi Silver Coin',
    weightGrams: 50,
    price: 13460,
    mrp: 15480,
    tags: ['Coins', 'Devotional'],
    sku: 'MMTC-ASHTA-LAXMI-50G',
    shape: 'Coin',
    denomination: 50,
    description: 'MMTC-PAMP 999.9+ purest 50 g Ashta Laxmi silver coin featuring a devotional design.'
  }),
  row(10, 10, {
    slug: 'mmtc-ganesha-colored-50',
    name: 'Ganesha Colored Silver Coin',
    displayName: '(999.9+) Purest 50 gm Ganesha Colored Silver Coin',
    weightGrams: 50,
    price: 13460,
    mrp: 15480,
    tags: ['Coins', 'Devotional', 'Collectibles'],
    sku: 'MMTC-GANESHA-COLORED-50G',
    shape: 'Coin',
    denomination: 50,
    description:
      'MMTC-PAMP 999.9+ purest 50 g Ganesha colored silver coin with a detailed devotional design.'
  }),
  row(11, 11, {
    slug: 'mmtc-laxmi-ganesha-colored-50',
    name: 'Laxmi Ganesha Colored Silver Bar',
    displayName: '(999.9+) Purest 50 g Stylized Laxmi Ganesha Colored Silver Bar',
    weightGrams: 50,
    price: 13460,
    mrp: 45480,
    tags: ['Bars', 'Devotional', 'Collectibles'],
    sku: 'MMTC-LAXMI-GANESHA-50G',
    shape: 'Rectangular Ingot',
    denomination: 50,
    description:
      'MMTC-PAMP 999.9+ purest 50 g Laxmi Ganesha colored silver bar with a devotional design.'
  }),
  row(12, 12, {
    slug: 'mmtc-guru-nanak-50',
    name: 'Guru Nanak Dev Colored Silver Bar',
    displayName: '(999.9+) Purest 50 g Guru Nanak Dev Colored Silver Bar',
    weightGrams: 50,
    price: 13460,
    mrp: 45480,
    tags: ['Bars', 'Devotional', 'Collectibles'],
    sku: 'MMTC-GURU-NANAK-50G',
    shape: 'Rectangular Ingot',
    denomination: 50,
    description: 'MMTC-PAMP 999.9+ purest 50 g Guru Nanak Dev colored silver bar.'
  }),
  row(13, 13, {
    slug: 'mmtc-balaji-50',
    name: 'Balaji Silver Bar',
    displayName: '(999.9+) Purest 50 g Balaji Silver Bar',
    weightGrams: 50,
    price: 13460,
    mrp: 46480,
    tags: ['Bars', 'Devotional'],
    sku: 'MMTC-BALAJI-50G',
    shape: 'Rectangular Ingot',
    denomination: 50,
    description: 'MMTC-PAMP 999.9+ purest 50 g Balaji silver bar with a devotional design.'
  }),
  row(14, 14, {
    slug: 'mmtc-laxmi-colored-20',
    name: 'Laxmi Colored Silver Bar',
    displayName: '(999.9+) Purest 20 g Laxmi Colored Silver Bar',
    weightGrams: 20,
    price: 6080,
    mrp: 7000,
    tags: ['Bars', 'Devotional', 'Collectibles'],
    sku: 'MMTC-LAXMI-COLORED-20G',
    shape: 'Rectangular Ingot',
    denomination: 20,
    description: 'MMTC-PAMP 999.9+ purest 20 g Laxmi colored silver bar.'
  }),
  row(15, 15, {
    slug: 'mmtc-shankha-ganesh-laxmi-set',
    name: 'Shankha Shapa Ganesh Laxmi Silver Coin Set',
    displayName: '(999.9+) Purest 50 g Shankha Shapa Ganesh Laxmi Coin Set of (25.0 gms x 2)',
    weightGrams: 50,
    price: 13880,
    mrp: 45970,
    tags: ['Coins', 'Devotional', 'Sets'],
    sku: 'MMTC-SHANKHA-GANESH-LAXMI-50G',
    shape: 'Coin Set',
    denomination: 50,
    description:
      'MMTC-PAMP 999.9+ purest silver coin set containing two 25 g Shankha Shapa Ganesh Laxmi coins.'
  }),
  row(16, 16, {
    slug: 'mmtc-maharishi-mahesh-yogi-31-10',
    name: 'Maharishi Mahesh Yogi Silver Coin',
    displayName: '(999.9+) Purest 31.10 g Maharishi Mahesh Yogi Silver Coin',
    weightGrams: 31.1,
    price: 8940,
    mrp: 20290,
    tags: ['Coins', 'Collectibles'],
    sku: 'MMTC-MAHARISHI-31-10G',
    shape: 'Coin',
    denomination: 31.1,
    description: 'MMTC-PAMP 999.9+ purest 31.10 g Maharishi Mahesh Yogi silver coin.'
  }),
  row(17, 17, {
    slug: 'mmtc-adi-shankaracharya-31-10',
    name: 'Adi Shankaracharya Silver Coin',
    displayName: '(999.9+) Purest 31.10 g Adi Shankaracharya Silver Coin',
    weightGrams: 31.1,
    price: 8940,
    mrp: 20200,
    tags: ['Coins', 'Devotional', 'Collectibles'],
    sku: 'MMTC-ADI-SHANKARACHARYA-31-10G',
    shape: 'Coin',
    denomination: 31.1,
    description: 'MMTC-PAMP 999.9+ purest 31.10 g Adi Shankaracharya silver coin.'
  }),
  row(18, 18, {
    slug: 'mmtc-swami-brahmananda-31-10',
    name: 'Swami Brahmananda Saraswati Silver Coin',
    displayName: '(999.9+) Purest 31.10 g Swami Brahmananda Saraswati Silver Coin',
    weightGrams: 31.1,
    price: 8940,
    mrp: 20200,
    tags: ['Coins', 'Devotional', 'Collectibles'],
    sku: 'MMTC-SWAMI-BRAHMANANDA-31-10G',
    shape: 'Coin',
    denomination: 31.1,
    description: 'MMTC-PAMP 999.9+ purest 31.10 g Swami Brahmananda Saraswati silver coin.'
  }),
  row(19, 19, {
    slug: 'mmtc-banyan-coin-5',
    name: 'Banyan Tree Silver Coin',
    displayName: '(999.9+) Purest 5 gm Banyan Tree Silver Coin',
    weightGrams: 5,
    price: 1820,
    mrp: 2100,
    tags: ['Coins', 'Collectibles'],
    sku: 'MMTC-BANYAN-COIN-5G',
    shape: 'Coin',
    denomination: 5,
    description: 'MMTC-PAMP 999.9+ purest 5 g Banyan Tree silver coin.'
  })
];

async function seedMmtcProducts() {
  let created = 0;
  for (const product of MMTC_SEED) {
    const existing = await Product.findOne({ slug: product.slug }).select('_id').lean();
    if (existing) continue;
    await Product.create(product);
    created += 1;
  }
  if (created) {
    console.log(`[mmtc] Added ${created} MMTC-PAMP products`);
  }
}

module.exports = { seedMmtcProducts, MMTC_SEED };
