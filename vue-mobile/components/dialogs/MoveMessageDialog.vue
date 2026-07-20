<template>
  <AppDialog data-test-id="mail-move-dialog" :close="closeDialog" width="90vw">
    <template v-slot:content>
      <div class="dialog__title-text q-ma-md">
        {{ $t('MAILWEBCLIENT.ACTION_MOVE_TO_FOLDER') }}
      </div>
      <q-scroll-area style="height: 50vh; max-height: 400px">
        <q-list>
          <q-item
            v-for="folder in selectableFolders"
            :key="folder.fullName"
            data-test-id="mail-move-folder-item"
            :data-folder-name="folder.name || folder.displayName"
            :data-folder-full-name="folder.fullName"
            :data-folder-type="String(folder.type)"
            clickable
            @click="moveToFolder(folder)"
          >
            <q-item-section>
              <span :style="{ paddingLeft: `${folder.depth * 16}px` }">
                {{ folder.displayName }}
              </span>
            </q-item-section>
          </q-item>
        </q-list>
      </q-scroll-area>
    </template>
  </AppDialog>
</template>

<script>
import { mapState, mapGetters, mapActions } from 'pinia'
import { useMailStore } from '../../store/index-pinia'
import { FOLDER_TYPES } from '../../enums'

import AppDialog from 'components/common/AppDialog'
import notification from 'src/utils/notification'

const MOVE_TARGET_TYPES_ALWAYS = [
  FOLDER_TYPES.SENT,
  FOLDER_TYPES.DRAFTS,
  FOLDER_TYPES.SPAM,
  FOLDER_TYPES.TRASH,
  FOLDER_TYPES.USER,
]

export default {
  name: 'MoveMessageDialog',

  components: {
    AppDialog,
  },

  emits: ['closeDialog'],

  props: {
    dialog: { type: Boolean, default: false },
  },

  data() {
    return {
      saving: false,
    }
  },

  computed: {
    ...mapState(useMailStore, ['currentMessage']),
    ...mapGetters(useMailStore, ['getFoldersDelimiter']),

    messageAccountId() {
      return this.currentMessage?.accountId || 0
    },

    currentFolderFullName() {
      return this.currentMessage?.folder || ''
    },

    selectableFolders() {
      const mailStore = useMailStore()
      const folderList = mailStore.folderLists.get(this.messageAccountId)
      const delimiter = this.getFoldersDelimiter(this.messageAccountId)

      if (!folderList?.flatList) {
        return []
      }

      return folderList.flatList
        .filter((folder) => {
          if (folder.isVirtual || folder.fullName === this.currentFolderFullName) {
            return false
          }
          if (folder.isSelectable) {
            return true
          }
          return MOVE_TARGET_TYPES_ALWAYS.includes(folder.type)
        })
        .map((folder) => ({
          ...folder,
          depth: folder.fullName.split(delimiter).length - 1,
        }))
    },
  },

  methods: {
    ...mapActions(useMailStore, ['asyncMoveCurrentMessage']),

    async moveToFolder(folder) {
      if (this.saving || !this.currentMessage) {
        return
      }

      this.saving = true
      notification.showLoading(this.$t('COREWEBCLIENT.INFO_LOADING'))

      const result = await this.asyncMoveCurrentMessage({
        accountId: this.currentMessage.accountId,
        sourceFolder: this.currentMessage.folder,
        destinationFolder: folder.fullName,
        uid: this.currentMessage.uid,
        message: this.currentMessage,
      })

      notification.hideLoading()
      this.saving = false

      if (result) {
        this.$emit('closeDialog')
        this.$router.back()
      }
    },

    closeDialog() {
      this.$emit('closeDialog')
    },
  },
}
</script>
