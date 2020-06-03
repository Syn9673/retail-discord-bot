const CONSTANTS = require('../../consants');

class PublicFlags {
  constructor(flag) {
    this.flag = flag || 0;
  }

  return() {
    let flags = [];

    for (let flag of Object.keys(CONSTANTS.public_flags))
      if (this.flag & CONSTANTS.public_flags[flag]) flags.push(flag); 

    return flags;
  }
};

module.exports = PublicFlags;