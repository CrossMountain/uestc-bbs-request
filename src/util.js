const cheerio = require("cheerio")
//获取cookie
function getCookieArr(arr) {
    const res = []
    arr.forEach((item, index) => {
        res.push(getStr(item, "", ";"))
    })
    return res
}

//获取 leftstr 与 rightstr 中间的字符串
function getStr(str, leftstr, rightstr) {
    if (!str) return ''
    const reg = new RegExp(leftstr + "([^;]+)" + rightstr)
    const res = str.match(reg)
    if (res) {
        return res[1]
    } else {
        return ''
    }
}

//HTML中获取指定selector的attribute的值
function HTMLExtractAttr(HTML, selector, attrName) {
    const $ = cheerio.load(HTML)
    const all = $(selector)
    const resArr = []
    all.each(function () {
        const a = $(this)
        resArr.push(a.attr(attrName))

    })
    return resArr
}

//数组去重
function arrReduce(arr) {
    const tempArr = arr.slice(0)
    for (let i = 0; i < tempArr.length; i++) {
        for (let j = i + 1; j < tempArr.length; j++) {
            if (tempArr[i] === tempArr[j]) {
                tempArr.splice(j, 1)
                j--
            }
        }
    }
    return tempArr
}

function getRandomItem(arr) {
    const { length } = arr
    const index = Math.floor(Math.random() * length)
    return arr[index]
}

module.exports = {
    getCookieArr,
    getStr,
    HTMLExtractAttr,
    arrReduce,
    getRandomItem
}
