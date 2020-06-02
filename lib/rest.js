const axios = require('axios');

class Rest {
  constructor(client) {
    this.client = client;
    let methods = ["post", "get", "delete", "head", "options", "put", "patch"];

    for (let method of methods) {
      this[method] = function(data = {}) {
        if (!data.headers) data.headers = {};
        if (!data.headers.Authorization) data.headers.Authorization = `Bot ${this.client.options.token}`;

        return axios({
          method,
          url: data.url,
          data: data.data,
          headers: data.headers
        });
      }
    }
  }
};

module.exports = Rest;