const qs = require('querystring')

const ops = require('./ops.js')
const util = require('./util.js')

const { username, password, targetURL, randomContent } = ops

const content = util.getRandomItem(randomContent)

if (!username || !password) {
    throw ('请在ops.js里填写用户名或者密码')
}


let loginCookieArr = [] //总的cookie矩阵

const baseURL = 'http://bbs.uestc.edu.cn/'

//获取登陆时的参数
function getLoginOps(res) {
    const resArr = util.getCookieArr(res.headers['set-cookie'])
    loginCookieArr = loginCookieArr.concat(resArr) //存储起来

    const loginCookie = loginCookieArr.join(';')
    //获取loginURLHash
    const formIDValueArr = util.HTMLExtractAttr(res.data, 'form', 'id')
    let loginURLHash = ''
    formIDValueArr.forEach((item, index) => {
        loginURLHash = util.getStr(item, 'loginform_', '') || loginURLHash
    })

    //获取formhash
    const formhashArr = util.HTMLExtractAttr(res.data, 'input[name="formhash"]', 'value')
    const formhash = formhashArr[0] //登陆时的formhash
    const afterLoginURL = baseURL + 'member.php?mod=logging&action=login&loginsubmit=yes&loginhash=' + loginURLHash + '&inajax=1'

    const data = {
        formhash: formhash,
        referer: baseURL,
        loginfield: 'username',
        username: username,
        password: password,
        questionid: 0,
        answer: ''
    }
    const options = {
        url: afterLoginURL,
        method: 'post',
        headers: {
            'Cookie': loginCookie,
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        data: qs.stringify(data)
    }
    return options
}

//获取formhash
function getFormhashOps(res) {
    // console.log(res.data)
    if (res.data.indexOf('欢迎') !== -1) {
        console.log('登陆成功')
    } else {
        console.log('登陆失败')
    }

    const cookieArr = util.getCookieArr(res.headers['set-cookie'])
    loginCookieArr = loginCookieArr.concat(cookieArr) //存储起来
    loginCookieArr = util.arrReduce(loginCookieArr) //去重

    return {
        url: targetURL, //请求formhash以及 fid
        method: 'get',
        headers: {
            'Cookie': loginCookieArr.join(';')
        }
    }
}
//获取发贴参数
function getPostOps(res) {
    const formActionValue = util.HTMLExtractAttr(res.data, '#fastpostform', 'action')[0]
    const formhash = util.HTMLExtractAttr(res.data, 'input[name="formhash"]', 'value')[0]

    const nextURL = baseURL + formActionValue + '&inajax=1'

    const time = Math.floor(Date.now() / 1000)
    const data = {
        message: content,
        posttime: time,
        formhash: formhash,
        usesig: 1,
        subject: '  '
    }


    return {
        url: nextURL,
        method: 'post',
        headers: {
            Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
            'Accept-Encoding': 'gzip, deflate',
            'Accept-Language': 'zh-CN,zh;q=0.9',
            'Cache-Control': 'no-cache',
            Connection: 'keep-alive',

            'Content-Type': 'application/x-www-form-urlencoded',
            DNT: 1,
            Pragma: 'no-cache',

            Cookie: loginCookieArr.join(';'),
            Origin: 'http://bbs.uestc.edu.cn',
            Host: 'bbs.uestc.edu.cn',
            'Upgrade-Insecure-Requests': 1,
            Referer: targetURL,
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/66.0.3359.139 Safari/537.36'
        },
        data: qs.stringify(data)
    }
}

//获取发贴结果
function getResult(res) {
    if (res.data.includes('回复发布成功')) {
        console.log('发贴成功')
    } else {
        console.log('发贴失败')
    }
}

module.exports = {
    getLoginOps,
    getFormhashOps,
    getPostOps,
    getResult
}