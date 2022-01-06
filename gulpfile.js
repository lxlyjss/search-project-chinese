const task = require('./search');

function defaultTask(cb) {
  task.mainTask();
  // task.createFile.writeText();
  cb();
}

exports.default = defaultTask;