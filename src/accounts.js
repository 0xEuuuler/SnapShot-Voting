const fs = require('fs');
const csv = require('csv-parser');

async function getAccounts(path) {
    return new Promise((resolve, rejects) => {
        const accounts = [];
        fs.createReadStream(path)
        .pipe(csv()) // 使用 csv-parser 模块进行解析
        .on('data', (row) => {
            accounts.push(row);
        })
        .on('end', () => {
            console.log('账号读取完成');
            resolve(accounts);
        })
        .on('error', (error) => {
            reject(error);
        });
    }); 
}

module.exports = {
    getAccounts
}