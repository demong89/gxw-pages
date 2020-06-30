
// gulp入口文件  任务都是异步的
// exports.foo = done =>{
//     console.log('hahhahah');
//     done();
// }

// exports.default = done =>{
//     console.log('default task');
//     done()
// }

// const gulp = require('gulp')
// gulp.task('bar',done=>{
//     console.log('4.0之前的方式');
//     done();
// })


// 组合任务
// const {series,parallel} = require('gulp')
// const task1 = done=>{
//     setTimeout(()=>{
//         console.log('task1');
//         done();
//     },1000)
// }
// const task2 = done=>{
//     setTimeout(()=>{
//         console.log('task2');
//         done();
//     },1000)
// }
// const task3 = done=>{
//     setTimeout(()=>{
//         console.log('task3');
//         done();
//     },1000)
// }

// exports.foo = series(task1,task2,task3); // 串行
// exports.bar = parallel(task1,task2,task3);//并行同步执行


// 异步任务
// const fs = require('fs')
// exports.cb = done=>{
//     console.log('cb task');
//     done()
// }

// exports.cb_error = done =>{
//     console.log();
//     done(new Error('task failed!'))
// }

// exports.promise = ()=>{
//     console.log('promise task');
//     return Promise.resolve()
// }
// exports.promise_error = ()=>{
//     console.log('promise task');
//     return Promise.reject(new Error('task failed'))
// }

// const timeout = time =>{
//     return new Promise(resolve=>{
//         setTimeout(resolve,time)
//     })
// }
// exports.async = async ()=>{
//     await timeout(1000)
//     console.log('async task');
// }

// // exports.stream = ()=>{
// //     const readStream  = fs.createReadStream('package.json')
// //     const writeStream = fs.createWriteStream('temp.txt')
// //     readStream.pipe(writeStream)
// //     return readStream
// // }


// exports.stream = done =>{
//     const readStream  = fs.createReadStream('package.json')
//     const writeStream = fs.createWriteStream('temp.txt')
//     readStream.pipe(writeStream)
//     readStream.on('end',()=>{
//         done()
//     })
// }


// gulp构建过程核心原理
// const fs = require('fs')
// const {Transform} = require('stream')
// exports.default = ()=>{
//     // 文件读取
//     const read = fs.createReadStream('a.css')
//     // 文件写入流
//     const write = fs.createWriteStream('a.min.css')

//     const transform = new Transform({
//         transform:(chunk,encoding,cb)=>{
//             const input = chunk.toString();
//             const output = input.replace(/\s+/g,'').replace(/\/\*.+?\*\//g,'')
//             cb(null,output)
//         }
//     })
//     // 把读取出来的文件流导入写入文件流

//     read.pipe(transform).pipe(write);
//     return read
// }

// 文件操作API + 插件的使用
// const {src,dest} = require('gulp')
// const cleanCss = require('gulp-clean-css') //插件
// const rename = require('gulp-rename')

// exports.default = ()=>{
//     return src('a.css')
//         .pipe(cleanCss())
//         .pipe(rename({extname:'.min.css'}))
//         .pipe(dest('dist'))
// }

const { src, dest, parallel, series, watch } = require('gulp')
const gulpLoadPlugins = require('gulp-load-plugins')

const browserSync = require('browser-sync')
const bs = browserSync.create()
const cwd = process.cwd();// 返回当前命令行工作目录

const plugins = gulpLoadPlugins()
const sass = require('gulp-sass')
const babel = require('gulp-babel')
const swig = require('gulp-swig')
const imagemin = require('gulp-imagemin')
// const useref = require('gulp-useref')

let config = {
  // default config
  build:{
    src:'src',
    dist:'dist',
    temp:'temp',
    public:'public',
    paths:{
      styles:'assets/style/*.scss',
      scripts:'assets/scripts/*.js',
      pages:'*.html',
      images:'assets/images/**',
      fonts:'assets/font/**'
    }
  }
}
try {
  const loadConfig = require(`${cwd}/pages.config.js`)
  config = Object.assign({},config,loadConfig)
} catch (error) {
  
}

const server = () => {
    watch(config.build.paths.styles,{cwd:config.build.src}, style)
    watch(config.build.paths.scripts,{cwd:config.build.src}, script)
    watch([config.build.paths.images, config.build.paths.fonts],{cwd:config.build.src}, bs.reload)

    bs.init({
        notify: false,//关闭右上角的tip
        port: 2080,//端口 
        open: false,//关闭自动打开浏览器
        files: `${config.build.dist}/**`,// 监听的目录
        server: {
            // baseDir:'dist',
            baseDir: [config.build.dist, config.build.src,config.build.public],
            routes: {
                '/node_modules': 'node_modules'
            }
        }
    })
}

// const data = {
// }
const del = require('del')
const clean = () => {
    return del([config.build.dist])
}

const style = () => {
    return src(config.build.paths.styles, { base: config.build.src,cwd:config.build.src})
        .pipe(sass({ outputStyle: 'expanded' }))
        .pipe(dest(config.build.dist))
}

const script = () => {
    return src(config.build.paths.scripts, { base: config.build.src,cwd:config.build.src })
        // 注意这里有修改 '@babel/preset-env'---> require('@babel/preset-env')
        .pipe(babel({ presets: [require('@babel/preset-env')] }))
        .pipe(dest(config.build.dist))
}

const page = () => {
    return src(config.build.paths.pages, { base: config.build.src,cwd:config.build.src })
        .pipe(swig({ data: config.data }))
        .pipe(dest(config.build.dist))
}

const image = () => {
    return src(config.build.paths.images, { base: config.build.src,cwd:config.build.src })
        .pipe(imagemin())
        .pipe(dest(config.build.dist))
}


const font = () => {
    return src(config.build.paths.fonts, { base: config.build.src,cwd:config.build.src })
        .pipe(imagemin())
        .pipe(dest(config.build.dist))
}

const extra = () => {
    return src(`${config.build.public}/**`, { base: config.build.public,cwd:config.build.public })
        .pipe(dest(config.build.dist))
}

const useref = () => {
    return src(`${config.build.dist}/*.html`, { base: config.build.dist })
        .pipe(plugins.useref({ searchPath: [config.build.dist, '.'] }))
        // html js css
        // gulp-html gulp-uglify gulp-clean-css
        .pipe(plugins.if(/\.js$/, plugins.uglify()))
        .pipe(plugins.if(/\.html$/, plugins.htmlmin({ collapseWhitespace: true, minifyCSS: true, minifyJS: true })))
        .pipe(plugins.if(/\.css$/, plugins.cleanCss()))

        .pipe(dest(config.build.dist))
}
const compile = parallel(style, script)
// page,image,font 任务开发时 不需要编译的
const build = series(clean, parallel(compile, page, image, font, extra))

const develop = series(compile, server)

module.exports = {
    compile,
    build,
    server,
    useref,
    clean
}