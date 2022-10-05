<template>
  <app-item
    :item="message"
    :isSelected="message.isSelected"
    :isChoice="isSelectMode"
    clickable
    :active="message.isSelected"
    @click="listItemClick"
    class="main-list-item"
    >
    <!-- <q-item class="main-list-item q-py-md"> -->
      <q-item-section>
        <q-item-label class="main-list-item__text main-list-item__text-secondary text-bold">{{ recipients }}</q-item-label>
        <q-item-label class="main-list-item__text main-list-item__text-primary" lines="1">{{ message.Subject }}</q-item-label>
      </q-item-section>

      <q-item-section side top>
        <q-item-label class="main-list-item__text main-list-item__text-secondary">
          <q-icon v-if="message.HasAttachments" class="main-list-item__icon" name="attach_file" size="16px" />
          {{ messageDate }}
        </q-item-label>
        <q-item-label>
          <q-icon v-if="message.IsAnswered" class="main-list-item__icon" name="reply" size="16px" />
          <q-icon v-if="message.IsForwarded" class="main-list-item__icon" name="forward" size="16px" />
          <q-icon v-if="message.IsFlagged" name="star" class="color-flagged" size="18px" />
          <q-icon v-else name="star_border" color="primary" size="18px" />
        </q-item-label>
      </q-item-section>
    <!-- </q-item> -->
  </app-item>
</template>

<script>
import addressUtils from 'src/utils/address'
import dateUtils from 'src/utils/date'
import AppItem from '../../../../CoreMobileWebclient/vue-mobile/src/components/common/AppItem'

export default {
  name: 'MessageItem',

  props: {
    message: { type: Object, default: null },
    isSelectMode: { type: Boolean, default: false },
    selectMessage: { type: Function, default: null, require: true },
  },

  components: {
    AppItem
  },

  computed: {
    recipients () {
      return addressUtils.getDisplayNamesFromMailsoAddresses(this.message.From).join(', ')
    },

    messageDate () {
      return dateUtils.getShortDate(this.message.TimeStampInUTC, true)
    },
  },

  methods: {
    async openMessage() {
      await this.$router.push({ path: `/message/${this.message.Uid}` })
    },
    listItemClick() {
      if (this.isSelectMode) {
        this.selectMessage(this.message)
      } else {
        this.openMessage()
      }
    },
  },
}
</script>

<style lang="scss" scoped>
.message {
  padding: 0;
  width: 100vw;
  &__name {
    font-style: normal;
    font-weight: 400;
    font-size: 16px;
    line-height: 16px !important;
    letter-spacing: 0.3px;
  }
  &__name-text {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  &__name-me {
    font-style: normal;
    font-weight: 400;
    font-size: 10px;
    line-height: 16px;
    color: #469CF8;
    letter-spacing: 0.3px;
  }
  &__email {
    font-style: normal;
    font-weight: normal;
    font-size: 12px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  &__avatar {
    width: 32px;
    height: 32px;
    background: rgba(178, 216, 255, 0.25);
    border-radius: 8px;
  }
  &__avatar-title {
    font-style: normal;
    font-weight: 400;
    font-size: 16px;
    line-height: 16px;
    letter-spacing: 0.3px;
    color: #469CF8;
  }
}
</style>
