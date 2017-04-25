'use strict';

var path = require('path');

var BemFile = require('./bemfile');

module.exports = class BemBundle extends BemFile {
    constructor(bemFile, entry, levels, platform) {
        super(bemFile.cell, bemFile.path);

        this.name = path.basename(entry).split('.')[0];
        this.entryPath = entry;
        this.levels = [].concat(levels);
        this.platform = platform;
        this.targetDir = path.resolve(path.join(this.platform + '.' + this.tech,
            this.entity.id,
            this.name
        ));

        this._isBundle = true;
    }

    static isBundle(bundle) {
        return bundle._isBundle;
    }
};
