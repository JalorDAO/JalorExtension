<template>
  <section class="identity scroller" v-if="identity">
    <!-- <nav-actions :actions="[
            {event:'submit', text:locale(langKeys.GENERIC_Save)}
    ]" v-if="!saving" v-on:submit="saveIdentity"></nav-actions>-->

    <!-- Disabling -->
    <section class="panel" style="background:#fff;" v-if="!isNew">
      <figure class="header">{{locale(langKeys.IDENTITY_DisablingHeader)}}</figure>
      <figure
        class="sub-header"
        style="margin-bottom:0;"
      >{{locale(langKeys.IDENTITY_DisablingDescription)}}</figure>
    </section>

    <!-- Account -->
    <section class="panel" v-if="keypairs.length">
      <figure class="header">{{locale(langKeys.IDENTITY_AccountHeader)}}</figure>
      <figure
        class="sub-header"
        style="margin-bottom:0;"
      >{{locale(langKeys.IDENTITY_AccountDescription)}}</figure>

      <figure class="header">{{locale(langKeys.SETTINGSMENU_Network)}}</figure>
      <sel
        :disabled="importing"
        :selected="networks[0]"
        :options="networks"
        :parser="(network) => network.name.length ? network.name : network.unique()"
        v-on:changed="selectNetwork"
      ></sel>

      <figure class="header">{{locale(langKeys.SETTINGSMENU_Keypairs)}}</figure>

      <!-- <cin :disabled="importing"
                 v-if="identity.networkedAccount(selectedNetwork)"
                 :tag="identity.networkedAccount(selectedNetwork).name"
                 :text="identity.networkedAccount(selectedNetwork).name"
      v-on:untagged="removeAccount"></cin>-->

      <sel
        v-if="selectedKeypairs.length>0"
        :disabled="importing"
        :selected="selectedKeypair"
        :options="selectedKeypairs"
        :parser="keypair => keypair.name"
        v-on:changed="selectKeypair"
      ></sel>

      <!-- <btn :disabled="importing || !selectedKeypair || !selectedKeypair.publicKey.length"
                 :text="locale(langKeys.GENERIC_Identity)" is-blue="true"
      v-on:clicked="importAccount" margined="true"></btn>-->

      <div v-if="!showInput">
        <btn
          :disabled="importing || !selectedKeypair || !selectedKeypair.publicKey.length"
          :text="locale(langKeys.GENERIC_Scan_Identity)"
          is-blue="true"
          half="true"
          v-on:clicked="importAccount"
          margined="true"
        ></btn>
        <btn
          :disabled="importing || !selectedKeypair || !selectedKeypair.publicKey.length"
          :text="locale(langKeys.GENERIC_Input_Identity)"
          half="true"
          v-on:clicked="showInputFunc"
          margined="true"
        ></btn>
      </div>

      <div v-if="showInput">
        <figure class="header">{{locale(langKeys.GENERIC_Input_Identity)}}</figure>
        <cin
          :placeholder="locale(langKeys.GENERIC_Input_Identity)"
          :text="accountNameOrPrivateKey"
          v-on:changed="changed => bind(changed, 'accountNameOrPrivateKey')"
        ></cin>
        <btn
          :disabled="importing || !selectedKeypair || !selectedKeypair.publicKey.length"
          :text="locale(langKeys.GENERIC_Scan_Identity)"
          is-blue="true"
          v-on:clicked="inputAccount"
          margined="true"
        ></btn>
      </div>
    </section>

    <!-- NO KEY PAIRS -->
    <!-- <section class="panel" v-else>
            <figure class="header">{{locale(langKeys.IDENTITY_NoKeyPairsHeader)}}</figure>
            <figure class="sub-header" style="margin-bottom:0;">{{locale(langKeys.IDENTITY_NoKeyPairsDescription)}}{{locale(langKeys.SETTINGSMENU_Keypairs)}}</figure>
    </section>-->

    <!-- IMPORT KEY PAIRS -->
    <section class="panel">
      <figure class="header">{{locale(langKeys.GENERIC_No_key)}}</figure>
      <figure
        class="sub-header"
        style="margin-bottom:0;"
      >{{locale(langKeys.IDENTITY_NoKeyPairsDescription)}}{{locale(langKeys.SETTINGSMENU_Keypairs)}}</figure>
      <btn :text="locale(langKeys.GENERIC_Import_key)" v-on:clicked="importKeys" margined="true"></btn>
    </section>
  </section>
