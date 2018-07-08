var cheerio=require("cheerio")
//获取cookie
function getCookieArr(arr) {
    var res = []
    arr.forEach((item, index) => {
        res.push(getStr(item, "", ";"))
    })
    return res
}

//获取leftstr与rightstr中间的字符串
function getStr(str, leftstr, rightstr) {
    if (!str) return ''
    var reg = new RegExp(leftstr + "([^;]+)" + rightstr)
    var res = str.match(reg)
    if (res) {
        return res[1]
    } else {
        return ''
    }

}

//HTML中获取指定selector的attribute的值
function HTMLExtractAttr(HTML, selector, attrName) {
    var $ = cheerio.load(HTML)
    var all = $(selector)
    var resArr = []
    all.each(function() {
        var a = $(this)
        resArr.push(a.attr(attrName))

    })
    return resArr
}

//数组去重
function arrReduce(arr) {
    var tempArr = arr.slice(0)
    for (var i = 0; i < tempArr.length; i++) {
        for (var j = i + 1; j < tempArr.length; j++) {
            if (tempArr[i] === tempArr[j]) {
                tempArr.splice(j, 1)
                j--
            }
        }
    }
    return tempArr
}

var util={
    getCookieArr:getCookieArr,
    getStr:getStr,
    HTMLExtractAttr:HTMLExtractAttr,
    arrReduce:arrReduce
}

module.exports=util