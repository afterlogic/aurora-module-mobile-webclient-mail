<template>
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M19.8039 2.27397L19 3L22 6L22.726 5.19638C23.44 4.40598 23.4092 3.19466 22.6561 2.44149L22.5586 2.34405C21.8055 1.59095 20.5943 1.56013 19.8039 2.27397Z" :fill="color" :stroke="color" stroke-width="0.125"/>
    <path d="M10 15V12L18 4L21 7L13 15H10Z" :fill="color" :stroke="color" stroke-width="0.125"/>
    <path d="M21 14.2727L21 20C21 21.1046 20.1046 22 19 22L4 22C2.89543 22 2 21.1046 2 20L2 4C2 2.89543 2.89543 2 4 2L14.2143 2" :stroke="color" stroke-width="2"/>
  </svg>
</template>

<script>
export default {
  name: 'FolderIcon',
  props: {
    color: { type: String, default: '#000' }
  },
}
</script>
