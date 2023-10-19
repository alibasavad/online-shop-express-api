export const mapperCategoryId = (list) => {
  let mappedList = [];

  for (let id of list) {
    mappedList.push({ _id: id });
  }

  return mappedList;
};

export const mapperPermissions = (list) => {
  let mappedList = [];

  for (let permission of list) {
    mappedList.push({ name: permission });
  }

  return mappedList;
};

// [
//       "example1" , "example2" , "example3"
// ]
// [
//       {
//             _id: "example1"
//       },
//       {
//             _id: "example2"
//       },
//       {
//             _id:  "example3"
//       },
// ]
