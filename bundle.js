'use strict';

var path = require('path');

// TODO: https://github.com/bem-sdk/bem-sdk/issues/28
class BemFile {
    constructor(cell, path) {
        this.cell = cell;
        this.path = path;
    }

    get entity() {
        return this.cell.entity;
    }

    get tech() {
        return this.cell.tech;
    }

    get layer() {
        return this.cell.layer;
    }

    get level() {
        return this.cell.layer;
    }
};

module.exports = class BemBundle extends BemFile {
    constructor(bemFile, entry) {
        super(bemFile.cell, bemFile.path);

        this.name = path.basename(entry).split('.')[0];
        this.entryPath = entry;

        this.levels = [];
    }
}
