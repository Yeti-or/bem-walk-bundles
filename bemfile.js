'use strict';

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

module.exports = BemFile;
