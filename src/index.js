var task = require("./task.js")

var initOps = task.init()

//async/await串行执行
async function asyncFunc() {
    var temp = initOps
    try{
       for (var i = 0; i < task.taskQueue.length; i++) {
           temp = await task.taskQueue[i](temp)
       } 
   }catch(e){
        console.log(e)
   }
}


//promise串行执行
function promiseFunc() {
    task.taskQueue.reduce((last, cur) => {
        return Promise.resolve(last).then(cur)
    }, initOps)
}

asyncFunc()
// promiseFunc()