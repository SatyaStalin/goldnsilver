const express = require('express');
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');
const Product = require('../models/Product');
const router = express.Router();

const upload = multer({ dest: 'uploads/temp/' });

// Import products from CSV
router.post('/import', upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const results = [];
    const errors = [];

    fs.createReadStream(req.file.path)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', async () => {
        // Clean up temp file
        fs.unlinkSync(req.file.path);

        for (let i = 0; i < results.length; i++) {
          const row = results[i];
          try {
            const pricingRaw = (
              row.pricingMode ||
              row['Pricing Mode'] ||
              ''
            ).toString()
              .trim()
              .toLowerCase();
            const pricingMode = pricingRaw === 'fixed' ? 'fixed' : 'rate_based';
            const product = new Product({
              name: row.name || row.Name,
              slug: (row.slug || row.Slug || (row.name || row.Name).toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')),
              metal: row.metal || row.Metal || 'gold',
              type: row.type || row.Type || 'digital',
              category: row.category || row.Category || '',
              description: row.description || row.Description || '',
              pricingMode,
              pricePerUnit: parseFloat(row.pricePerUnit || row['Price Per Unit'] || row.price || 0),
              metalGrams: parseFloat(row.metalGrams || row['Metal Grams'] || row.metal_grams || 1) || 1,
              unit: row.unit || row.Unit || 'gram',
              stock: parseInt(row.stock || row.Stock || 0),
              imageUrl: row.imageUrl || row['Image URL'] || '',
              isFeatured: (row.isFeatured || row['Is Featured'] || 'false').toLowerCase() === 'true',
              isActive: (row.isActive || row['Is Active'] || 'true').toLowerCase() !== 'false'
            });

            await product.save();
          } catch (err) {
            errors.push({ row: i + 2, error: err.message, data: row });
          }
        }

        res.json({
          success: true,
          imported: results.length - errors.length,
          errors: errors.length,
          errorDetails: errors
        });
      })
      .on('error', (err) => {
        if (fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }
        next(err);
      });
  } catch (err) {
    next(err);
  }
});

// Export products to CSV
router.get('/export', async (req, res, next) => {
  try {
    const csvWriter = require('csv-writer').createObjectCsvStringifier({
      header: [
        { id: 'name', title: 'Name' },
        { id: 'slug', title: 'Slug' },
        { id: 'metal', title: 'Metal' },
        { id: 'type', title: 'Type' },
        { id: 'category', title: 'Category' },
        { id: 'description', title: 'Description' },
        { id: 'pricingMode', title: 'Pricing Mode' },
        { id: 'pricePerUnit', title: 'Price Per Unit' },
        { id: 'metalGrams', title: 'Metal Grams' },
        { id: 'unit', title: 'Unit' },
        { id: 'stock', title: 'Stock' },
        { id: 'imageUrl', title: 'Image URL' },
        { id: 'isFeatured', title: 'Is Featured' },
        { id: 'isActive', title: 'Is Active' }
      ]
    });

    const products = await Product.find().lean();
    const csvString =
      csvWriter.getHeaderString() +
      csvWriter.stringifyRecords(
        products.map((p) => ({
          ...p,
          pricingMode: p.pricingMode === 'fixed' ? 'fixed' : 'rate_based'
        }))
      );

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=products-export.csv');
    res.send(csvString);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
