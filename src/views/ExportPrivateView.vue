<template>
    <section class="backup scroller qrcode">

        <!-- Unverified -->
        <section class="panel" v-if="!verified">
            <figure class="header">{{locale(langKeys.GENERIC_VerifyPassword_Header)}}</figure>
            <figure class="sub-header">{{locale(langKeys.GENERIC_VerifyPassword_Description)}}</figure>
            <cin :placeholder="locale(langKeys.PLACEHOLDER_Password)" type="password" v-on:changed="changed => bind(changed, 'password')" :key="1"></cin>
            <btn v-on:clicked="verifyCurrentPassword" :text="locale(langKeys.PLACEHOLDER_ConfirmPassword)" :margined="true"></btn>
        </section>

        <!-- Verified -->
        <section class="panel" v-else>
            <figure class="header">{{locale(langKeys.BACKUP_Header)}}</figure>
            <figure class="sub-header">{{locale(langKeys.BACKUP_Key_Description)}}</figure>
            <div v-if="!qrcode">
                <btn v-on:clicked="exportBackup" :text="locale(langKeys.BUTTON_ExportPrivate)" is-red="true" :margined="true"></btn>
            </div>            
        </section>

        <!-- qrcode -->
        <canvas id="canvas"></canvas>

        <!-- privatekey -->
        <section class="panel" v-if="qrcode">
            <figure class="header">{{locale(langKeys.PLACEHOLDER_PrivateKey)}}</figure>
            <figure class="sub-header">{{qrcode}}</figure>   
            <btn v-on:clicked="copyPrivate" :text="locale(langKeys.BUTTON_Copy)" is-red="true" :margined="true"></btn>
            <btn v-on:clicked="done" :text="locale(langKeys.GENERIC_Done)" :margined="true"></btn>              
        </section>

        <!-- INPUT FIELD USED FOR COPYING -->
        <input tabindex="-1" type="text" ref="copier" class="copier" />

    </section>
</template>

<script>
    import { mapActions, mapGetters, mapState } from 'vuex'
    import * as Actions from '../store/constants';
    import { RouteNames } from '../vue/Routing'
    import AlertMsg from '../models/alerts/AlertMsg'
    import Mnemonic from '../util/Mnemonic'
    import AuthenticationService from '../services/AuthenticationService' 
    import AES from 'aes-oop';
    import QRCode from "qrcode";

    export default {
        data(){ return {
            password:'',
            verified:false,
            keypair:{},
            qrcode:''
        }},
        mounted(){
            const unique = this.$route.query.unique
            this.keypair = this.keypairs.find( keypair => keypair.unique() === unique) 
        },
        computed: {
            ...mapState([
                // 'scatter'
            ]),
            ...mapGetters([
                'keypairs'
            ])
        },
        methods: {
            bind(changed, original) { this[original] = changed },
            verifyCurrentPassword(){
                AuthenticationService.verifyPassword(this.password, this).then(() => {
                    this.verified = true;
                });
            },
            async exportBackup(){
                const [mnemonic, seed] = await Mnemonic.generateMnemonic(this.password);
                if(!seed) return false;

                this.keypair.decrypt(seed)
                this.qrcode = this.keypair.privateKey
                this.showQrcode(this.qrcode)
            },
            showQrcode(qrcode){
                QRCode.toCanvas(
                    document.getElementById("canvas"),
                    qrcode,
                    // { version: 5 },
                    function(error) {
                        if (error) console.error(error);
                        //   console.log("success!");
                    }
                );
            },
            copyPrivate(){
                this[Actions.PUSH_ALERT](AlertMsg.ConfirmCopy()).then(accepted => {
                    if(!accepted || !accepted.hasOwnProperty('accepted')) return false;
                    const copier = this.$refs.copier;
                    copier.value = this.qrcode;
                    copier.select();
                    document.execCommand("copy");
                    copier.value = '';
                })
            },
            done(){
                this.$router.back()
            },
            ...mapActions([
                Actions.PUSH_ALERT,
                Actions.SET_SEED,
                Actions.IS_UNLOCKED,
            ])
        }
    }
</script>

<style lang="scss">
    .checkbox {
        width:56px;
        float:left;
        margin-right:15px;
    }
    .backup {
        font-family:'Open Sans', sans-serif;

        .panel {
            padding:20px;

            .header {
                color:#cecece;
                font-size:11px;
                padding-bottom:5px;
                margin-top:-5px;
                margin-bottom:10px;
                border-bottom:1px solid #eaeaea;
            }

            .sub-header {
                color:#aeaeae;
                font-size:9px;
                margin-bottom:10px;
            }

        }
    }
    .qrcode {
        // padding-top: 30%;
        text-align: center;
        // width: 100%;
    }

</style>
