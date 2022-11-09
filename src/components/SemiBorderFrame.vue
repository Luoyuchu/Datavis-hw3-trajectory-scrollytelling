<template>
<div class="container" :style="containerPaddingStyle">
  <div class="title-wrapper header-wrapper">
    <div class="border border-top" :style="styleHeaderBefore"></div>
    <div class="header">
      <slot name="header"></slot>
    </div>
    <div class="border border-top" :style="styleHeaderAfter"></div>
  </div>
  <div class="title-wrapper footer-wrapper">
    <div class="border border-bottom" :style="styleFooterBefore"></div>
    <div class="footer">
      <slot name="footer"></slot>
    </div>
    <div class="border border-bottom" :style="styleFooterAfter"></div>
  </div>

  <div class="border-frame">
    <slot></slot>
  </div>
</div>
</template>

<script>
export default {
  name: "SemiBorderFrame",
  props: {
    "headerPadding": String,
    "footerPadding": String,
    "headerAlign": {
      type: String,
      default: ""
    },
    "footerAlign": {
      type: String,
      default: ""
    }
  },
  data() {
    return {

    }
  },
  computed: {
    containerPaddingStyle() {
      return `padding: ${this.headerPadding || 0} 0 ${this.footerPadding || 0}`;
    },
    inverseHeaderPadding() {
      return `padding: 0 0 ${this.headerPadding || 0}`;
    },
    inverseFooterPadding() {
      return `padding: ${this.footerPadding || 0} 0 0`;
    },
    styleHeaderBefore() {
      let par = this.headerAlign.split('-');
      if (par.length == 2 && par[0] == 'left') {
        return `width: ${par[1]};` + this.inverseHeaderPadding;
      }
      else {
        return "flex-grow: 1;" + this.inverseHeaderPadding;
      }
    },
    styleHeaderAfter() {
      let par = this.headerAlign.split('-');
      if (par.length == 2 && par[0] == 'right') {
        return `width: ${par[1]};` + this.inverseHeaderPadding;
      }
      else {
        return "flex-grow: 1;" + this.inverseHeaderPadding;
      }
    },
    styleFooterBefore() {
      let par = this.footerAlign.split('-');
      if (par.length == 2 && par[0] == 'left') {
        return `width: ${par[1]};` + this.inverseFooterPadding;
      }
      else {
        return "flex-grow: 1;" + this.inverseFooterPadding;
      }
    },
    styleFooterAfter() {
      let par = this.footerAlign.split('-');
      if (par.length == 2 && par[0] == 'right') {
        return `width: ${par[1]};` + this.inverseFooterPadding;
      }
      else {
        return "flex-grow: 1;" + this.inverseFooterPadding;
      }
    },
    headerAlignStyle() {
      if (!this.headerAlign) {
        return "";
      }
      let par = this.headerAlign.split('-');
      switch (par[0]) {
        case 'left':
          return `margin-right: auto;` + (("1" in par) ? `margin-left: ${par[1]};` : "");
        case 'right':
          return `margin-left: auto;` + (("1" in par) ? `margin-right: ${par[1]};` : "");
        default:
          return "";
      }
    },
    footerAlignStyle() {
      if (!this.footerAlign) {
        return "";
      }
      let par = this.footerAlign.split('-');
      switch (par[0]) {
        case 'left':
          return `margin-right: auto;` + (("1" in par) ? `margin-left: ${par[1]};` : "");
        case 'right':
          return `margin-left: auto;` + (("1" in par) ? `margin-right: ${par[1]};` : "");
        default:
          return "";
      }
    },
  }
}
</script>

<style scoped lang="scss">


.container {
  position: relative;
  font-family: FZQINGKBYSJF;
  color: #5a3a20;
  .title-wrapper {
    display: flex;
    justify-content: center;
    position: absolute;
    left: 0;
    right: 0;
  }
  .header-wrapper {
    top: 0px;
  }

  .footer-wrapper {
    bottom: 0px;
  }

  .border {
    height: 0;
    border-bottom:solid #ac9176 0.2vh;
  }

  .border-frame {
    border-left: solid #ac9176 0.2vh;
    border-right: solid #ac9176 0.2vh;
  }
}

</style>
