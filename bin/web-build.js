#!/usr/bin/env node
/*
 * @Date: 2020-10-26 17:28:45
 * @FilePath: /class/structure/web-build/bin/web-build.js
 * @Autor: wangjiguang
 * @LastEditors: Do not edit
 * @LastEditTime: 2020-10-26 17:39:06
 * @Description: 
 */

 process.argv.push('--cwd')
 process.argv.push(process.cwd())
 process.argv.push('--gulpfile')
 process.argv.push(require.resolve('..'))
//  console.log(process.argv)
require('gulp/bin/gulp')