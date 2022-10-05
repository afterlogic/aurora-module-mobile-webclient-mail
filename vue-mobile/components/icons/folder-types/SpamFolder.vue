<template>
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
  <g clip-path="url(#clip0_464_353)">
  <path d="M9 7L9 12L7 12L7 7L9 7Z" :fill="color"/>
  <path d="M9 12.8462L9 15L7 15L7 12.8462L9 12.8462Z" :fill="color"/>
  <path d="M11 14H14.2104C14.9928 14 15.4721 13.1422 15.0621 12.4759L8.85166 2.38394C8.46117 1.74941 7.53883 1.74941 7.14834 2.38394L0.937906 12.4759C0.527894 13.1422 1.00699 14 1.78931 14C2.7093 14 3.87197 14 5 14" :stroke="color" stroke-width="2"/>
  </g>
  <defs>
  <clipPath id="clip0_464_353">
  <rect width="16" height="16" fill="white"/>
  </clipPath>
  </defs>
  </svg>
</template>

<script>
export default {
  name: 'SpamFolder',
  props: {
    color: { type: String, default: '#000' }
  },
}
</script>
