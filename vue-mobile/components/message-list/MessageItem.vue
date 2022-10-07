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
        <q-item-label class="main-list-item__text main-list-item__text-secondary message__name">{{ recipients }}</q-item-label>
        <q-item-label class="main-list-item__text main-list-item__text-primary message__subject" lines="1">{{ message.Subject }}</q-item-label>
      </q-item-section>

      <q-item-section side class="main-list-item__side">
        <q-item-label class="main-list-item__text main-list-item__text-secondary">
          <attachment-icon v-if="message.HasAttachments" color="#949496" class="main-list-item__icon"/>
          <span class="message__date">{{ messageDate }}</span>
        </q-item-label>
        <q-item-label class="message__status">
          <replied-icon v-if="message.IsAnswered" color="#949496" class="main-list-item__icon message__status-forwarded" />
          <forwarded-icon v-if="message.IsForwarded" color="#949496" class="main-list-item__icon message__status-forwarded" />
          <q-icon v-if="message.IsFlagged" name="star" class="color-flagged message__status-flagged" size="18px" />
          <q-icon v-else name="star_border" color="primary" size="18px" />
        </q-item-label>
      </q-item-section>
    <!-- </q-item> -->
  </app-item>
</template>

<script>
import addressUtils from 'src/utils/address'
import dateUtils from 'src/utils/date'
import AppItem from 'src/components/common/AppItem'

import AttachmentIcon from '../icons/message-list/AttachmentIcon'
import RepliedIcon from '../icons/message-list/RepliedIcon'
import ForwardedIcon from '../icons/message-list/ForwardedIcon'


export default {
  name: 'MessageItem',

  props: {
    message: { type: Object, default: null },
    isSelectMode: { type: Boolean, default: false },
    selectMessage: { type: Function, default: null, require: true },
  },

  components: {
    AppItem,
    AttachmentIcon,
    RepliedIcon,
    ForwardedIcon,
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
  // padding: 0;
  // width: 100vw;
  &__date {
    // font-size: 80%;
  }
  &__status {
    display: flex;
    align-content: center;
  }
  &__icon {
    display: flex;
    justify-content: center;
    align-items: center;
  }
  // &__name {
  //   font-style: normal;
  //   font-weight: 400;
  //   font-size: 16px;
  //   line-height: 16px !important;
  //   letter-spacing: 0.3px;
  // }
  // &__name-text {
  //   white-space: nowrap;
  //   overflow: hidden;
  //   text-overflow: ellipsis;
  // }
  // &__name-me {
  //   font-style: normal;
  //   font-weight: 400;
  //   font-size: 10px;
  //   line-height: 16px;
  //   color: #469CF8;
  //   letter-spacing: 0.3px;
  // }
  // &__email {
  //   font-style: normal;
  //   font-weight: normal;
  //   font-size: 12px;
  //   white-space: nowrap;
  //   overflow: hidden;
  //   text-overflow: ellipsis;
  // }
  // &__avatar {
  //   width: 32px;
  //   height: 32px;
  //   background: rgba(178, 216, 255, 0.25);
  //   border-radius: 8px;
  // }
  // &__avatar-title {
  //   font-style: normal;
  //   font-weight: 400;
  //   font-size: 16px;
  //   line-height: 16px;
  //   letter-spacing: 0.3px;
  //   color: #469CF8;
  // }
}
</style>
