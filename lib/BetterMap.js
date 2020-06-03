class BetterMap extends Map {
  constructor(options) {
    super(options);
  }

  set(key, val) {
    super.set(key, val);
    return val;
  }

  broadcast(callback) {
    for (let [k, v] of this) {
      callback(k, v);
      super.set(k, v);
    }
  }
  
  keys() {
    return [...super.keys()];
  }

  values() {
    return [...super.values()];
  }

  entries() {
    return [...super.entries()];
  }

  map(func, toMap = false) {
    if (toMap) {
      let newMap = new BetterMap();
      let entries = this.entries();

      for (let entry of entries) {
        newMap.set(entry[0], func(entry[1]));
      };

      return newMap;
    }

    return this.values().map(func);
  }

  filter(filter, toMap = false) {
    if (toMap) {
      let newMap = new BetterMap();
      let entries = this.entries();

      for (let entry of entries) {
        if (!filter(entry[1])) continue;
        newMap.set(entry[0], entry[1]);
      }

      return newMap;
    }

    return this.values().map(filter);
  }

  toString() {
    return JSON.stringify(this.values());
  }
};

module.exports = BetterMap;