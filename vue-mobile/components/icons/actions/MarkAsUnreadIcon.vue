<template>
  <svg
    :width="width"
    :height="height"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <!-- Material Icons: mark_email_unread -->
    <path
      :fill="color"
      d="M22 6.98V6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h10.1c-.06-.32-.1-.66-.1-1 0-3.31 2.69-6 6-6 1.08 0 2.09.28 2.96.76.02-.11.04-.22.04-.34V6.98zM20 6l-8 5-8-5h16zm0 4.98c-.74-.23-1.53-.36-2.35-.36-3.31 0-6 2.69-6 6 0 .34.03.67.08 1H4V8l8 5 8-5v2.98zM16 17.5c0-1.93 1.57-3.5 3.5-3.5s3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5-3.5-1.57-3.5-3.5z"
    />
  </svg>
</template>

<script>
export default {
  name: 'MarkAsUnreadIcon',
  props: {
    width: { type: Number, default: 16 },
    height: { type: Number, default: 16 },
    color: { type: String, default: 'currentColor' },
  },
}
</script>
