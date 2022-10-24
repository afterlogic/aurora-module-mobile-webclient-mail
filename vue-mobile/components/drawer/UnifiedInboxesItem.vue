<template>
  <q-item class="folder" dense :active="selected" clickable v-ripple @click.prevent="selectFolder">
    <q-item-section class="folder-indent" :style="indent" side></q-item-section>
    <q-item-section side>
      <FolderIcon :folderType="folderType" :color="selected ? '#469CF8' : '#969494'" />
    </q-item-section>
    <q-item-section class="folder-name">
      {{ $t('MAILWEBCLIENT.LABEL_FOLDER_ALL_INBOXES') }}
    </q-item-section>
    <!--    <q-item-section side v-if="folder.unseenCount" clickable @click.stop="showUnseenMessages">-->
    <!--      <div class="folder-counter">{{ folder.unseenCount }}</div>-->
    <!--    </q-item-section>-->
  </q-item>
</template>

<script>
import { mapGetters } from 'vuex'

import { FOLDER_TYPES } from '../../enums'

import FolderIcon from '../FolderIcon'

export default {
  name: 'UnifiedInboxesItem',

  components: {
    FolderIcon,
  },

  props: {
    folder: { type: Object, default: null },
    selected: { type: Boolean, default: false },
    level: { type: Number, default: 0 },
  },

  data() {
    return {
      folderType: FOLDER_TYPES.ALL,
    }
  },

  computed: {
    ...mapGetters('mailmobile', ['currentAccountId', 'currentFolder']),

    currentFolderFullName() {
      return (this.currentFolder && this.currentFolder.fullName) || ''
    },

    indent() {
      return { width: `${this.level * 16}px` }
    },
  },

  methods: {
    selectFolder() {
      this.$router.push({ name: 'message-list-unified' })
    },

    showUnseenMessages() {},
  },
}
</script>
<style lang="scss" scoped>
.folder {
  height: 44px;
  padding: 0 24px;

  &.q-item--active {
    color: #469cf8;

    .folder-counter {
      background-color: #469cf8;
    }
  }
  &-name {
    font-size: 14px;
  }
  &-counter {
    color: #fff;
    border-radius: 100px;
    background-color: #969494;
    height: 24px;
    min-width: 24px;
    padding: 0px 10px;
    display: flex;
    align-items: center;
  }

  &-indent {
    padding: 0px;
  }
}
</style>
