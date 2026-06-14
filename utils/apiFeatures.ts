const normalizeQueryValue = (value: unknown) =>
  Array.isArray(value) ? value[value.length - 1] : value;

class APIFeatures {
  query: any;
  queryString: Record<string, unknown>;

  constructor(query: any, queryString: Record<string, unknown>) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    const queryObj = { ...this.queryString };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach((el) => delete queryObj[el]);

    Object.keys(queryObj).forEach((key) => {
      queryObj[key] = normalizeQueryValue(queryObj[key]);
    });

    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    this.query = this.query.find(JSON.parse(queryStr));

    return this;
  }

  sort() {
    const sort = normalizeQueryValue(this.queryString.sort);

    if (sort) {
      const sortBy = String(sort).split(',').join(' ');
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('-postedDate');
    }

    return this;
  }

  limitFields() {
    const selectedFields = normalizeQueryValue(this.queryString.fields);

    if (selectedFields) {
      const fields = String(selectedFields).split(',').join(' ');
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select('-__v');
    }

    return this;
  }

  paginate() {
    const page = Number(normalizeQueryValue(this.queryString.page)) || 1;
    const limit = Number(normalizeQueryValue(this.queryString.limit)) || 100;
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);

    return this;
  }
}

export default APIFeatures;
