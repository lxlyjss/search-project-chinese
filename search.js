const fs = require("fs");
const xlsx = require("node-xlsx");
const chalk = require('chalk');
const path = require("path");
const config = require("./config");

var readFile = {
  fileList: config.files,
  jsFile: [],
  init: function () {
    config.files.forEach(item => {
      console.log(chalk.blue(`Start of loop files at: ${item.projectName}`));
      this.loop([item.path]);
      console.log(chalk.green(`End of loop files at`));
      console.log(chalk.blue(`Start of create text files at: ${item.projectName}`));
      // 生成text文件
      createFile.writeText(this.jsFile, item.projectName);
      console.log(chalk.blue(`Create text files success`));
      console.log(chalk.blue(`Start of create excel files at: ${item.projectName}`));
      // 生成excel文件
      createFile.writeExcel(this.jsFile, item.projectName);
      console.log(chalk.blue(`Create excel files success`));
    })
  },
  // 递归文件信息
  loop: function (files) {
    if (!Array.isArray(files))
      throw new Error("Variable [files] is not type of Array");
    var filterFiles = files.filter((item) => {
      return !config.ignoreFiles.includes(item);
    });
    filterFiles.forEach((pathname) => {
      // 判断是不是文件夹，是文件夹继续递归
      if (this.isDir(pathname)) {
        try {
          var data = fs.readdirSync(pathname, {
            encoding: "utf-8",
          });
          if (data.length > 0) {
            var nextFiles = data.map((item) => {
              return pathname + "/" + item;
            });
            this.loop(nextFiles, pathname);
          }
        } catch (err) {
          throw err;
        }
      } else {
        // 文件，分析文件
        if (!this.isIgnoreFile(pathname)) {
          var extNam = this.getExtName(pathname);
          if (config.includesFilesReg.test(extNam)) {
            var fileObj = {
              path: pathname,
            };
            try {
              var data = fs.readFileSync(pathname, {
                encoding: "utf-8",
              });
              // 页面包含中文的话再加入
              if (/[\u4e00-\u9fa5]/g.test(data)) {
                var textLine = data.split("\n");
                fileObj.textLine = textLine;
                this.jsFile.push(fileObj);
              }
            } catch (err) {
              throw err;
            }
          }
        }
      }
    });
  },
  // 判断是否为文件夹
  isDir: function (pathname) {
    var stat = fs.lstatSync(pathname);
    // console.log('stat: ', stat);
    return stat.isDirectory();
  },
  getExtName: function (pathname) {
    return path.extname(pathname);
  },
  isIgnoreFile: function (pathname) {
    return config.ignoreFiles.some((item) => pathname.indexOf(item) !== -1);
  },
};

var createFile = {
  writeText: function (text, projectName) {
    var fileText = this.consolidateText(text);
    fs.writeFile(
      path.resolve(`${__dirname}/${projectName}.text`),
      fileText,
      {
        encoding: "utf-8",
      },
      (err) => {
        if (err) throw err;
      }
    );
  },
  writeExcel: function (text, projectName) {
    var excelData = this.getExcelData(text);
    var buffer = xlsx.build([
      {
        name: "sheet1",
        data: excelData,
      },
    ]);
    fs.writeFile(
      path.resolve(`${__dirname}/${projectName}.xlsx`),
      buffer,
      {
        encoding: "utf-8",
        flag: "w",
      },
      (err) => {
        if (err) throw err;
      }
    );
  },
  getExcelData: function (files) {
    let data = []; // 其实最后就是把这个数组写入excel
    let title = ["页面", "行数", "中文", "英文"]; //这是第一行 俗称列名
    data.push(title); // 添加完列名 下面就是添加真正的内容了
    files.forEach((element) => {
      var ignoreFlag = false;
      // 保存已经添加过的路径文件。
      var paths = [];
      element.textLine.forEach((line, key) => {
        var arrInner = [];
        // 去除注释的行
        if (!/\/\//.test(line)) {
          // 检索包含 /* 的行，设置忽略。
          if (/\/\*/.test(line)) {
            ignoreFlag = true;
            return;
          }
          // 检索包含 */ 的行，取消忽略。
          if (/\*\//.test(line)) {
            ignoreFlag = false;
            return;
          }
          if (ignoreFlag) return;
          // 检索所有包含中文的行
          if (/[\u4e00-\u9fa5]/g.test(line)) {
            line = line.match(
              /[\u4e00-\u9fa5\u3002\uff1b\uff0c\uff1a\u201c\u201d\uff08\uff09\u3001\uff1f\u300a\u300b"',\d]/g
            );
            line = line.join("");
            const hasPath = paths.some((p) => p === element.path);
            if (!hasPath) {
              arrInner.push(element.path);
              paths.push(element.path);
            } else {
              arrInner.push("");
            }
            arrInner.push(key + 1);
            arrInner.push(line);
            data.push(arrInner);
          }
        }
      });
      // data.push(arrInner); //data中添加的要是数组，可以将对象的值分解添加进数组，例如：['1','name','上海']
    });
    return data;
  },
  consolidateText: function (files) {
    var fileText = "";
    files.forEach((item) => {
      var lineText = "\r\n";
      var ignoreFlag = false;
      var hasChinese = false;
      item.textLine.forEach((line, key) => {
        // 检索所有包含中文的行
        // 去除注释的行
        if (!/\/\//.test(line)) {
          // 检索包含 /* 的行，设置忽略。
          if (/\/\*/.test(line)) {
            ignoreFlag = true;
            return;
          }
          // 检索包含 */ 的行，取消忽略。
          if (/\*\//.test(line)) {
            ignoreFlag = false;
            return;
          }
          if (ignoreFlag) return;
          if (/[\u4e00-\u9fa5]/g.test(line)) {
            line = line.match(
              /[\u4e00-\u9fa5\u3002\uff1b\uff0c\uff1a\u201c\u201d\uff08\uff09\u3001\uff1f\u300a\u300b"',\d]/g
            );
            line = line.join("");
            lineText += "Line:" + (key + 1) + " " + line + "\r\n";
            hasChinese = true;
          }
        }
      });
      if (hasChinese) {
        fileText += item.path + lineText + "\r\n";
      }
    });
    return fileText;
  },
};

var mainTask = function () {
  readFile.init();
};

module.exports = {
  mainTask,
  createFile,
};
