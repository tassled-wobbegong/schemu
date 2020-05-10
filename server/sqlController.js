const fs = require("fs");
const path = require("path");

const sqlController = (req, res, next) => {
  if (!req.body) {
    res.status(422).json({ message: "No data to process" });
  }
  fs.writeFileSync(
    "./server/files/tables.txt",
    JSON.stringify(req.body),
    "utf8"
  );

  console.log("in request");
  res.set("Content-Disposition", "inline;filename=tables.txt");
  res.set("Content-Type", "text/plain")
  res.download(path.join(__dirname, './files/tables.txt'));
  
};

module.exports = sqlController;
