<template>
  <section class="showcenter">
    <canvas id="canvas"></canvas>
    <div class="text">{{qrcode}}</div>
    <btn :text="locale(langKeys.BUTTON_Copy)" @click.native="copy(qrcode)" margined="true"></btn>
    <!-- INPUT FIELD USED FOR COPYING -->
    <input tabindex="-1" type="text" ref="copier" class="copier" />
  </section>
</template>

<script>
import QRCode from "qrcode";

export default {
  data() {
    return {
      qrcode: ""
    };
  },
  mounted() {
    const { qrcode } = this.$route.query;
    this.qrcode = qrcode;
    QRCode.toCanvas(
      document.getElementById("canvas"),
      qrcode,
      { version: 5 },
      function(error) {
        if (error) console.error(error);
        //   console.log("success!");
      }
    );
  },
  methods: {
    copy(data) {
      const copier = this.$refs.copier;
      copier.value = data
      copier.select();
      document.execCommand("copy");
      copier.value = "";
    }
  }
};
</script>

<style lang="scss">
.showcenter {
  // padding-top: 30%;
  padding:30% 20px 20px;
  text-align: center;
  width: 100%;

  .text {
    padding: 20px;
    font-size: 15px;
  }
}
</style>