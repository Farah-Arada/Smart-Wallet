const mongoose = require("mongoose");
console.log("database",process.env.DATABASE_URL);

mongoose
  .connect(process.env.DATABASE_URL)
  .then(() => {
    console.log("DB Ready To Use");
  })
  .catch((err) => {
    console.log(err);
  });
