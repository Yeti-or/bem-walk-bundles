'use strict';

var path = require('path');

var BemFile = require('./bemfile');

class BemLevel extends BemFile {
    constructor(bemFile, levelPath) {
        super(bemFile.cell, levelPath);
    }

    static collectLevelsForBundle(baseLevels, entityLevels, bundle) {

        var sortByLayer = (levelA, levelB) =>
            baseLevels.indexOf(levelA.layer) - baseLevels.indexOf(levelB.layer);
        var pushLevel = level => bundle.levels.push(level.path);

        entityLevels['blocks'] &&
            entityLevels['blocks'].sort(sortByLayer).forEach(pushLevel);
        entityLevels[bundle.name] &&
            entityLevels[bundle.name].sort(sortByLayer).forEach(pushLevel);

        return bundle;
    }
}


module.exports = BemLevel;
