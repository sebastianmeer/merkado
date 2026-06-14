import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import connectDB from './db/connect';
import Product from './models/productModel';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

dotenv.config({ path: path.join(__dirname, 'config.env') });

const products = JSON.parse(fs.readFileSync(path.join(__dirname, 'data/products.json'), 'utf-8'));

const importData = async () => {
  try {
    await connectDB();
    await Product.create(products);
    console.log('Data successfully loaded into marketplace.products!');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

const deleteData = async () => {
  try {
    await connectDB();
    await Product.deleteMany();
    console.log('Data successfully deleted from marketplace.products!');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteData();
}
