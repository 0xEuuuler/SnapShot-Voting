const axios = require("axios");
const {ethers} = require("ethers");
const web3 = require('web3');

const settings = require('./settings.js')

const provider = new ethers.providers.JsonRpcProvider(settings.ETH_NODE_URL);

async function getSignature(account, signData, provider) {
    const { domain, types, message } = signData.data
    const signer = new ethers.Wallet(account.privateKey, provider)
    return await signer._signTypedData(domain, types, message)
}

async function sendVoteRequest(data) {
    const config = {
      method: 'post',
      url: 'https://hub.snapshot.org/api/msg',
      headers: {
        'authority': 'hub.snapshot.org',
        'accept': 'application/json',
        'accept-language': 'zh-CN,zh;q=0.9,en;q=0.8',
        'content-type': 'application/json',
        'origin': 'https://snapshot.org',
        'referer': 'https://snapshot.org/',
        'sec-ch-ua': '"Google Chrome";v="105", "Not)A;Brand";v="8", "Chromium";v="105"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"macOS"',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-site',
        'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/105.0.0.0 Safari/537.36'
      },
      data: JSON.stringify(data)
    //   proxy: {
    //     host: "185.65.205.230",
    //     port: 50101, // VPN 代理的端口号
    //     auth: {
    //         username: 'euuuler0814', 
    //         password: 'Cht8CBvhxU.' 
    //     }
    //   }
    };
  
    try {
      const res = await axios(config)
      if (res.data.id) {
        console.log(`${data.address} 投票成功`);
      }
    } catch (error) {
      console.log(`${data.address} 投票失败`, JSON.stringify(error.response));
    }
}

async function vote(account, space, proposal, choice) {
    const checksum_address = web3.utils.toChecksumAddress(account.address)
    const data = {
      "address": checksum_address,
      "data": {
        "domain": {
          "name": "snapshot",
          "version": "0.1.4"
        },
        "types": {
          "Vote": [
            {
              "name": "from",
              "type": "address"
            },
            {
              "name": "space",
              "type": "string"
            },
            {
              "name": "timestamp",
              "type": "uint64"
            },
            {
              "name": "proposal",
              "type": "string"
            },
            {
              "name": "choice",
              "type": "uint32"
            },
            {
              "name": "reason",
              "type": "string"
            },
            {
              "name": "app",
              "type": "string"
            }
          ]
        },
        "message": {
          "space": space,
          "proposal": proposal,
          "choice": choice,
          "app": "snapshot",
          "reason": "",
          "from": checksum_address,
          "timestamp": Math.floor(Date.now() / 1000)
        }
      }
    }
    data.sig = await getSignature(account, data, provider)
    await sendVoteRequest(data)
}

async function getActiveProposals(space) {
    const url = 'https://hub.snapshot.org/graphql?';
    const data = {
        query: `query Proposals {
          proposals(first: 20, skip: 0, where: {space_in: ["${space}"], state: "active"}, orderBy: "created", orderDirection: desc) {
            id
            title
            body
            choices
            start
            end
            snapshot
            state
            author
            type
            app
            space {
              id
              name
            }
          }
        }`
    }
    const res = await axios.post(url, data);
    return res.data.data.proposals;
}

module.exports = {
    getActiveProposals,
    vote
}