<template>
  <q-item
    class="folder"
    dense
    :active="isFolderSelected"
    clickable
    v-ripple
    data-test-id="mail-folder-item"
    :data-folder-name="folder.name"
    :data-folder-full-name="folder.fullName"
    :data-folder-type="String(folder.type)"
    @click="selectFolder"
  >
    <div class="folder-indent" :style="indent"></div>
    <div class="folder-icon">
      <FolderIcon :folderType="folder.type" :color="isFolderSelected ? '#469CF8' : '#969494'" />
    </div>
    <div class="folder-name">{{ folder.name }}</div>
    <div class="folder-meta" v-if="showUnseenCount" @click.stop="showUnseenMessages">
      <div data-test-id="mail-folder-unseen-count" class="folder-counter">{{ folder.unseenCount }}</div>
    </div>
    <div class="folder-meta" v-else-if="showTotalCount">
      <div class="folder-counter folder-counter_total">{{ folder.count }}</div>
    </div>
  </q-item>
  <FolderItem v-for="subFolder in folder.subFolders" :key="subFolder.fullName" :folder="subFolder" :level="level + 1" />
</template>

<script>
import { mapState, mapGetters } from 'pinia'
import { useMailStore } from '../../store/index-pinia'

import eventBus from 'src/event-bus'

import { FOLDER_TYPES } from '../../enums'

import FolderIcon from '../FolderIcon'

export default {
  name: 'FolderItem',

  components: {
    FolderIcon,
  },

  props: {
    folder: { type: Object, default: null },
    level: { type: Number, default: 0 },
  },

  computed: {
    ...mapState(useMailStore, ['currentAccountId', 'isUnifiedInbox', 'currentFolder']),
    ...mapGetters(useMailStore, ['currentFoldersDelimiter']),

    isFolderSelected() {
      const currentFolderFullName = (this.currentFolder && this.currentFolder.fullName) || ''
      return (
        !this.isUnifiedInbox
        && this.folder.fullName === currentFolderFullName
        && this.folder.accountId === this.currentAccountId
      )
    },

    indent() {
      return { width: `${this.level * 16}px` }
    },

    showUnseenCount() {
      return this.folder.unseenCount > 0 && this.folder.type !== FOLDER_TYPES.DRAFTS
    },

    showTotalCount() {
      return this.folder.count > 0 && this.folder.type === FOLDER_TYPES.DRAFTS
    },
  },

  methods: {
    selectFolder() {
      this.$router.push({
        name: 'message-list',
        params: {
          accountId: this.currentAccountId,
          folderPath: this.folder.fullName.split(this.currentFoldersDelimiter),
        },
      })
      eventBus.$emit('closeDrawer')
    },

    showUnseenMessages() {
      this.$router.push({
        name: 'message-list-filter',
        params: {
          accountId: this.currentAccountId,
          folderPath: this.folder.fullName.split(this.currentFoldersDelimiter),
          filter: 'unseen',
        },
      })
      eventBus.$emit('closeDrawer')
    },
  },
}
</script>
<style lang="scss" scoped>
.folder {
  height: 44px;
  display: grid;
  grid-template-columns: auto auto minmax(0, 1fr) auto;
  align-items: center;
  width: 100%;
  max-width: 100%;
  padding: 0 24px;
  box-sizing: border-box;
  min-width: 0;
  overflow: hidden;

  &.q-item--active {
    color: #469cf8;

    .folder-counter {
      background-color: #469cf8;
    }
  }
  &-name {
    font-size: 14px;
    min-width: 0;
    max-width: 100%;
    overflow: hidden;
    white-space: nowrap;
    mask-image: linear-gradient(to right, #000 0, #000 calc(100% - 12px), transparent 100%);
    mask-repeat: no-repeat;
    mask-size: 100% 100%;
    -webkit-mask-image: linear-gradient(to right, #000 0, #000 calc(100% - 12px), transparent 100%);
    -webkit-mask-repeat: no-repeat;
    -webkit-mask-size: 100% 100%;
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
    flex-shrink: 0;
  }

  &-indent {
    padding: 0px;
  }

  &-icon {
    padding: 0 16px 0 0;
  }

  &-meta {
    padding-left: 12px;
  }
}
</style>
