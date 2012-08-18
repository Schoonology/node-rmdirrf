var fs = require('fs'),
    path = require('path'),
    step = require('stepup');

function rmdir_rf(root, callback) {
    step(function (err) {
        callback(err, null);
    }, function () {
        fs.readdir(root, this);
    }, function (fileNames) {
        var group = this.group();

        fileNames.forEach(function (name) {
            // Not only do we want the stats, but we want the name to carry through as well.
            // Hence the shenanigans.
            fs.lstat(path.join(root, name), function (err, stats) {
                stats.name = name;
                this(err, stats);
            }.bind(group()));
        }.bind(this));
    }, function (fileStats) {
        var group = this.group();

        fileStats.forEach(function (stats) {
            var fullPath = path.join(root, stats.name);

            if (stats.isDirectory()) {
                // Recurse.
                rmdir_rf(fullPath, group());
            } else if (stats.isSymbolicLink()) {
                fs.unlink(fullPath, group());
            } else {
                fs.unlink(fullPath, group());
            }
        });
    }, function () {
        fs.rmdir(root, this);
    }, callback);
}

module.exports = rmdir_rf;
