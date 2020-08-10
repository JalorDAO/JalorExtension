import * as PluginTypes from './PluginTypes';
import EOS from './defaults/eos';
import ENU from './defaults/enu';
import ETH from './defaults/eth';
import FIBOS from './defaults/fibos';
import GOC from './defaults/goc';

/***
 * Setting up for plugin based generators,
 * this will add more blockchain compatibility in the future.
 */

class PluginRepositorySingleton {

    constructor() {
        this.plugins = [];
        this.loadPlugins();
    }

    loadPlugins() {
        this.plugins.push(new EOS());
        this.plugins.push(new ENU());
        // this.plugins.push(new ETH());
        this.plugins.push(new FIBOS());
        this.plugins.push(new GOC());
        // this.plugins.push(new YAS());
    }

    signatureProviders() {
        return this.plugins.filter(plugin => [PluginTypes.EOSIO, PluginTypes.ETHEREUM].includes(plugin.type));
    }

    /* supportedBlockchains() {
        return this.signatureProviders().map(plugin => name)
    } */

    plugin(name) {
        return this.plugins.find(plugin => plugin.name === name);
    }

    async endorsedNetworks() {
        return await Promise.all(this.signatureProviders().map(async plugin => await plugin.getEndorsedNetwork()));
    }
}

const PluginRepository = new PluginRepositorySingleton();
export default PluginRepository;
