const fs = require("fs");
const path = require("path");

const sqlController = (req, res, next) => {
  if (!req.body) {
    res.status(422).json({ message: "No data to process" });
  }
  fs.writeFileSync(
    "./server/files/tables.txt",
    createSQL(JSON.stringify(req.body)),
    "utf8"
  );

  console.log("in request");
  res.set("Content-Disposition", "inline;filename=tables.txt");
  res.set("Content-Type", "text/plain")
  res.download(path.join(__dirname, './files/tables.txt'));
  
};

const createSQL = (jsonInput) => {

  //Needs to be heavily expanded to not allow illegal queries!!!

  const res = JSON.parse(jsonInput);
  const tables = res['tables'];
  let primary = '';
  let foreignTable = '';
  let foreignField = '';
  let unique = [];
  let output = ''
  for (const t in tables) {
      table = t.toString();
      output += 'CREATE TABLE '
      output += tables[table]['name'] + '(\n'
      for (const f in tables[table]['fields']) {
          field = f.toString();
          output += tables[table]['fields'][field]['name'] + ' ';
          output += tables[table]['fields'][field]['type'];
          if(tables[table]['fields'][field]['primaryKey']) primary = tables[table]['fields'][field]['name'];
          if(tables[table]['fields'][field]['unique']) unique.push(tables[table]['fields'][field]['name']);
          if(tables[table]['fields'][field]['notNUll']) output += ' NOT NULL';
          if(tables[table]['fields'][field]['defaultValue'] === "uuid_generate_v4()" && tables[table]['fields'][field]['type'] === 'uuid') output += ' DEFAULT uuuid_generate_v4()';
              else if (tables[table]['fields'][field]['defaultValue'] !== "uuid_generate_v4()")
                      output += ' DEFAULT ' + tables[table]['fields'][field]['defaultValue'];
          output += ',\n';
          if(tables[table]['fields'][field]['checkCondition']) output += 'CHECK (' + tables[table]['fields'][field]['name'] + tables[table]['fields'][field]['checkCondition'] +'),\n';
      }
      if(primary) output += 'PRIMARY KEY (' + primary + '),\n';
      if(foreignTable) output += 'FOREIGN KEY (' + foreignField + ') REFERENCES ' + foreignTable + '(' + foreignField + '),\n';
      if(unique.length) {
              output += 'UNIQUE (';
              unique.forEach(x => output += x + ', ');
              output = output.slice(0, -2)
              output += '),\n'
      }
      output = output.slice(0, -2);
      output +='\n);\n'
  }
  return output;
}

module.exports = sqlController;
