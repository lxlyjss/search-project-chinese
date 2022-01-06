var files = [
  {
    projectName: "peppa-parent",
    path: "/Users/lxl/Documents/project/peppa-parent/src",
  },
  {
    projectName: "peppa-student-v2",
    path: "/Users/lxl/Documents/project/peppa-student-v2/src",
  },
  {
    projectName: "peppa-student-course",
    path: "/Users/lxl/Documents/project/peppa-student-course/src",
  },
  {
    projectName: "peppa-teacher",
    path: "/Users/lxl/Documents/project/peppa-teacher/src",
  },
  {
    projectName: "peppa-misc",
    path: "/Users/lxl/Documents/project/peppa-misc/src",
  },
];

var ignoreFiles = [
  ".DS_Store",
  "node_modules/",
  "build/",
  ".vscode/",
  ".json",
  "demo",
  "course_list/",
];

var includesFilesReg = /(.js|.ts|.jsx|.tsx)/;

module.exports = {
  files,
  ignoreFiles,
  includesFilesReg,
};
