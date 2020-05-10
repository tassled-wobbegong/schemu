const fs = require('fs');
const path = require('path');

const sqlController = (req, res, next) => {
  if (!req.body) {
    res.status(422).json({message: "No data to process"});
  }
  fs.writeFileSync('./server/files/tables.txt', JSON.stringify(req.body), 'utf8');

  console.log("in request");
  // res.status(200).sendFile(path.resolve(__dirname, './files/tables.txt'), {
  //   headers: {
  //     "content": "text/html;charset=utf-8",
  //     "Content-Disposition": "attachment; filename=tables.txt",
  //     "Content-Type": 'application/force-download',
  //   },
  // });
  res.download(path.resolve(__dirname, './files/tables.pdf'), "tables.pdf");
};


module.exports = sqlController;