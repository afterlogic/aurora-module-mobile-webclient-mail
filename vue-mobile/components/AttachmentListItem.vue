<template>
  <q-item class="attachment">
    <q-item-section class="list-item__thumb" side>
      <FileIcon v-if="!thumbnail" />
      <div v-if="thumbnail" style="width: 32px; height: 32px;">
        <img :src=thumbnail style="max-width: 32px; max-height: 32px;" />
      </div>
    </q-item-section>

    <q-item-section class="list-item__text">
      <q-item-label class="list-item__text_primary file__name">
        {{ attachment.FileName }}
      </q-item-label>
      <q-item-label class="list-item__text_secondary">
        {{ size }}
      </q-item-label>
    </q-item-section>
    <q-item-section class="list-item__side">
      <div v-if="downloadLink">
        <a :href="downloadLink"><DownloadIcon /></a>
      </div>
    </q-item-section>
  </q-item>
</template>

<script>
import { getApiHost } from 'src/api/helpers'
import text from 'src/utils/text'
import DownloadIcon from './icons/DownloadIcon'
import FileIcon from './icons/FileIcon'

export default {
  name: 'AttachmentListItem',

  components: {
    DownloadIcon,
    FileIcon
  },

  props: {
    attachment: { type: Object, default: null },
  },

  computed: {
    thumbnail() {
      return this.attachment?.ThumbnailUrl ? (getApiHost() + this.attachment?.ThumbnailUrl) : ''
    },
    size() {
      return text.getFriendlySize(this.attachment?.EstimatedSize)
    },
    downloadLink() {
      return this.attachment?.Actions?.download ? (getApiHost() + this.attachment?.Actions?.download.url) : ''
    }
  },
}
</script>
