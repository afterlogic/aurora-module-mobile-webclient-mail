<template>
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M7 1L9 1L9 8L11 8L8 11L5 8L7 8L7 1Z" :fill="color"/>
    <path d="M6 4H3.59127C3.22658 4 2.89081 4.19853 2.71506 4.51808L1.12378 7.4113C1.04258 7.55895 1 7.72472 1 7.89322V13C1 13.5523 1.44772 14 2 14H14C14.5523 14 15 13.5523 15 13V7.89322C15 7.72472 14.9574 7.55895 14.8762 7.4113L13.2849 4.51808C13.1092 4.19853 12.7734 4 12.4087 4H10" :stroke="color" stroke-width="2"/>
  </svg>
</template>

<script>
export default {
  name: 'InboxFolder',
  props: {
    color: { type: String, default: '#000' }
  },
}
</script>
