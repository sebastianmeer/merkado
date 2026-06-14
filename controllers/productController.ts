import Product from '../models/productModel';
import APIFeatures from '../utils/apiFeatures';
import AppError from '../utils/appError';
import catchAsync from '../utils/catchAsync';

export const aliasTopCheapProducts = (req: any, res: any, next: any) => {
  req._queryDefaults = {
    limit: '3',
    sort: 'price',
    fields: 'name,price,category,seller,postedDate,priceDiscount,productSlug',
  };
  next();
};

export const getProductCategoryStats = catchAsync(async (req, res, next) => {
  const stats = await Product.aggregate([
    { $match: { price: { $lt: 1000 } } },
    {
      $group: {
        _id: '$category',
        numProducts: { $sum: 1 },
        products: {
          $push: {
            id: '$_id',
            name: '$name',
            price: '$price',
            seller: '$seller',
          },
        },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
    {
      $addFields: {
        category: '$_id',
        avgPrice: { $round: ['$avgPrice', 2] },
      },
    },
    { $project: { _id: 0 } },
    { $sort: { avgPrice: 1 } },
  ]);

  res.status(200).json({
    status: 'success',
    results: stats.length,
    data: { stats },
  });
});

export const getAllProducts = catchAsync(async (req, res, next) => {
  const queryString = {
    ...req.query,
    ...(req._queryDefaults || {}),
  };

  const features = new APIFeatures(Product.find(), queryString)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const products = await features.query;

  res.status(200).json({
    status: 'success',
    results: products.length,
    data: { products },
  });
});

export const getProduct = catchAsync(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(new AppError('No product found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: { product },
  });
});

export const createProduct = catchAsync(async (req, res, next) => {
  const product = await Product.create(req.body);

  res.status(201).json({
    status: 'success',
    data: { product },
  });
});

export const updateProduct = catchAsync(async (req, res, next) => {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    returnDocument: 'after',
    runValidators: true,
  });

  if (!product) {
    return next(new AppError('No product found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: { product },
  });
});

export const deleteProduct = catchAsync(async (req, res, next) => {
  const product = await Product.findByIdAndDelete(req.params.id);

  if (!product) {
    return next(new AppError('No product found with that ID', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null,
  });
});
