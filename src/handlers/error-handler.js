exports.notFound = (req, res, next) => {
  res.status(404).json({
    success: false,
    message: "Api url doesn't exist ",
  });
};
      