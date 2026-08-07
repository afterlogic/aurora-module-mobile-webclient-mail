<template>
  <svg
    :width="width"
    :height="height"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <!-- Material Icons: mark_email_read -->
    <path
      :fill="color"
      d="M18.55 2.55L16.75.75 9.6 7.9l-2.85-2.85L4.9 6.9 9.6 11.6zM12 11L20 6.5V18c0 1.1-.9 2-2 2H6c-1.1 0-2-.9-2-2V6.5L12 11zm0 2.07L4.5 8.75V18c0 .28.22.5.5.5h14c.28 0 .5-.22.5-.5V8.75L12 13.07z"
    />
  </svg>
</template>

<script>
export default {
  name: 'MarkAsReadIcon',
  props: {
    width: { type: Number, default: 16 },
    height: { type: Number, default: 16 },
    color: { type: String, default: 'currentColor' },
  },
}
</script>