</template>

<script>
import { mapActions, mapGetters, mapState } from "vuex";
import * as Actions from "../store/constants";
import { RouteNames } from "../vue/Routing";
import Identity from "../models/Identity";
import Scatter from "../models/Scatter";
import Account from "../models/Account";
import KeyPair from "../models/KeyPair";
import { LocationInformation } from "../models/Identity";
import AlertMsg from "../models/alerts/AlertMsg";
import IdentityService from "../services/IdentityService";
import AccountService from "../services/AccountService";
import { Countries } from "../data/Countries";
import PluginRepository from "../plugins/PluginRepository";
import { Blockchains } from "../models/Blockchains";
// import RIDLService from '../services/RIDLService'

export default {
  data() {
    return {
      identity: null,
      accountNameOrPrivateKey: "",
      isNew: false,
      countries: Countries,
      // selectedLocation:null,
      selectedNetwork: null,
      selectedKeypair: null,
      selectedKeypairs: [],
      importing: false,
      noKeypair: KeyPair.fromJson({ name: "None" }),
      registeringIdentity: false,
      newName: "",
      saving: false,
      showInput: false,
    };
  },
  computed: {
    ...mapState(["scatter"]),
    ...mapGetters(["networks", "keypairs"]),
  },
  mounted() {
    debugger;
    this.selectNetwork(this.networks[0]);
    const existing = this.scatter.keychain.identities.find(
      (x) => x.publicKey === this.$route.query.publicKey
    );
    if (existing) this.identity = existing.clone();
    else {
      this.identity = Identity.placeholder();
      this.identity.initialize(this.scatter.hash).then(() => {
        this.identity.name = `${this.locale(
          this.langKeys.GENERIC_New
        )} ${this.locale(this.langKeys.GENERIC_Identity)}`;
      });
    }

    // this.selectedLocation = this.identity.defaultLocation();

    this.isNew = !existing;
  },
  methods: {
    registerIdentity() {
      if (!this.registeringIdentity) return (this.registeringIdentity = true);
    },
    /* async claimIdentity(){
                const updatedIdentity = await RIDLService.claimIdentity(this.newName, this.identity.clone(), this).catch(() => null);
                if(updatedIdentity) {
                    const scatter = this.scatter.clone();
                    this.identity.name = updatedIdentity.name;
                    scatter.keychain.updateOrPushIdentity(updatedIdentity);
                    await this[Actions.UPDATE_STORED_SCATTER](scatter);
                    this.$router.back();
                }
            }, */
    // filteredKeypairs(){
    //     const keypairs = this.keypairs.filter(keypair => keypair.blockchain === this.selectedNetwork.blockchain)
    //     return keypairs.length > 0 ? keypairs : [this.noKeypair]
    // },
    // This is just a fix for vuejs reusing components and losing uniqueness
    // locationKey(index){ return this.identity.locations.indexOf(this.selectedLocation)+index; },
    bind(changed, dotNotation) {
      let props = dotNotation.split(".");
      const lastKey = props.pop();
      props.reduce((obj, key) => obj[key], this)[lastKey] = changed;
    },
    selectNetwork(network) {
      this.selectedNetwork = network;
      // this.selectedKeypair = null;
      this.selectedKeypairs = this.keypairs.filter(
        (keypair) => keypair.blockchain === this.selectedNetwork.blockchain
      );
      if (this.selectedKeypairs.length > 0) {
        this.selectedKeypair = this.selectedKeypairs[0];
      } else {
        this.selectedKeypair = null;
      }
    },
    selectKeypair(keypair) {
      this.selectedKeypair = !keypair.publicKey.length ? null : keypair;
    },
    removeAccount() {
      const account = this.identity.accounts[this.selectedNetwork.unique()];
      const formattedAccount = PluginRepository.plugin(
        this.selectedNetwork.blockchain
      ).accountFormatter(account);

      this[Actions.PUSH_ALERT](AlertMsg.RemovingAccount(formattedAccount)).then(
        (res) => {
          if (!res || !res.hasOwnProperty("accepted")) return false;
          this.identity.removeAccount(this.selectedNetwork);
          const refreshHelper = this.selectedNetwork;
          this.selectedNetwork = null;
          this.selectedNetwork = refreshHelper;
        }
      );
    },
    importAccount() {
      if (!this.selectedKeypair || !this.selectedKeypair.publicKey.length)
        return false;
      this.importing = true;
      AccountService.importFromKey(
        this.selectedKeypair,
        this.selectedNetwork,
        this
      )
        .then((imported) => {
          if (!imported.account) {
            this.importing = false;
            return false;
          }
          this.identity.setAccount(this.selectedNetwork, imported.account);
          this.importing = false;
          this.identity.name = `${imported.keypair.blockchain.toUpperCase()}|${imported.account.formatted()}`;
          return this.saveIdentity();
        })
        .catch(() => (this.importing = false));
    },
    showInputFunc() {
      this.showInput = true;
    },
    inputAccount() {
      if (!this.accountNameOrPrivateKey || !this.accountNameOrPrivateKey.length)
        return false;
      this.importing = true;
      AccountService.importFromAccountAndKey(
        // todo
        this.accountNameOrPrivateKey,
        this.selectedKeypair,
        this.selectedNetwork,
        this
      )
        .then((imported) => {
          if (!imported.account) {
            this.importing = false;
            return false;
          }
          this.identity.setAccount(this.selectedNetwork, imported.account);
          this.importing = false;
          this.identity.name = `${imported.keypair.blockchain.toUpperCase()}|${imported.account.formatted()}`;
          return this.saveIdentity();
        })
        .catch(() => (this.importing = false));
    },
    importKeys() {
      this.$router.push({ name: RouteNames.KEYPAIRS });
    },
    // setAsDefaultLocation(){
    //     this.identity.defaultLocation().isDefault = false;
    //     this.selectedLocation.isDefault = true;
    // },
    // addNewLocation(){
    //     if(!this.identity.locations.find(location => location.isDefault)){
    //         this.identity.locations[0].isDefault = true;
    //     }

    //     const newLocation = LocationInformation.placeholder();
    //     this.identity.locations.push(newLocation);
    //     this.selectedLocation = newLocation;
    // },
    // removeSelectedLocation(){
    //     const wasDefault = this.selectedLocation.isDefault;
    //     const index = this.identity.locations.indexOf(this.selectedLocation);
    //     this.identity.locations.splice(index, 1);
    //     if(wasDefault) this.identity.locations[0].isDefault = true;
    //     this.selectedLocation = this.identity.locations[0];
    // },
    async saveIdentity() {
      debugger;
      this.saving = true;

      // // deprecated RIDLService
      // if(this.isNew) {
      //     const identified = await RIDLService.identify(this.identity.publicKey);
      //     if(!identified) return null;
      //     this.identity.name = identified;
      // }

      //TODO: More Error handling
      // -----
      // Location names must not be empty
      // * Email
      // * State ( if exists, only 2 characters )

      const scatter = this.scatter.clone();
      scatter.keychain.updateOrPushIdentity(this.identity);
      this[Actions.UPDATE_STORED_SCATTER](scatter).then(() =>
        this.$router.back()
      );
    },
    ...mapActions([
      Actions.SIGN_RIDL,
      Actions.UPDATE_STORED_SCATTER,
      Actions.PUSH_ALERT,
    ]),
  },
};
</script>

<style lang="scss">
.identity {
  font-family: "Open Sans", sans-serif;

  .panel {
    padding: 20px;

    &:not(:last-child) {
      border-bottom: 1px solid #eaeaea;
    }

    .header {
      color: #cecece;
      font-size: 11px;
      padding-bottom: 5px;
      margin-top: 5px;
      margin-bottom: 10px;
      border-bottom: 1px solid #eaeaea;
    }

    .sub-header {
      color: #505050;
      font-size: 11px;
      margin-bottom: 20px;
    }
  }
}
</style>
