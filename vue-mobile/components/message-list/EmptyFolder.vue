<template>
  <div class="flex items-center justify-center caption full-height">
    <div class="caption__box">
      <div class="q-mb-md">
        <empty-folder-icon />
      </div>
      <div>
        {{ $t('MAILMOBILEWEBCLIENT.LABEL_EMPTY_FOLDER') }}
      </div>
    </div>
  </div>
</template>

<script>
import EmptyFolderIcon from '../icons/message-list/EmptyFolderIcon.vue'

export default {
  name: 'EmptyFolder',
  components: {
    EmptyFolderIcon,
  },
};
</script>

<style lang="scss" scoped>
.caption {
  font-size: 16px;
  line-height: 16px;
  text-align: center;
  color: #969494;
}
</style>
