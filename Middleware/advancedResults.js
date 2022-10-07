const advancedResults = (model, populate) => async (req, res, next) => {
  let query;
  // making copy of req.query
  const reqQuery = { ...req.query };

  //fields to remove
  const removeFields = ['select', 'sort', 'page', 'limit'];

  //loop over remove fields and remove them from query
  removeFields.forEach((param) => delete reqQuery[param]);

  // converting query into string
  let queryStr = JSON.stringify(reqQuery);
  // adding dollar sign infront of match
  queryStr = queryStr.replace(/\b(gt|gte|lt|lte)\b/g, (match) => `$${match}`);

  //Finding Resources
  query = model.find(JSON.parse(queryStr)).populate(populate);

  //select Fields
  if (req.query.select) {
    //.split seperate them where is , and the join is make string with " "
    const fields = req.query.select.split(',').join(' ');
    //parse use to convert back into object
    query = query.select(fields);
  }

  //sort fields
  if (req.query.sort) {
    const sortby = req.query.split(',').join(' ');
    query = query.select(sortby);
  } else {
    query = query.sort('-createdAt');
  }

  //pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 25;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const total = await model.countDocuments();

  query = query.skip(startIndex).limit(limit);

  //Populating if exist
  if (populate) {
    query = query.populate(populate);
  }

  //Executing Query
  const results = await query;

  //pagination
  const pagination = {};
  if (endIndex < total) {
    pagination.next = {
      page: page + 1,
      limit: limit,
    };
  }
  if (startIndex > 0) {
    pagination.prev = {
      page: page - 1,
      limit: limit,
    };
  }
  res.advancedResults = {
    success: true,
    count: results.length,
    page: page,
    pagination,
    data: results,
  };

  next();
};
module.exports = advancedResults;
