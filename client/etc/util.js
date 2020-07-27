/** Converts data in the form of a Blob to a file and downloads it to the user's filesystem.
 * @param {Blob} blob An instance of Blob containing the data to store in the file.
 * @param {string} filename The name of the file.
 */
export const downloadAsFile = (blob, filename) => {
  let anchor = document.createElement('a');
  anchor.href = window.URL.createObjectURL(blob);
  anchor.download = filename;
  anchor.click();
}

/** Creates an SVG node of type 'type' and sets the attributes defined by the 'attr' object.
 * @param {string} type A type of SVG node (eg. 'svg', 'line')
 * @param {object} attr 
 */
export const svgNode = (type, attr, ...children) => {
  const el = document.createElementNS('http://www.w3.org/2000/svg', type);
  for (const [key, val] of Object.entries(attr)) {
    el.setAttribute(key, val);
  }
  for (const child of children) {
    el.appendChild(child);
  }
  return el;
};

/** Given a series of accessors ```path```, finds the corresponding object in ```target``` and applies the changes specified in ```delta``` to a copy of ```target```.
 * @param {object} target An object to change.
 * @param {Array<string>} path An array of strings representing a series of accessors on an object.
 * @param {object} delta An object containing values which should overwrite values on ```target```.
 * @return {object} A cloned and altered version of ```target```.
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

/** Returns a deep clone of 'target';
 * @param {*} target 
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

/** Wraps a function ```callback```. Repeated invocations of the resulting function will be condensed to a single call, executed only after ```time``` miliseconds have elapsed without any other invocations.
 * @param {number} time Period of inactivity in miliseconds required before callback will be executed.
 * @param {Function} callback The function to be executed
 * @return {Function} A function.
 */
export const debounce = (time, callback) => {
  let interval;
  return (...args) => {
    clearTimeout(interval);
    interval = setTimeout(() => {
      interval = null;
      callback(...args);
    }, time);
  };
};

/** Converts an object containing schema data to a series of SQL CREATE TABLE statements. See Table.defaults and Field.defaults for the expected data structure. 
 * @param {object} tables 
 */
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