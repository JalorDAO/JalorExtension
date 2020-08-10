<template>
    <nav :class="navState()">
        <section v-if="logo&&showLogo()">
            <figure class="img">
                <img style="width:50%" src="../copied/icon.png">
            </figure>
             <figure class="logo">Jalor</figure>
        </section>
        <section class="breadcrumb" v-if="!showMain()">
            <figure class="icon" v-on:click="back">
                <i class="fa fa-chevron-left"></i>
            </figure>
            <figure class="route">{{breadcrumb()}}</figure>
        </section>
        <figure class="settings-button" v-on:click="toggleSettings">
            <i class="fa fa-gear"></i>
        </figure>
    </nav>
</template>

<script>
    import { mapActions, mapGetters, mapState } from 'vuex'
    import {RouteNames} from '../vue/Routing'

    export default {
        data(){
            return {logo : null}
        }, 
        computed: {
            ...mapState([
                'scatter'
            ])
        },
        created: async function(){
            this.logo = await new Promise(resolve=>{
                setTimeout(()=>{
                    resolve(this.showLogo())
                },300)
            })
        },
        updated: function(){
            this.showLogo()
        },
        methods: {
            back(){ this.$router.back() },
            showLogo(){
                switch(this.$route.name){
                    case RouteNames.ENTRY:
                        this.logo =  true;
                        break;
                    default: 
                        this.logo =  false;
                }
                return this.logo
            },
            showMain(){
                switch(this.$route.name){
                    case RouteNames.ENTRY:
                    case RouteNames.MAIN_MENU:
                    case RouteNames.FIRST_TIME:
                    case RouteNames.ONBOARDING:
                    case RouteNames.SHOW_MNEMONIC: return true;
                    default: return false;
                }
            },
            navState(){
                switch(this.$route.name){
                    case RouteNames.ENTRY: if(this.scatter.settings.hasEncryptionKey) return 'locked';
                                           else return 'no-chain';
                    case RouteNames.MAIN_MENU: return 'main-menu-nav';
                    default: return '';
                }
            },
            breadcrumb(){
                // TODO: Localize
                switch(this.$route.name){
                    case RouteNames.LOAD_FROM_BACKUP: return this.locale(this.langKeys.BUTTON_ImportKeychain);
                    case RouteNames.SETTINGS: return this.locale(this.langKeys.MAINMENU_Settings);
                    case RouteNames.TRANSFER: return 'Transfer';
                    case RouteNames.IDENTITIES: return this.locale(this.langKeys.MAINMENU_Identities);
                    case RouteNames.IDENTITY: return this.locale(this.langKeys.GENERIC_Identity);
                    case RouteNames.PERMISSIONS:
                    case RouteNames.DOMAIN_PERMISSIONS: return this.locale(this.langKeys.MAINMENU_Permissions);
                    case RouteNames.HISTORY: return 'History';
                    case RouteNames.NETWORKS:  return this.locale(this.langKeys.SETTINGSMENU_Networks);
                    case RouteNames.NETWORK: return this.locale(this.langKeys.SETTINGSMENU_Network);
                    case RouteNames.CHANGE_PASSWORD: return this.locale(this.langKeys.SETTINGSMENU_Password);
                    case RouteNames.BACKUP:
                    case RouteNames.EXPORT_JSON:  return this.locale(this.langKeys.SETTINGSMENU_Backup);
                    case RouteNames.DESTROY: return 'Destroy';
                    case RouteNames.AUTO_LOCK: return this.locale(this.langKeys.SETTINGSMENU_AutoLock);
                    case RouteNames.LANGUAGE: return this.locale(this.langKeys.SETTINGSMENU_Language);
                    case RouteNames.KEYPAIRS: 
                    case RouteNames.KEYS: return this.locale(this.langKeys.SETTINGSMENU_Keypairs);
                    case RouteNames.QRCODE:  return this.locale(this.langKeys.SETTINGSMENU_Qrcode);
                    case RouteNames.EXPORT:  return this.locale(this.langKeys.SETTINGSMENU_ExportPrivate);

                }
                return 'Undefined'
            },
            toggleSettings(){
                if(this.$route.name === RouteNames.SETTINGS) this.back();
                else this.$router.push({name:RouteNames.SETTINGS})
            }
        },
    }
</script>

<style lang="scss">
    nav {
        height:600px;
        max-height:60px;
        line-height:60px;
        background:#fff;
        transition:all 0.2s ease;
        transition-property: max-height, line-height, background;
        padding:0 20px;
        overflow:hidden;
        /*border-bottom:1px solid #f9f9f9;*/
        position: relative;
        z-index:2;

        .logo {
            font-family: 'Raleway', sans-serif;
            font-size:22px;
            color:#888888;
            width:calc(100% - 60px);
            float:left;
        }

        .settings-button {
            cursor: pointer;
            float: right;
            height: 60px;
            margin-left:10px;
            line-height: 59px;
            font-size: 24px;
            text-align:right;
            color: #d6d6d6;
        }

        .breadcrumb {
            width:calc(100% - 60px);
            float:left;

            .icon {
                cursor: pointer;
                display:inline-block;
                font-size:18px;
                color:#dbdbdb;
                padding-right:15px;
                transition: color 0.2s ease;

                &:hover {
                    color:rgba(0,0,0,0.3);
                }
            }

            .route {
                display:inline-block;
                font-family:'Raleway', sans-serif;
                font-size:18px;
                color:#a5a5a5;
                vertical-align: top;
            }
        }

        &.no-chain {
            max-height:299px;
            line-height:299px;

            .img {
                padding-top: 15%;
                max-height:200px;
                line-height:200px;
                text-align:center;
            }
            .logo {
                max-height:99px;
                line-height:99px;
                font-size:50px;
                color:#656565;
                width:100%;
                text-align:center;
            }
        }

        &.locked {
            max-height:450px;

            .img {
                padding-top: 40%;
                max-height:300px;
                line-height:300px;
                text-align:center;
            }
            .logo {
                max-height:150px;
                line-height:150px;
                font-size:64px;
                color:#656565;
                width:100%;
                text-align:center;
            }
        }

        &.main-menu-nav {
            background:#f9f9f9;
        }
    }
</style>
