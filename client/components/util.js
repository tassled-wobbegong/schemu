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
  if (typeof target === "object") {
    const result = Array.isArray(target) ? [] : {};
    for (let key in target) {
      result[key] = clone(target[key]);
    }
    return result;
  } else {
    return target;
  }
};