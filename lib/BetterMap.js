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
    }
  }
  
  keys() {
    return [...super.keys()];
  }

  values() {
    return [...super.values()];
  }
};

module.exports = BetterMap;