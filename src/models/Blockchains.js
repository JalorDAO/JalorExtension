
export const Blockchains = {
    EOS: 'eos',
    ENU: 'enu',
    FIBOS: 'fibos',
    GOC: 'goc',
    // ETH: 'eth',
    // YAS: 'yas'
};

export const chainTypes = {
    EOSIO: 'eosio',
    ETHEREUM: 'ethereum'
}

export const getChainType = function (blockchain) {
    switch (blockchain) {
        case Blockchains.ETH:
            return chainTypes.ETHEREUM;
        default:
            return chainTypes.EOSIO;
    }
}

export const BlockchainsArray =
    Object.keys(Blockchains).map(key => ({ key, value: Blockchains[key] }));
