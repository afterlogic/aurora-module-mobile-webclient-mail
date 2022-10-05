<template>
  <component :is="componentInstance" :color="color"/>
</template>

<script>
import { defineAsyncComponent } from "vue";

export default {
  name: 'FolderIcon',
  props: {
    icon: { type: String, default: '10' },
    color: { type: String, default: '' }
  },
  computed: {
    componentInstance () {
      const types = {
        '1': 'Inbox',
        '2': 'Sent',
        '3': 'Draft',
        '4': 'Spam',
        '5': 'Trash',
        '6': 'Virus',
        '10': 'Default',
        '11': 'All',
      }

      return defineAsyncComponent(() => import(`./icons/folder-types/${types[this.icon]}Folder`))
    }
  },
}
</script>

<style scoped></style>
