class Base {
  constructor(client) {
    Object.defineProperties(this, {
      client: {
        value: client
      },

      props: {
        value: {},
        writable: true,
        enumerable: false
      },
      
      ignore_props: {
        value: [],
        writable: true,
        enumerable: false
      }
    });
  }

  setup(data) {
    for (let key of Object.keys(data)) {
      if (this.ignore_props.includes(key)) continue;

      this.props[key] = {
        value: data[key],
        writable: true,
        enumerable: true
      }
    };

    Object.defineProperties(this, this.props);
    return this;
  }

  removeProp(key) {
    this.ignore_props.push(key);
    return this;
  } 

  addExtraProp(key, data) {
    this.props[key] = {
      value: data,
      writable: true,
      enumerable: true
    };

    return this;
  }

  replaceProp(key, data) {
    this[key] = data;
    return this;
  }
};

module.exports = Base;