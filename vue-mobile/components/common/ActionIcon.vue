<template>
  <div
    class="action-icon flex justify-center items-center"
    :class="{ 'action-icon_with-cross': withCross }"
    :style="iconStyle"
  >
    <component :is="componentInstance" :color="color" />
  </div>
</template>

<script>
import { defineAsyncComponent } from "vue";

export default {
  name: 'ActionIcon',
  props: {
    icon: { type: String, required: true },
    color: { type: String, default: 'currentColor' },
    withCross: { type: Boolean, default: false },
  },
  computed: {
    componentInstance () {
      const name = this.icon ? this.icon : ''
      return defineAsyncComponent(() => import(`../icons/actions/${name}`))
    },
    iconStyle() {
      return this.color ? { color: this.color } : null
    },
  },
}
</script>

<style scoped>
.action-icon {
  width: 16px;
}

.action-icon_with-cross {
  position: relative;

  &::before,
  &::after {
    content: '';
    position: absolute;
    left: 50%;
    top: 9px;
    width: 5px;
    height: 1.5px;
    background: currentColor;
    transform-origin: center;
  }

  &::before {
    transform: translateX(-50%) rotate(45deg);
  }

  &::after {
    transform: translateX(-50%) rotate(-45deg);
  }
}
</style>
