<template>
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
  <g clip-path="url(#clip0_1020_1001)">
  <path d="M3 1V0V1ZM1 2V13H3V2H1ZM4 16H14V14H4V16ZM8 0H3V2H8V0ZM1 13C1 14.6569 2.34315 16 4 16V14C3.44772 14 3 13.5523 3 13H1ZM3 2H3V0C1.89543 0 1 0.895431 1 2H3Z" :fill="color"/>
  <path d="M10.1315 1.52318L10.1314 2.0001L13.1318 2.00015L13.1319 1.52122C13.1319 0.680886 12.4609 -1.81532e-06 11.6328 -4.01695e-06C10.804 -6.39515e-06 10.1317 0.68208 10.1315 1.52318Z" :fill="color"/>
  <path d="M11.6319 13.0001L10.1321 11L10.1321 3.00005L13.1319 3.00005L13.1318 11L11.6319 13.0001Z" :fill="color"/>
  <path d="M5 8H8" :fill="color"/>
  <path d="M5 5H8" :fill="color"/>
  <path d="M5 11H9" :fill="color"/>
  </g>
  <defs>
  <clipPath id="clip0_1020_1001">
  <rect width="16" height="16" fill="white"/>
  </clipPath>
  </defs>
  </svg>
</template>

<script>
export default {
  name: 'DraftFolder',
  props: {
    color: { type: String, default: '#000' }
  },
}
</script>
