import mongoose from 'mongoose';
import slugify from 'slugify';

interface IProduct {
  name: string;
  price: number;
  category: string;
  seller: string;
  description?: string;
  postedDate?: Date;
  productSlug?: string;
  premiumProducts?: boolean;
  priceDiscount?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

const buildProductSlug = (name: string) => slugify(name, { lower: false }).toUpperCase();

const setProductSlug = (product: { name?: string; productSlug?: string }) => {
  if (product.name) {
    product.productSlug = buildProductSlug(product.name);
  }
};

const productSchema = new mongoose.Schema<any>(
  {
    name: {
      type: String,
      required: [true, 'A product must have a name'],
      unique: true,
      trim: true,
      minlength: [3, 'A product name must have at least 3 characters'],
      maxlength: [80, 'A product name must have 80 characters or less'],
    },
    price: {
      type: Number,
      required: [true, 'A product must have a price'],
      min: [1, 'A product price must be at least 1'],
    },
    category: {
      type: String,
      required: [true, 'A product must have a category'],
      trim: true,
      enum: {
        values: ['Electronics', 'Clothes', 'Books', 'Food', 'Home', 'Services', 'Sports', 'Others'],
        message: 'Category must be Electronics, Clothes, Books, Food, Home, Services, Sports, or Others',
      },
    },
    seller: {
      type: String,
      required: [true, 'A product must have a seller'],
      trim: true,
      minlength: [2, 'A seller name must have at least 2 characters'],
      maxlength: [80, 'A seller name must have 80 characters or less'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [50, 'A product description must have 50 characters or less'],
    },
    postedDate: {
      type: Date,
      default: Date.now,
    },
    productSlug: String,
    premiumProducts: {
      type: Boolean,
      default: false,
      select: false,
    },
    priceDiscount: {
      type: Number,
      min: [0, 'Discount price cannot be negative'],
      validate: {
        validator: function (this: any, val: number | undefined | null) {
          if (val === undefined || val === null) return true;

          const update: any = this instanceof mongoose.Query ? this.getUpdate() : null;
          const price = update ? update.price || (update.$set && update.$set.price) : this.price;

          if (price === undefined || price === null) return true;
          return val < price;
        },
        message: 'Discount price ({VALUE}) should be below the regular price',
      },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

productSchema.index({ price: 1, name: 1 });

productSchema.virtual('daysPosted').get(function (this: IProduct) {
  if (!this.postedDate) return null;
  const diffMs = Date.now() - this.postedDate.getTime();
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
});

((productSchema.pre as any)('save', function (this: IProduct & { productSlug?: string }, next: () => void) {
  setProductSlug(this);
  next();
}) as void);

((productSchema.pre as any)('findOneAndUpdate', function (this: mongoose.Query<any, any>, next: () => void) {
  const update = this.getUpdate() as any;
  const name = update.name || (update.$set && update.$set.name);

  if (!name) {
    next();
    return;
  }

  if (update.$set) {
    update.$set.productSlug = buildProductSlug(name);
  } else {
    update.productSlug = buildProductSlug(name);
  }

  this.setUpdate(update);
  next();
}) as void);

((productSchema.pre as any)('insertMany', function (this: any, next: (err?: Error) => void, docs: IProduct[]) {
  if (Array.isArray(docs)) {
    docs.forEach(setProductSlug);
  }

  next();
}) as void);

((productSchema.pre as any)(/^find/, function (this: mongoose.Query<any, any>) {
  this.find({ premiumProducts: { $ne: true } });
}) as void);

((productSchema.pre as any)('aggregate', function (this: mongoose.Aggregate<any>) {
  this.pipeline().unshift({ $match: { premiumProducts: { $ne: true } } });
}) as void);

const Product = mongoose.model<IProduct>('Product', productSchema, 'products');

export default Product;
