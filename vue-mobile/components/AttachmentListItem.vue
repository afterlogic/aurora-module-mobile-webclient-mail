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
        {{ attachment.filename }}
      </q-item-label>
      <q-item-label class="list-item__text_secondary">
        {{ size }}
      </q-item-label>
    </q-item-section>
    <q-item-section class="list-item__side">
      <div v-if="viewLink">
        <a :href="viewLink">View</a>
      </div>
      <div v-if="downloadLink">
        <a :href="downloadLink"><DownloadIcon /></a>
      </div>
      <div>
        <span @click="remove"><CancelCrossIcon /></span>
      </div>
    </q-item-section>
  </q-item>
</template>

<script>
import { getApiHost } from 'src/api/helpers'
import text from 'src/utils/text'
import DownloadIcon from './icons/DownloadIcon'
import FileIcon from './icons/FileIcon'
import CancelCrossIcon from '/src/components/common/icons/CancelCrossIcon'

export default {
  name: 'AttachmentListItem',

  components: {
    DownloadIcon,
    FileIcon,
    CancelCrossIcon,
  },

  props: {
    attachment: { type: Object, default: null },
  },

  computed: {
    thumbnail() {
      return this.attachment?.thumbnailUrl ? (getApiHost() + this.attachment?.thumbnailUrl) : ''
    },
    size() {
      return this.attachment?.size ? text.getFriendlySize(this.attachment?.size) : ''
    },
    downloadLink() {
      return this.attachment?.actions?.download ? (getApiHost() + this.attachment?.actions?.download.url) : ''
    },
    viewLink() {
      return this.attachment?.actions?.view ? (getApiHost() + this.attachment?.actions?.view.url) : ''
    },
  },
  
  methods: {
    remove() {
      this.$emit('remove', this.attachment)
    }
  },
}
</script>
