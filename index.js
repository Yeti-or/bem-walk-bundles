var path = require('path');
var fs = require('fs');

var minimatch = require('minimatch');
var through = require('through2');

var BemBundle = require('./bundle');

module.exports = function(opts, callback) {
    var levels = opts.levels;
    var target = opts.target;
    var entryTech = opts.entryTech || 'bemjson.js';

    var bundles = {};

    return through.obj(function(file, enc, next) {
        if(file.tech === target.tech) {
            // collect bundles and levels
            var levelsAndBundles = readdirSync(file.path)
                .reduce((acc, filePath) => {
                    minimatch(filePath, 'blocks') && acc.levels.push(path.join(file.path, filePath));
                    minimatch(filePath, '*.blocks') && acc.bundleLevels.push(path.join(file.path, filePath));
                    minimatch(filePath, '*.' + entryTech) && acc.bundles.push(path.join(file.path, filePath));
                    return acc;
                }, { levels: [], bundles: [], bundleLevels: [] });

            var entryBundles = levelsAndBundles.bundles.map(bundlePath => ({
                path: bundlePath,
                name: path.basename(bundlePath).split('.')[0],
                file,
                levels: levels.concat(levelsAndBundles.levels),
                bundleLevels: levelsAndBundles.bundleLevels
            }))

            bundles[file.entity.id] = (bundles[file.entity.id] || []).concat(entryBundles);

            entryBundles.forEach(bundle => this.push(bundle));

            next();
        } else {
            next(null, file);
        }
    },
    function flush(next) {

        if (target.entity) {
            var entityBundles = bundles[target.entity];

            entityBundles
                .filter(bundle => !Boolean(target.bundleName) || bundle.name === target.bundleName)
                .forEach(bundle => {
                    console.log(bundle);
                });
        }

        next();
        callback && callback();
    });
};

// ReadDir if it is symlink
function readdirSync(path) {
    var stat = fs.lstatSync(path);
    return stat.isSymbolicLink() ?
        fs.readdirSync(fs.readlinkSync(path)) :
        fs.readdirSync(path);
}

