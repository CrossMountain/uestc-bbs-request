var request = require('request');

var ops = require("./ops.js")
var util = require("./util.js")


var username = ops.username
var password = ops.password
if(!username){
    throw("请在ops.js里填写用户名")
}
if(!password){
    throw("请在ops.js里填写密码")
}
var targetURL = ops.targetURL
var content = ops.content


var loginCookieArr = [] //总的cookie矩阵


var baseURL = "http://bbs.uestc.edu.cn/"

//预登陆
var preLoginURL = baseURL + "member.php?mod=logging&action=login" //获取部分cookie
var preLoginOps = {
    url: baseURL + "member.php?mod=logging&action=login",
    method: "GET"
}
//发起HTTP语法,返回Promise对象
function requestPromise(ops) {
    return new Promise(function(resolve, reject) {
        request(ops, (err, res, body) => {
            if (err) {
                reject(err)
            } else {
                var obj = {
                    headers: res.headers,
                    body: body
                }
                resolve(obj)
            }
        })
    })
}

//获取登陆时的参数
function dealResToGetLoginOps(res) {
    var resArr = util.getCookieArr(res.headers["set-cookie"])
    loginCookieArr = loginCookieArr.concat(resArr) //存储起来

    var loginCookie = loginCookieArr.join(";")
    //获取loginURLHash
    var formIDValueArr = util.HTMLExtractAttr(res.body, "form", "id")
    var loginURLHash = ''
    formIDValueArr.forEach((item, index) => {
        loginURLHash = util.getStr(item, "loginform_", "") || loginURLHash
    })

    //获取formhash
    var formhashArr = util.HTMLExtractAttr(res.body, "input[name='formhash']", "value")
    var formhash = formhashArr[0] //登陆时的formhash
    var afterLoginURL = baseURL + "member.php?mod=logging&action=login&loginsubmit=yes&loginhash=" + loginURLHash + "&inajax=1"

    var data = {
        formhash: formhash,
        referer: baseURL,
        loginfield: "username",
        username: username,
        password: password,
        questionid: 0,
        answer: ''
    }
    var options = {
        url: afterLoginURL,
        method: "POST",
        headers: {
            cookie: loginCookie
        },
        form: data
    }
    return options
}
//获取formhash
function dealResToGetFormhashOps(res) {
    // console.log(res.body)
    if (res.body.indexOf("欢迎") !== -1) {
        console.log("登陆成功")
    } else {
        console.log("登陆失败")
    }

    var cookieArr = util.getCookieArr(res.headers["set-cookie"])
    loginCookieArr = loginCookieArr.concat(cookieArr) //存储起来
    loginCookieArr = util.arrReduce(loginCookieArr) //去重
    // console.log(loginCookieArr)

    var options = {
        url: targetURL, //请求formhash以及 fid
        method: "GET",
        headers: {
            Cookie: loginCookieArr.join(";")
        }
    }
    return options
}
//获取发贴参数
function dealResToGetPostOps(res) {

    var formActionValue = util.HTMLExtractAttr(res.body, "#fastpostform", "action")[0]
    var formhash = util.HTMLExtractAttr(res.body, "input[name='formhash']", "value")[0]

    var nextURL = baseURL + formActionValue

    var time = Math.floor(Date.now() / 1000)
    var data = {
        message: content,
        posttime: time,
        formhash: formhash,
        usesig: 1,
        subject: "  "
    }

    var options = {
        url: nextURL,
        method: "POST",
        headers: {
            Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8",
            "Accept-Encoding": "gzip, deflate",
            "Accept-Language": "zh-CN,zh;q=0.9",
            "Cache-Control": "no-cache",
            Connection: "keep-alive",

            "Content-Type": "application/x-www-form-urlencoded",
            DNT: 1,
            Pragma: "no-cache",

            Cookie: loginCookieArr.join(";"),
            Origin: "http://bbs.uestc.edu.cn",
            Host: "bbs.uestc.edu.cn",
            "Upgrade-Insecure-Requests": 1,
            Referer: targetURL,
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/66.0.3359.139 Safari/537.36"
        },
        form: data
    }
    return options
}
//获取发贴结果
function dealResToGetResult(res) {
    if (res.headers['location']) {
        console.log("发贴成功")
    } else {
        console.log("发贴失败")
    }
}

//顺序执行的队列
var taskQueue = [
    requestPromise,
    dealResToGetLoginOps,
    requestPromise,
    dealResToGetFormhashOps,
    requestPromise,
    dealResToGetPostOps,
    requestPromise,
    dealResToGetResult
]

//async/await串行执行
async function asyncFunc() {
    var temp = preLoginOps
    for (var i = 0; i < taskQueue.length; i++) {
        temp = await taskQueue[i](temp)
    }
}
asyncFunc()

//promise串行执行
function promiseFunc() {
    taskQueue.reduce((last, cur) => {
        return Promise.resolve(last).then(cur)
    }, Promise.resolve(preLoginOps))
}
// promiseFunc()