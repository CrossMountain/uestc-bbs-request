const axios = require('axios');

const {
  getLoginOps,
  getFormhashOps,
  getPostOps,
  getResult
} = require('./task.js');

async function post(targetURL) {
  const preLoginRes = await axios.get(
    'http://bbs.uestc.edu.cn/member.php?mod=logging&action=login'
  );

  const loginOptions = getLoginOps(preLoginRes);

  const loginRes = await axios(loginOptions);
  const payload = getFormhashOps(loginRes, targetURL);

  const res = await axios(payload);

  const postOpstions = getPostOps(res);
  const postRes = await axios(postOpstions);

  getResult(postRes);
}

module.exports = { post };
