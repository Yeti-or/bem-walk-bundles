var path = require('path');
var fs = require('fs');

var minimatch = require('minimatch');
var through = require('through2');

var BemBundle = require('./bundle');



module.exports = function(opts, callback) {
    var levels = opts.levels;
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
                Example of this.bundles structure:
                {
                    entityName: {
                        bundles: {
                            name: {
                                bundlePath,
                                name,
                                bemFile
                            }
                        },
                        bundleLevels: {
                            // levels for all bundles
                            blocks: [levels]
                            // levels for specific bundle
                            name: [levels]
                        }
                    }
                }
            */
            this.bundles || (this.bundles = {});
            this.bundles[entityId] || (this.bundles[entityId] = {});

            this.levels || (this.levels = {});
            this.levels[entityId] ||  (this.levels[entityId] = { blocks: [] });

            levelsAndBundles.bundles.map(bundlePath => {
                var bundle = new BemBundle(file, bundlePath);
                this.bundles[entityId][bundle.name] = bundle;
                this.push(bundle);
                return bundle;
            });

            levelsAndBundles.levels.forEach(level => {
                this.levels[entityId].blocks.push(level);
            });

            levelsAndBundles.bundleLevels.forEach(level => {
                var name = path.basename(level).split('.')[0];
                this.levels[entityId][name] = level;
            });

            next();
        } else {
            next(null, file);
        }
    },
    function flush(next) {
        if (target.entity) {
            var entityBundles = this.bundles[target.entity];
            callback && callback(
                Object.keys(entityBundles)
                    .filter(bundleName => !Boolean(target.bundleName) || bundleName === target.bundleName)
                    .reduce((bundles, bundleName) => {
                        bundles.push(entityBundles[bundleName]);
                        return bundles;
                    }, [])
                );
            next();
        } else {
            callback && callback();
            next();
        }
    });
};
