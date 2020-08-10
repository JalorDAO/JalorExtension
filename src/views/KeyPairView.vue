<template>
  <section class="network scroller">
    <section class="panel">
      <span class="tag">{{locale(langKeys.GENERIC_Blockchain)}}:</span>
      <el-select v-model="keypair.blockchain" @change="clearKey">
        <el-option
          v-for="item in blockchains"
          :key="item.key"
          :label="item.value.toUpperCase()"
          :value="item.value"
        ></el-option>
      </el-select>
      <cin
        :placeholder="locale(langKeys.PLACEHOLDER_Name)"
        :text="keypair.name"
        v-on:changed="changed => bind(changed, 'name')"
      ></cin>
      <el-tabs type="card" stretch v-model="keyType" @tab-click="clearKey" class="tabs">
        <el-tab-pane :label="locale(langKeys.PLACEHOLDER_PrivateKey)" :name="1">
          <cin
            :placeholder="locale(langKeys.PLACEHOLDER_PublicKey)"
            :disabled="true"
            :text="keypair.publicKey"
            v-on:changed="changed => bind(changed, 'publicKey')"
          ></cin>
          <cin
            type="password"
            :placeholder="locale(langKeys.PLACEHOLDER_PrivateKey)"
            @changed="makePublicKey"
            :text="keypair.privateKey"
            v-on:changed="changed => bind(changed, 'privateKey')"
          ></cin>
          <btn
            :text="locale(langKeys.BUTTON_GenerateKeyPair)"
            @click.native="generateKeyPair()"
            margined="true"
          ></btn>
        </el-tab-pane>
        <el-tab-pane :label="locale(langKeys.MNEMONIC_Header)" :name="2">
          <el-input
            type="textarea"
            :autosize="{ minRows: 2, maxRows: 4}"
            placeholder
            v-model="mnemonic"
          ></el-input>
        </el-tab-pane>
      </el-tabs>

      <div v-if="hasGenerate">
        <btn
          :text="locale(langKeys.BUTTON_SkipExportPrivate)"
          :is-red="true"
          half="true"
          @click.native="saveKeyPair(true)"
          margined="true"
        ></btn>
        <btn
          :text="locale(langKeys.BUTTON_ExportPrivate)"
          :is-blue="true"
          half="true"
          @click.native="saveKeyPair(false)"
          margined="true"
        ></btn>
      </div>
      <div v-else>
        <btn
          :text="locale(langKeys.GENERIC_Save)"
          :is-blue="true"
          @click.native="saveKeyPair(true)"
          margined="true"
        ></btn>
      </div>
      <!-- <btn :text="locale(langKeys.BUTTON_Copy)" half="true" @click.native="copyKeyPair()" margined="true"></btn> -->
    </section>

    <!-- INPUT FIELD USED FOR COPYING -->
    <input tabindex="-1" type="text" ref="copier" class="copier" />
  </section>
</template>

<script>
import { mapActions, mapGetters, mapState } from "vuex";
import * as Actions from "../store/constants";
import { RouteNames } from "../vue/Routing";
import Network from "../models/Network";
import Scatter from "../models/Scatter";
import AlertMsg from "../models/alerts/AlertMsg";
import * as AlertTypes from "../models/alerts/AlertTypes";
import IdentityService from "../services/IdentityService";
import { BlockchainsArray, Blockchains } from "../models/Blockchains";
import KeyPair from "../models/KeyPair";
import PluginRepository from "../plugins/PluginRepository";
import KeyPairService from "../services/KeyPairService";
import bip39 from "bip39";

const KeyTypes = {
  PRIVATE: 1,
  MNEMONIC: 2
};

export default {
  data() {
    return {
      blockchains: BlockchainsArray,
      keypair: KeyPair.placeholder(),
      isValid: false,
      hasGenerate: false,
      keyType: KeyTypes.PRIVATE,
      mnemonic: ""
    };
  },
  computed: {
    ...mapState(["scatter"]),
    ...mapGetters(["networks"])
  },
  methods: {
    clearKey() {
      this.hasGenerate = false;
      this.keypair.privateKey = "";
      this.keypair.publicKey = "";
    },
    bind(changed, field) {
      this.keypair[field] = changed.trim();
    },
    /* copyKeyPair(){
                const copier = this.$refs.copier;
                copier.value = `${this.locale(this.langKeys.PLACEHOLDER_PrivateKey)}:${this.keypair.privateKey}`;
                copier.select();
                document.execCommand("copy");
                copier.value = '';
            }, */
    async makePublicKey() {
      setTimeout(async () => {
        if (this.keypair.privateKey.length < 50) return false;

        // Special handling for malformatted ETH keypairs.
        /* if (this.keypair.privateKey.indexOf("0x") === 0)
          this.keypair.privateKey.replace("0x", ""); */

        this.isValid = false;

        await KeyPairService.makePublicKey(this.keypair);

        if (this.keypair.publicKey) this.isValid = true;
        else this[Actions.PUSH_ALERT](AlertMsg.InvalidPrivateKey());
      }, 100);
    },
    async generateKeyPair() {
      this.keypair.publicKey = "";
      this.keypair.privateKey = "";

      await KeyPairService.generateKeyPair(this.keypair);
      this.hasGenerate = true;

      if (this.keypair.publicKey.length) this.isValid = true;
    },
    async saveKeyPair(skip) {
      debugger;
      if (this.keyType == KeyTypes.MNEMONIC) {
        // convert mnemonic to private
        debugger;
        try {
          if (!bip39.validateMnemonic(this.mnemonic)) {
            return new Error("Mnemonic format error");
          }
          this.keypair.privateKey = await PluginRepository.plugin(
            this.keypair.blockchain
          ).mnemonicToPrivate(this.mnemonic);
          await KeyPairService.makePublicKey(this.keypair);
          if (this.keypair.publicKey) {
            this.isValid = true;
          } else {
            return this[Actions.PUSH_ALERT](AlertMsg.InvalidMnemonic());
          }
        } catch (err) {
          console.error(err);
          return this[Actions.PUSH_ALERT](AlertMsg.InvalidMnemonic());
        }
      }
      if (!this.isValid) {
        return this[Actions.PUSH_ALERT](AlertMsg.InvalidPrivateKey());
      }
      KeyPairService.saveKeyPair(this.keypair, this, () => {
        if (skip) {
          this.$router.back();
        } else {
          this.$router.replace({
            name: RouteNames.EXPORT,
            query: { unique: this.keypair.unique() }
          });
        }
      });
    },
    ...mapActions([Actions.UPDATE_STORED_SCATTER, Actions.PUSH_ALERT])
  }
};
</script>

<style lang="scss">
.network {
  font-family: "Open Sans", sans-serif;

  .panel {
    padding: 20px;

    .tag {
      padding: 5px;
      font-size: 18px;
    }

    // &:not(:last-child){
    //     border-bottom:1px solid #eaeaea;
    // }

    .header {
      color: #cecece;
      font-size: 11px;
      padding-bottom: 5px;
      margin-top: -5px;
      margin-bottom: 10px;
      border-bottom: 1px solid #eaeaea;
    }

    .sub-header {
      color: #aeaeae;
      font-size: 9px;
      margin-bottom: 20px;

      &.blue {
        color: blue;
      }

      &.red {
        color: red;
      }
    }
  }
}

.tabs {
  //   width: 100%;
  margin-top: 10px;
}
</style>
