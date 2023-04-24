const { vote, getActiveProposals } = require('./snapshot')
const { getAccounts } = require('./accounts')
const settings = require('./settings.js')

const main = async () => {
    const wallets = await getAccounts(settings.WALLET_PATH);
    const proposals = await getActiveProposals(settings.SPACE);
    console.log(`成功获取${proposals.length}个活跃提案`);
    for(const wallet of wallets) {
        for(const proposal of proposals) {
            console.log(`Account: ${wallet.id} 投票进行中： ${settings.SPACE} - ${proposal.title} - ${proposal.choices[settings.CHOCIE - 1]}`);
            await vote(wallet, settings.SPACE, proposal.id, settings.CHOCIE)
        }
    }
}

main();
