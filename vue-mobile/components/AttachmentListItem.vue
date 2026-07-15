<template>
  <div class="attachment-card">
    <div class="attachment-card__header">
      <div class="attachment-card__thumb">
        <FileIcon v-if="!thumbnail" />
        <img
          v-else
          :src="thumbnail"
          class="attachment-card__thumb-img"
          alt=""
        />
      </div>

      <div class="attachment-card__info">
        <div class="attachment-card__name">{{ attachment.filename }}</div>
        <div v-if="size" class="attachment-card__size">{{ size }}</div>
      </div>

      <q-btn
        v-if="!hideRemove"
        class="attachment-card__remove"
        flat
        round
        dense
        color="black"
        @click="remove"
      >
        <CancelCrossIcon />
      </q-btn>
    </div>

    <div v-if="hasActions" class="attachment-card__actions">
      <q-btn
        v-if="isExpandableZip"
        flat
        no-caps
        dense
        color="primary"
        :label="expandLabel"
        :disable="isExpanding"
        class="attachment-card__action"
        @click="toggleExpand"
      />
      <q-btn
        v-else-if="viewLink"
        flat
        no-caps
        dense
        color="primary"
        :label="$t('COREWEBCLIENT.ACTION_VIEW_FILE')"
        class="attachment-card__action"
        @click="view"
      />
      <q-btn
        v-if="downloadLink"
        flat
        no-caps
        dense
        color="primary"
        :label="$t('COREWEBCLIENT.ACTION_DOWNLOAD_FILE')"
        class="attachment-card__action"
        :href="downloadLink"
        target="_blank"
        tag="a"
      />
    </div>

    <div v-if="isExpanded && subFiles.length" class="attachment-card__children">
      <AttachmentListItem
        v-for="(subFile, index) in subFiles"
        :key="subFile.hash || subFile.id || index"
        :attachment="subFile"
        :hideRemove="true"
        class="attachment-card__child"
      />
    </div>
  </div>
</template>

<script>
import { colors } from 'quasar'
const { getPaletteColor } = colors

import { getApiHost } from 'src/api/helpers'
import text from 'src/utils/text'
import FileIcon from './icons/FileIcon'
import CancelCrossIcon from '/src/components/common/icons/CancelCrossIcon'
import mailWebApi from '../mail-web-api'
import settings from '../settings'
import CAttachment from '../classes/CAttachment'

function resolveActionUrl(actions, actionName, hash) {
  const fromActions = actions?.[actionName]?.url || actions?.[actionName]?.Url || ''
  if (fromActions) {
    return fromActions
  }

  if (!hash) {
    return ''
  }

  if (actionName === 'view') {
    return '?file-cache/' + hash + '/view'
  }

  return '?file-cache/' + hash
}

function getFileExtension(filename) {
  if (!filename || typeof filename !== 'string') {
    return ''
  }

  const parts = filename.split('.')
  return parts.length > 1 ? parts.pop().toLowerCase() : ''
}

function mapExpandedFile(fileData) {
  const attachment = new CAttachment()
  const hash = fileData?.Hash || ''

  attachment.polulate({
    id: hash || fileData?.TempName || fileData?.FileName,
    filename: fileData?.FileName || fileData?.Name || '',
    size: fileData?.Size || '',
    thumbnailUrl: fileData?.ThumbnailUrl || '',
    actions: fileData?.Actions || null,
    hash,
  })

  return attachment
}

export default {
  name: 'AttachmentListItem',
  components: {
    FileIcon,
    CancelCrossIcon,
  },
  emits: ['remove'],
  props: {
    attachment: { type: Object, default: null },
    hideRemove: { type: Boolean, default: false },
    iconColor: { type: String, default: getPaletteColor('primary') },
  },
  data() {
    return {
      isExpanded: false,
      isExpanding: false,
      subFilesLoaded: false,
      subFiles: [],
    }
  },
  computed: {
    thumbnail() {
      return this.attachment?.thumbnailUrl ? (getApiHost() + this.attachment.thumbnailUrl) : ''
    },
    size() {
      return this.attachment?.size ? text.getFriendlySize(this.attachment.size) : ''
    },
    attachmentHash() {
      return this.attachment?.hash || this.attachment?.id || ''
    },
    viewLink() {
      const url = resolveActionUrl(this.attachment?.actions, 'view', this.attachmentHash)
      return url ? (getApiHost() + url) : ''
    },
    downloadLink() {
      const url = resolveActionUrl(this.attachment?.actions, 'download', this.attachmentHash)
      return url ? (getApiHost() + url) : ''
    },
    isZipAttachment() {
      return getFileExtension(this.attachment?.filename) === 'zip'
    },
    isExpandableZip() {
      return this.isZipAttachment && !!settings.get('allowZip') && !!this.attachmentHash
    },
    expandLabel() {
      if (this.isExpanding) {
        return this.$t('COREWEBCLIENT.INFO_LOADING')
      }
      if (this.isExpanded) {
        return this.$t('COREWEBCLIENT.ACTION_COLLAPSE_FILE')
      }
      return this.$t('COREWEBCLIENT.ACTION_EXPAND_FILE')
    },
    hasActions() {
      return this.isExpandableZip || !!this.viewLink || !!this.downloadLink
    },
  },
  methods: {
    view() {
      if (this.viewLink) {
        window.open(this.viewLink, '_blank', 'noopener')
      }
    },
    remove() {
      this.$emit('remove', this.attachment)
    },
    async toggleExpand() {
      if (this.isExpanding) {
        return
      }

      if (this.isExpanded) {
        this.isExpanded = false
        return
      }

      if (this.subFilesLoaded) {
        this.isExpanded = true
        return
      }

      this.isExpanding = true
      const result = await mailWebApi.expandZipFile({
        Hash: this.attachmentHash,
      })
      this.isExpanding = false

      if (!result || !Array.isArray(result.Files)) {
        return
      }

      this.subFiles = result.Files.map(mapExpandedFile)
      this.subFilesLoaded = true
      this.isExpanded = true
    },
  },
}
</script>

<style lang="scss" scoped>
.attachment-card {
  background: #fff;
  border-radius: 3px;
  box-shadow: 0 2px 6px #ccc;
  margin: 0 0 12px;
  overflow: hidden;
}

.attachment-card__header {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 12px 12px 8px;
}

.attachment-card__thumb {
  flex: 0 0 32px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.attachment-card__thumb-img {
  max-width: 32px;
  max-height: 32px;
}

.attachment-card__info {
  flex: 1 1 auto;
  min-width: 0;
}

.attachment-card__name {
  font-weight: 600;
  font-size: 14px;
  line-height: 1.3;
  word-break: break-word;
}

.attachment-card__size {
  margin-top: 2px;
  color: #929292;
  font-size: 12px;
}

.attachment-card__remove {
  flex: 0 0 auto;
  margin: -4px -4px 0 0;
}

.attachment-card__actions {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 4px;
  padding: 0 8px 6px;
}

.attachment-card__action {
  font-size: 12px;
  min-height: 28px;
}

.attachment-card__children {
  padding: 0 8px 8px 28px;
}

.attachment-card__child {
  margin-bottom: 8px;
  box-shadow: 0 1px 3px #ddd;
}

.attachment-card__child:last-child {
  margin-bottom: 0;
}
</style>
