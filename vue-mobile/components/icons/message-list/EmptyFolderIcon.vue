<template>
  <svg width="80" height="60" viewBox="0 0 80 60" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect opacity="0.25" x="1" y="1" width="78" height="58" rx="9" :stroke="color" stroke-width="2"/>
    <path opacity="0.25" d="M7 8L40.4583 28L73 8" :stroke="color" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>
</template>

<script>
export default {
  name: 'EmptyFolderIcon',
  props: {
    color: { type: String, default: '#000' }
  },
}
</script>
