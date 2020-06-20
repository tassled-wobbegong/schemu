export const downloadAsFile = (blob, filename) => {
  let anchor = document.createElement('a');
  anchor.href = window.URL.createObjectURL(blob);
  anchor.download = filename;
  anchor.click();
}

/*
  merge([object] target, [array] path, [object] delta);
    Given a series of accessors 'path', finds the corresponding object in 
    'target' and applies the changes specified in 'delta' to a copy of 'target'.
    Returns the copied, changed object.
*/
export const merge = (target, path, delta) => {
  const key = path.shift();

  let result;
  if (Array.isArray(target)) {
    result = [ ...target ];
    if (key !== undefined) {
      result[key] = merge(target[key], path, delta);
    } else {
      for (let i in delta) {
        result[i] = delta[i];
      }
    }
  } else if (typeof target === 'object') {
    if (key !== undefined) {
      result = { ...target, [key]: merge(target[key], path, delta) };
    } else {
      result = { ...target, ...delta };
    }
  } else {
    if (key !== undefined) {
      throw new Error("Undefined path.");
    } else {
      result = delta;
    }
  }
  return result;
};

/*
  clone([mixed] target);
    Returns a deep clone of 'target';
*/
export const clone = (target) => {
  if (target === null) {
    return null;
  } if (typeof target === "object") {
    const result = Array.isArray(target) ? [] : {};
    for (let key in target) {
      result[key] = clone(target[key]);
    }
    return result;
  } else {
    return target;
  }
};

export const debounce = (time, callback) => {
  let interval;
  return (...args) => {
    clearTimeout(interval);
    interval = setTimeout(() => {
      interval = null;
      callback(...args);
      console.log("debounced");
    }, time);
  };
};

export const toSql = (tables) => {
  const fkeys = {};

  let result = "";
  for (const i in tables) {
    const table = tables[i];

    fkeys[table.name] = [];

    result += `CREATE TABLE ${table.name} (\n`;
    for (const i in table.fields) {
      const field = table.fields[i];

      const { tableName, fieldName } = field.foreignKey;
      if (tableName && fieldName) {
        fkeys[table.name].push({ 
          table: tableName, 
          field: fieldName, 
          source: field.name 
        });
      }

      const basic = `${field.name} ${field.type}`;
      const length = field.length ? `(${field.length}) ` : " ";
      const flags = (field.primaryKey ? "PRIMARY KEY " : "") ||
        ((field.unique ? "UNIQUE " : "") + (field.notNull ? "NOT NULL " : ""));
      const def = field.defaultValue ? `DEFAULT ${field.defaultValue} ` : "";
      const check = field.check ? `CHECK ${field.check}` : "";
      result += `\t${basic}${length}${flags}${def}${check},\n`;
    }
    result += `);\n\n`;
  }

  for (let table in fkeys) {
    if (fkeys[table].length) {
      for (let fkey of fkeys[table]) {
        result += `ALTER TABLE ${table} ADD CONSTRAINT ${fkey.source}_ref_${table}_${fkey.field}\n`;
        result += `\tFOREIGN KEY (${fkey.source}) REFERENCES ${fkey.table} (${fkey.field});\n`;
      }
    }
    result += "\n";
  }

  return result;
}

// export const createSQL = (res) => {

//   //Needs to be heavily expanded to not allow illegal queries!!!

//   const tables = res['tables'];
//   let primary = '';
//   let foreignTable = '';
//   let foreignField = '';
//   let unique = [];
//   let output = ''
//   for (const t in tables) {
//       let table = t.toString();
//       output += 'CREATE TABLE '
//       output += tables[table]['name'] + '(\n'
//       for (const f in tables[table]['fields']) {
//           let field = f.toString();
//           output += tables[table]['fields'][field]['name'] + ' ';
//           output += tables[table]['fields'][field]['type'];
//           if(tables[table]['fields'][field]['primaryKey']) primary = tables[table]['fields'][field]['name'];
//           if(tables[table]['fields'][field]['unique']) unique.push(tables[table]['fields'][field]['name']);
//           if(tables[table]['fields'][field]['notNUll']) output += ' NOT NULL';
//           if(tables[table]['fields'][field]['defaultValue']) {
//               output += ' DEFAULT ' + tables[table]['fields'][field]['defaultValue'];
//           }
//           output += ',\n';
//           if(tables[table]['fields'][field]['checkCondition']) output += 'CHECK (' + tables[table]['fields'][field]['name'] + tables[table]['fields'][field]['checkCondition'] +'),\n';
//           if(tables[table]['fields'][field]['foreignKey']) {
//             foreignField = tables[table]['fields'][field]['foreignKey']['fieldName'];
//             foreignTable = tables[table]['fields'][field]['foreignKey']['tableName'];
//           }
//       }
//       if(primary) output += 'PRIMARY KEY (' + primary + '),\n';
//       primary = '';
//       if(foreignTable) output += 'FOREIGN KEY (' + foreignField + ') REFERENCES ' + foreignTable + '(' + foreignField + '),\n';
//       if(unique.length) {
//               output += 'UNIQUE (';
//               unique.forEach(x => output += x + ', ');
//               output = output.slice(0, -2)
//               output += '),\n'
//       }
//       output = output.slice(0, -2);
//       output +='\n);\n'
//       foreignTable = '';
//       foreignField = '';
//   }
//   return output;
// }