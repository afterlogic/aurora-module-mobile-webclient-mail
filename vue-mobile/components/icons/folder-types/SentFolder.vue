<template>
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M2 6.25V1L16 8L2 15V9.75L10 8L2 6.25Z" :fill="color" />
  </svg>
</template>

<script>
export default {
  name: 'SentFolder',
  props: {
    color: { type: String, default: '#000' }
  },
}
</script>
