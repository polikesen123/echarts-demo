// 实现一个登录的功能
let express = require('express');
let qs = require('qs');
let session = require('express-session');
let {
    readFile,
    writeFile
} = require('./promiseFs');
let app = express();
app.listen(3000, function () {
    console.log("后端接口服务 起于 3000")
})

// 解决跨域
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', 'http://localhost:8080')
    res.header('Access-Control-Allow-Credentials', true)
    res.header('Access-Control-Allow-Headers', "Content-Type,X-Agent,X-Token,X-Legacy-Token,X-Legacy-Uid,X-Legacy-Device-Id,X-Legacy-New-Token,X-Request-Id")
    req.method == 'OPTIONS' ? res.send('OK') : next();
})

// 把post请求的参数 转成普通对象 存放到req.body上
app.use((req, res, next) => {
    let str = '';
    req.on('data', (chunk) => {
        str += chunk;
    })
    req.on('end', () => {
        let obj = {};
        try {
            obj = JSON.parse(str)
        } catch (error) {
            obj = qs.parse(str)
        }
        req.body = obj;
        next();
    })
})
// 把读取数据的操作放到中间件处理
//用户登录信息
app.use((req, res, next) => {
    readFile('./json/userCount.json').then(data => {
        req.userData = JSON.parse(data);
        next()
    }).catch(err => {
        // 读取失败 给前端500
        res.status(500);
        res.send('找不到你要的数据哦');
    })
})

app.use(session({
    //在这个中间件之后 会在 req上多了一个 session的属性
    name: 'qqq', // 默认  connect.sid
    secret: 'myqqq', // session会根据 这个属性 和后端种在session的属性名 来生成对应的字段
    saveUninitialized: false,
    resave: false,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 30
    }
}));


app.get('/customer', function (req, res) {
    res.send({
        code: 0,
        data: req.userData
    })
})