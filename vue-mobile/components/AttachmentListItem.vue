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

    <div v-if="viewLink || downloadLink" class="attachment-card__actions">
      <q-btn
        v-if="viewLink"
        flat
        no-caps
        dense
        color="primary"
        label="VIEW"
        class="attachment-card__action"
        @click="view"
      />
      <q-btn
        v-if="downloadLink"
        flat
        no-caps
        dense
        color="primary"
        label="DOWNLOAD"
        class="attachment-card__action"
        :href="downloadLink"
        target="_blank"
        tag="a"
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
  computed: {
    thumbnail() {
      return this.attachment?.thumbnailUrl ? (getApiHost() + this.attachment.thumbnailUrl) : ''
    },
    size() {
      return this.attachment?.size ? text.getFriendlySize(this.attachment.size) : ''
    },
    viewLink() {
      const url = resolveActionUrl(this.attachment?.actions, 'view', this.attachment?.hash)
      return url ? (getApiHost() + url) : ''
    },
    downloadLink() {
      const url = resolveActionUrl(this.attachment?.actions, 'download', this.attachment?.hash)
      return url ? (getApiHost() + url) : ''
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
</style>
