<template>
  <!-- プルダウンメニューの箱コンポーネント。使うときはslotにPullDownMenuListを入れる. -->
  <div class="pull-down-menu">
    <div
      class="toggle-button"
      :disabled="menuDisabled"
      v-if="!expanded"
      v-on:click.prevent="open"
    >
      {{ buttonText }}
    </div>
    <div class="toggle-button" v-else v-on:click.prevent="close">x</div>
    <div v-if="expanded" class="menu-container">
      <slot></slot>
    </div>
  </div>
</template>

<script>
export default {
  name: "PullDownMenu",
  props: {
    menuDisabled: {
      type: Boolean,
      default: false,
    },
    buttonText: {
      default: "-",
    },
  },
  data() {
    return {
      expanded: false,
    };
  },
  watch: {
    // ここではアロー関数ではなくfunctionを使わないと正しく動かない.
    menuDisabled: function (newVal, oldVal) {
      if (!oldVal && newVal) {
        this.close();
      }
    },
  },
  methods: {
    open() {
      if (!this.menuDisabled) {
        this.expanded = true;
      }
    },
    close() {
      this.expanded = false;
      this.$emit("menu-closed");
    },
  },
};
</script>

<style>
.pull-down-menu {
  position: relative;
  right: 0.2rem;
}
.toggle-button {
  position: absolute;
  right: 0;
  min-width: 1rem;
  height: 1rem;
  line-height: 1rem;
  cursor: pointer;
  border-top: 1px solid #ccc;
  border-left: 1px solid #ccc;
  border-right: 1px solid #333;
  border-bottom: 1px solid #333;
  user-select: none;
}
.menu-container {
  position: relative;
  z-index: 100;
  height: 1rem;
  top: 1rem;
  padding: 0;
}
</style>
