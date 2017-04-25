var path = require('path');
var fs = require('fs');

var minimatch = require('minimatch');
var through = require('through2');

var BemBundle = require('./bundle');
var BemLevel = require('./levels');

module.exports = function(opts, callback) {
    var levels = opts.levels || [];
    var target = opts.target;
    var entryTech = opts.entryTech || 'bemjson.js';

    return through.obj(function(file, enc, next) {
        if(file.tech === target.tech) {

            // collect bundles and levels inside entity.tech/bundle
            var levelsAndBundles = fs.readdirSync(file.path)
                .reduce((acc, filePath) => {
                    minimatch(filePath, 'blocks') && acc.levels.push(path.join(file.path, filePath));
                    minimatch(filePath, '*.blocks') && acc.bundleLevels.push(path.join(file.path, filePath));
                    minimatch(filePath, '*.' + entryTech) && acc.bundles.push(path.join(file.path, filePath));
                    return acc;
                }, { levels: [], bundles: [], bundleLevels: [] });

            var entityId = file.entity.id;
            /*
                Examples of structure:
                this.bundles: {
                    [entityName]: {
                        [bundleName]: BemBundle[]
                    }
                }

                this.levels: {
                    [entityName]: {
                        // levels for all bundles
                        blocks: BemLevel[]
                        // levels for specific bundle
                        [bundleName]: BemLevel[]
                    }
                }
            */
            this.bundles || (this.bundles = {});
            this.bundles[entityId] || (this.bundles[entityId] = {});

            this.levels || (this.levels = {});
            this.levels[entityId] ||  (this.levels[entityId] = { blocks: [] });

            levelsAndBundles.bundles.map(bundlePath => {
                var bundle = new BemBundle(file, bundlePath, levels);
                this.bundles[entityId][bundle.name] =
                    (this.bundles[entityId][bundle.name] || []).concat(bundle);
                this.push(bundle);
                return bundle;
            });

            levelsAndBundles.levels.forEach(level => {
                this.levels[entityId]['blocks'].push(new BemLevel(file, level));
            });

            levelsAndBundles.bundleLevels.forEach(level => {
                var name = path.basename(level).split('.')[0];
                this.levels[entityId][name] || (this.levels[entityId][name] = []);
                this.levels[entityId][name].push(new BemLevel(file, level));
            });

            next();
        } else {
            next(null, file);
        }
    },
    function flush(next) {
        callback && callback(fillBundlesWithLevelsForTarget(
            this.bundles,
            this.levels,
            levels,
            target
        ));
        next();
    });
};

module.exports.BemBundle = BemBundle;

function fillBundlesWithLevelsForTarget(bundles, levels, baseLevels, target) {
    return (target.entity ? [target.entity] : Object.keys(bundles))
        .reduce((filledBundles, entity) => {
            var entityBundles = bundles[entity];
            var entityLevels = levels[entity];
            return filledBundles.concat(fillBundlesWithLevels(
                entityBundles,
                entityLevels,
                baseLevels,
                target.bundleName
            ));
        }, []);
}

function fillBundlesWithLevels(entityBundles, entityLevels, baseLevels, targetBundleName) {
    return Object.keys(entityBundles)
        .filter(bundleName => !Boolean(targetBundleName) || bundleName === targetBundleName)
        .reduce((bundles, bundleName) => {
            entityBundles[bundleName]
                .forEach(bundle => {
                    bundles.push(BemLevel.collectLevelsForBundle(
                        baseLevels,
                        entityLevels,
                        bundle
                    ));
                })

            return bundles;
        }, []);
}
