const errorHandler = require("./error-handler");
import * as constants from "../constants/index";

// set a responce normalizer
exports.normalizer = (
  req,
  res,
  { result = "", messageCode, type = "single", status = 200 }
) => {
  // take page for pagination format
  const page = req.query.page;
  // take size for pagination format
  const size = req.query.size ? req.query.size : 5;

  let message;

  // extract message text if message is a message code
  if (messageCode !== "") {
    message = constants.messages.messageCodes[messageCode];
  }

  switch (type) {
    // just responce a single object
    case "single":
      return res.status(status).json({
        result: result,
        message: message,
      });

    // responce a two or more object all togather
    case "multi":
      return res.status(status).json({
        result: result,
        message: message,
      });

    // responce multi objects with pagination
    case "multi/pagination":
      let total = Math.floor(result.length / size) + 1;
      if (result.length % size === 0) total = total - 1;
      const startIndex = (page - 1) * size;
      const endIndex = page * size;
      result = result.slice(startIndex, endIndex);
      return res.status(status).json({
        result: result,
        message: message,
        page: +page,
        size: +size,
        total: total,
      });
  }
};
