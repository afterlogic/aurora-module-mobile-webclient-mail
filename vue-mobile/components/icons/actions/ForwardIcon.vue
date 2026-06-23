<template>
  <svg :width="width" :height="height" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path fill="black" d="M8.87496 1L8.89117 4.50165C4.37268 4.59545 1 9.12075 1 14.5625V15H1.4375C2.74642 12.1636 5.29463 9.75 8 9.75H8.89117V13.25L15 7.125L8.87496 1Z" />
  </svg>
</template>

<script>
export default {
  name: 'ForwardIcon',
  props: {
    width: { type: Number, default: 16 },
    height: { type: Number, default: 16 },
  },
}
</script>
