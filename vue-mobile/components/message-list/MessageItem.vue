<template>
  <AppItem
    :item="message"
    :isSelected="message.isSelected"
    :isChoice="isSelectMode"
    clickable
    :active="message.isSelected"
    @click="onMessageClick"
    class="list-item"
    :class="{'message__unseen': !message.isSeen}"
  >
    <q-item-section class="list-item__text">
      <q-item-label class="list-item__text_secondary message__name">
        {{ recipients }}
        <span v-if="showUnifiedMailboxLabel" class="message__marker" :style="{ background: unifiedMailboxLabelColor }">
          {{ unifiedMailboxLabelText }}
        </span>
        <span v-if="isCurrentSearchInMultiFolders" class="message__contour_marker">
          {{ folderDisplayName }}
        </span>
      </q-item-label>
      <q-item-label class="list-item__text_primary message__subject">
        {{ message.subject }}
      </q-item-label>
    </q-item-section>

    <q-item-section side class="list-item__side">
      <q-item-label class="list-item__text_secondary message__info">
        <AttachmentIcon v-if="message.hasAttachments" class="list-item__icon message__icon-attachment" />
        <span class="message__date">{{ messageDate }}</span>
      </q-item-label>
      <q-item-label class="message__status">
        <RepliedIcon v-if="message.isAnswered" class="list-item__icon message__status-replied" />
        <ForwardedIcon v-if="message.isForwarded" color="#949496" class="list-item__icon message__status-forwarded" />
        <q-icon v-if="message.isFlagged" name="star" class="color-flagged message__status-flagged" size="18px" />
        <q-icon v-else name="star_border" color="primary" size="18px" />
      </q-item-label>
    </q-item-section>
  </AppItem>
</template>

<script>
import { mapGetters } from 'pinia'
import { useMailStore } from '../../store/index-pinia'

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
    selectItemHandler: { type: Function, default: null, require: true },
  },

  components: {
    AppItem,
    AttachmentIcon,
    RepliedIcon,
    ForwardedIcon,
  },

  computed: {
    ...mapGetters(useMailStore, [
      'isUnifiedInbox',
      'isCurrentSearchInMultiFolders',
      'getAccount',
      'getFoldersDelimiter',
      'getFolderDisplayName',
      'isSelectMode',
    ]),

    recipients() {
      return addressUtils.getDisplayNamesFromMailsoAddresses(this.message.from).join(', ')
    },

    messageDate() {
      return dateUtils.getShortDate(this.message.timeStampInUTC, true)
    },

    messageAccount() {
      return this.getAccount(this.message.accountId)
    },

    folderDisplayName() {
      return this.getFolderDisplayName(this.message.accountId, this.message.folder)
    },

    unifiedMailboxLabelText() {
      return this.messageAccount.unifiedMailboxLabelText
    },

    unifiedMailboxLabelColor() {
      return this.messageAccount.unifiedMailboxLabelColor
    },

    showUnifiedMailboxLabel() {
      return (
        this.isUnifiedInbox &&
        this.messageAccount.includeInUnifiedMailbox &&
        this.messageAccount.showUnifiedMailboxLabel &&
        this.unifiedMailboxLabelText !== ''
      )
    },
  },

  methods: {
    onMessageClick() {
      if (this.isSelectMode) {
        this.selectItemHandler(this.message)
      } else {
        this.$router.push({
          name: 'message-view',
          params: {
            accountId: this.message.accountId,
            folderPath: this.message.folder.split(this.getFoldersDelimiter(this.message.accountId)),
            messageUid: this.message.uid,
          },
        })
      }
    },
  },
}
</script>

<style lang="scss" scoped>
.message {
  // padding: 0;
  // width: 100vw;
  &__unseen {
    background-color: #f4f6f7;
    font-weight: 600;
  }
  &__date {
    // font-size: 80%;
  }
  &__marker {
    border-radius: 10px;
    color: white;
    display: inline-block;
    font-size: 10px;
    font-weight: normal;
    padding: 0px 6px;
  }
  &__contour_marker {
    background: inherit;
    border: solid 1px #a1a3ab;
    border-radius: 10px;
    color: #a1a3ab;
    display: inline-block;
    font-size: 10px;
    font-weight: normal;
    margin-left: 4px;
    padding: 0px 6px;
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
