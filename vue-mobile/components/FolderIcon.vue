<template>
  <component :is="componentInstance" :color="color" />
</template>

<script>
import { defineAsyncComponent } from 'vue'

import { FOLDER_TYPES } from '../enums'

export default {
  name: 'FolderIcon',

  props: {
    folderType: { type: Number, default: FOLDER_TYPES.USER },
    color: { type: String, default: '' },
  },

  computed: {
    iconName() {
      switch (this.folderType) {
        case FOLDER_TYPES.INBOX:
          return 'Inbox'
        case FOLDER_TYPES.SENT:
          return 'Sent'
        case FOLDER_TYPES.DRAFTS:
          return 'Draft'
        case FOLDER_TYPES.SPAM:
          return 'Spam'
        case FOLDER_TYPES.TRASH:
          return 'Trash'
        case FOLDER_TYPES.VIRUS:
          return 'Virus'
        case FOLDER_TYPES.STARRED:
          return 'Starred'
        case FOLDER_TYPES.ALL:
          return 'All'
        default:
          return 'Default'
      }
    },

    componentInstance() {
      return defineAsyncComponent(() => import(`./icons/folder-types/${this.iconName}Folder`))
    },
  },
}
</script>

<style scoped></style>
