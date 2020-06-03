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
      },

      hidden_props: {
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
        enumerable: !this.hidden_props.includes(key),
        configurable: true
      }
    };

    Object.defineProperties(this, this.props);
    return this;
  }

  ignoreProp(key) {
    this.ignore_props.push(key);
    return this;
  } 

  removeProp(key) {
    delete this[key];
    return this;
  }

  addExtraProp(key, data) {
    this[key] = data;
    return this;
  }

  replaceProp(key, data) {
    this[key] = data;
    return this;
  }

  hideProp(key) {
    this.hidden_props.push(key);
    return this;
  }
};

module.exports = Base;