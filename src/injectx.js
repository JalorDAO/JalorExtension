import IdGenerator from './util/IdGenerator';
import { EncryptedStream } from 'extension-streams';
import * as PairingTags from './messages/PairingTags'
import * as NetworkMessageTypes from './messages/NetworkMessageTypes'
// old scatter
import Scatterdapp from './scatterdapp'
import { getScatterJS } from './mockscatter/core'
import MockScatterEOS from './mockscatter/plugin-eosjs'

/***
 * This is the javascript which gets injected into
 * the application and facilitates communication between
 * Scatter and the web application.
 */
class Inject {

    constructor() {
        // Injecting an encrypted stream into the
        // web application.
        const stream = new EncryptedStream(PairingTags.INJECTED, IdGenerator.text(64));

        // Waiting for scatter to push itself onto the application
        stream.listenWith(msg => {
            if (msg && msg.hasOwnProperty('type') && msg.type === NetworkMessageTypes.PUSH_SCATTER) {
                const oldScatter = new Scatterdapp(stream, msg.payload);
                if (!window.scatter) {
                    window.scatter = oldScatter;
                }
                if (!window.ironman) {
                    window.ironman = oldScatter;
                }
                window.jalor = oldScatter;
                debugger
                oldScatter.getIdentity()

                // new version of scatter
                // const mockScatterJS = getScatterJS(stream)
                // setTimeout(() => {
                //     try {
                //         debugger
                //         let originScatterJS = {}
                //         if (window.ScatterJS && typeof window.ScatterJS !== 'undefined') {
                //             console.log("ScatterJS", ScatterJS)
                //             originScatterJS = ScatterJS
                //         }
                //         window.ScatterJS = new Proxy(originScatterJS, {
                //             get: function (instance, method) {
                //                 debugger
                //                 if (method === 'plugins') {
                //                     return function (plugin) {
                //                         debugger
                //                         if (plugin.name === 'eos') {
                //                             mockScatterJS.plugins(new MockScatterEOS());
                //                         } else {
                //                             originScatterJS.plugins(plugin)
                //                         }
                //                     }
                //                 } else if (method === 'scatter') {
                //                     const _scatter = originScatterJS.scatter ? originScatterJS.scatter : {}
                //                     return new Proxy(_scatter, {
                //                         get: function (_instance, _method) {
                //                             if (_method === 'identity') {
                //                                 return oldScatter.identity
                //                             } else if (!oldScatter[_method]) {
                //                                 console.error(`function not support ${_method}`)
                //                                 return _instance[_method]
                //                             }
                //                             debugger
                //                             return oldScatter[_method]
                //                         }
                //                     });
                //                 } else if (method === 'login') {
                //                     return function (param) {
                //                         return oldScatter.getIdentity(param)
                //                     }
                //                 } else if (method === 'logout') {
                //                     return function () {
                //                         return oldScatter.forgetIdentity()
                //                     }
                //                 } else if (method === 'account') {
                //                     return function (chain) {
                //                         return oldScatter.identity.accounts.find(x => x.blockchain === chain);
                //                     }
                //                 } else if (method === 'connect') {
                //                     return function () {
                //                         return Promise.resolve(true)
                //                     }
                //                 }
                //                 return mockScatterJS[method]
                //                 //     if (method === 'scatter') {
                //                 //         const _scatter = originScatterJS.scatter ? originScatterJS.scatter : {}
                //                 //         return new Proxy(_scatter, {
                //                 //             get: function (_instance, _method) {
                //                 //                 return oldScatter[_method] ? oldScatter[_method] : _instance[_method]
                //                 //             }
                //                 //         });
                //                 //     } else if (method === 'login') {
                //                 //         return function () {
                //                 //             return oldScatter.getIdentity()
                //                 //         }
                //                 //     } else if (method === 'account') {
                //                 //         return function (chain) {
                //                 //             return oldScatter.identity.accounts.find(x => x.blockchain === chain);
                //                 //         }
                //                 //     }
                //                 //     return oldScatter[method] ? oldScatter[method] : instance[method];
                //             }
                //         })
                //     } catch (e) {
                //         console.error(e);
                //     }
                // }, 500)
            }
        });

        // Syncing the streams between the
        // extension and the web application
        stream.sync(PairingTags.SCATTER, stream.key);
    }

}

new Inject();




