<template>
  <AppItem
    :item="message"
    :isSelected="message.isSelected"
    :isChoice="isSelectMode"
    clickable
    :active="message.isSelected"
    @click="onMessageClick"
    v-touch-hold.mouse="() => changeSelectStatus(message)"
    class="list-item"
  >
    <q-item-section class="list-item__text">
      <q-item-label class="list-item__text_secondary message__name">
        {{ recipients }}
      </q-item-label>
      <q-item-label class="list-item__text_primary message__subject">
        {{ message.Subject }}
      </q-item-label>
    </q-item-section>

    <q-item-section side class="list-item__side">
      <q-item-label class="list-item__text_secondary message__info">
        <AttachmentIcon v-if="message.HasAttachments" class="list-item__icon message__icon-attachment" />
        <span class="message__date">{{ messageDate }}</span>
      </q-item-label>
      <q-item-label class="message__status">
        <RepliedIcon v-if="message.IsAnswered" class="list-item__icon message__status-replied" />
        <ForwardedIcon v-if="message.IsForwarded" color="#949496" class="list-item__icon message__status-forwarded" />
        <q-icon v-if="message.IsFlagged" name="star" class="color-flagged message__status-flagged" size="18px" />
        <q-icon v-else name="star_border" color="primary" size="18px" />
      </q-item-label>
    </q-item-section>
  </AppItem>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'

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
  },

  components: {
    AppItem,
    AttachmentIcon,
    RepliedIcon,
    ForwardedIcon,
  },

  computed: {
    ...mapGetters('mailmobile', ['currentAccountId', 'currentFolder', 'isSelectMode']),

    recipients() {
      return addressUtils.getDisplayNamesFromMailsoAddresses(this.message.From).join(', ')
    },

    messageDate() {
      return dateUtils.getShortDate(this.message.TimeStampInUTC, true)
    },
  },

  methods: {
    ...mapActions('mailmobile', ['changeSelectStatus']),

    onMessageClick() {
      if (this.isSelectMode) {
        this.changeSelectStatus(this.message)
      } else {
        this.$router.push(`/mail/${this.currentAccountId}/${this.currentFolder.fullName}/${this.message.Uid}`)
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
  &__info {
    display: flex;
    align-items: flex-end;
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

  &__icon-attachment,
  &__status-replied,
  &__status-forwarded {
    fill: $secondary;
  }
  .list-item__selected &__icon-attachment {
    fill: #000;
  }
  .list-item__selected &__status-replied,
  .list-item__selected &__status-forwarded {
    fill: #5a5a5a;
  }
}
</style>
