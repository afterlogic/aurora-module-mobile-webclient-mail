<template>
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M6.12504 0L6.10883 3.50165C10.6273 3.59545 14 8.12075 14 13.5625V14H13.5625C12.2536 11.1636 9.70537 8.75 7 8.75H6.10883V12.25L0 6.125L6.12504 0Z" :fill="color"/>
  </svg>
</template>

<script>
export default {
  name: 'RepliedIcon',
  props: {
    color: { type: String, default: '#000' }
  },
}
</script>
