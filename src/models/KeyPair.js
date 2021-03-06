import AES from 'aes-oop';

import {Blockchains} from './Blockchains';

export default class KeyPair {

    constructor(){
        this.blockchain = Blockchains.EOS;
        this.name = '';
        this.privateKey = '';
        this.publicKey = '';
    }

    static placeholder(){ return new KeyPair(); }
    static fromJson(json){ return Object.assign(this.placeholder(), json); }

    unique(){ return `${this.blockchain}:${this.publicKey.toLowerCase()}`; }

    static blockchain(publicKey){
        if(publicKey.indexOf('ENU') !== -1) return Blockchains.ENU;
        if(publicKey.indexOf('EOS') !== -1) return Blockchains.EOS;
        if(publicKey.indexOf('FO') !== -1) return Blockchains.FIBOS;
        if(publicKey.indexOf('GOC') !== -1) return Blockchains.GOC;
        if(publicKey.indexOf('0x') !== -1 && publicKey.length === 42) return Blockchains.ETH;
        return null;
    }

    /***
     * Checks whether a private key is encrypted
     * @returns {boolean}
     */
    isEncrypted(){ switch(this.blockchain) {
        // EOS private keys are 51 chars long
        case Blockchains.EOS: return this.privateKey.length > 51;
        // ENU private keys are 51 chars long
        case Blockchains.ENU: return this.privateKey.length > 51;
        // FIBOS private keys are 51 chars long
        case Blockchains.FIBOS: return this.privateKey.length > 51;
        // GOC private keys are 51 chars long
        case Blockchains.GOC: return this.privateKey.length > 51;
        // ETH private keys are 64 chars long
        case Blockchains.ETH: return this.privateKey.length > 66;
    }}

    /***
     * Encrypts this KeyPair's Private Key
     * @param seed - The seed to encrypt with
     */
    encrypt(seed){
        if(!this.isEncrypted())
            this.privateKey = AES.encrypt(this.privateKey, seed);
    }

    /***
     * Decrypts this KeyPair's Private Key
     * @param seed - The seed to decrypt with
     */
    decrypt(seed){
        if(this.isEncrypted())
            this.privateKey = AES.decrypt(this.privateKey, seed);
    }
}
