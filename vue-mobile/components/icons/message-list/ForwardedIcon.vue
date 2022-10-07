<template>
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M8.87496 1L8.89117 4.50165C4.37268 4.59545 1 9.12075 1 14.5625V15H1.4375C2.74642 12.1636 5.29463 9.75 8 9.75H8.89117V13.25L15 7.125L8.87496 1Z" :fill="color"/>
  </svg>
</template>

<script>
export default {
  name: 'ForwardedIcon',
  props: {
    color: { type: String, default: '#000' }
  },
}
</script>
