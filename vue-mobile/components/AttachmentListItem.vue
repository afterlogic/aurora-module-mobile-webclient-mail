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
      <div class="text-grey-8 q-gutter-xs row">
        <a v-if="viewLink" :href="viewLink">
          <q-btn color="black" flat round dense >View</q-btn>
        </a>
        <a v-if="downloadLink" :href="downloadLink">
          <q-btn color="black" flat round dense ><DownloadIcon /></q-btn>
        </a>
        <q-btn v-if="!hideRemove" @click="remove" color="black" flat round dense ><CancelCrossIcon /></q-btn>
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
    hideRemove: { type: Boolean, default: false },
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
