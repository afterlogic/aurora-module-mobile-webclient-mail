<template>
  <q-scroll-area
    ref="messageScrollArea"
    :thumb-style="{ width: '5px' }"
    class="message-view__scroll"
    style="height: 100%;"
  >
    <div class="messages__loader" v-if="isCurrentMessageLoading">
      <q-spinner-dots color="primary" size="40px" />
    </div>
    <div v-else-if="currentMessage">
      <div class="message-header">
        <div class="message-header__basic" v-show="!isDetailVisible">
          <div class="message-header__recipients">
            <div class="message-header__recipients-sender">{{ sender }}</div>
            <div class="message-header__recipients-to">
              <span
                v-for="(recipient, index) in currentMessage?.to['@Collection']"
                :key="recipient?.Email || index"
                class="message-header__recipient"
              >{{ formatRecipient(recipient) }}</span>
            </div>
          </div>
          <div class="message-header__date">{{ messageDate }}</div>
        </div>     
        <div class="message-header__details" v-show="isDetailVisible">
          <div class="recipients-list">
            <div class="recipient-row">
              <div class="recipient-row__label">{{ $t('MAILWEBCLIENT.LABEL_FROM') }}</div>
              <div class="recipient-row__value">
                <span
                  v-for="(recipient, index) in currentMessage?.from['@Collection']"
                  :key="recipient?.Email || index"
                  class="recipient-row__address"
                >{{ formatRecipient(recipient) }}</span>
              </div>
            </div>
            <div class="recipient-row" v-if="currentMessage?.to['@Collection']?.length > 0">
              <div class="recipient-row__label">{{ $t('MAILWEBCLIENT.LABEL_TO') }}</div>
              <div class="recipient-row__value">
                <span
                  v-for="(recipient, index) in currentMessage?.to['@Collection']"
                  :key="recipient?.Email || index"
                  class="recipient-row__address"
                >{{ formatRecipient(recipient) }}</span>
              </div>
            </div>
            <div class="recipient-row" v-if="currentMessage?.cc['@Collection']?.length > 0">
              <div class="recipient-row__label">{{ $t('COREWEBCLIENT.LABEL_CC') }}</div>
              <div class="recipient-row__value">
                <span
                  v-for="(recipient, index) in currentMessage?.cc['@Collection']"
                  :key="recipient?.Email || index"
                  class="recipient-row__address"
                >{{ formatRecipient(recipient) }}</span>
              </div>
            </div>
            <div class="recipient-row" v-if="currentMessage?.bcc['@Collection']?.length > 0">
              <div class="recipient-row__label">{{ $t('COREWEBCLIENT.LABEL_BCC') }}</div>
              <div class="recipient-row__value">
                <span
                  v-for="(recipient, index) in currentMessage?.bcc['@Collection']"
                  :key="recipient?.Email || index"
                  class="recipient-row__address"
                >{{ formatRecipient(recipient) }}</span>
              </div>
            </div>
            <div class="recipient-row">
              <div class="recipient-row__label">{{ $t('MAILWEBCLIENT.LABEL_DATE') }}</div>
              <div class="recipient-row__value">{{ messageFullDate }}</div>
            </div>
          </div>
        </div>
        <div class="message-header__switcher" @click="toggleDetails">
          {{ isDetailVisible ? $t('COREWEBCLIENT.ACTION_HIDE_DETAILS') : $t('COREWEBCLIENT.ACTION_SHOW_DETAILS') }}
        </div>

        <div class="message-flags">
          <div class="message-flags__flag-folder">{{ currentMessage?.folder }}</div>
          <RepliedIcon
            v-if="currentMessage?.isAnswered"
            color="#949496"
            class="message-flags__flag-replied"
          />
          <ForwardedIcon
            v-if="currentMessage?.isForwarded"
            color="#949496"
            class="message-flags__flag-forwarded"
          />
          <AttachmentIcon
            v-if="currentMessage?.hasAttachments"
            class="message-flags__flag-attachment message-flags__flag-attachment_clickable"
            :color="primaryColor"
            @click="scrollToAttachments"
          />
          <StarIcon class="message-flags__flag-starred"
            v-if="currentMessage?.isFlagged"
            :color="goldColor"
            :strokeColor="goldColor"
            @click="onStarredClick(false)"
          />
          <StarIcon v-else :strokeColor="primaryColor" @click="onStarredClick(true)" />
        </div>
        <div class="message-header__subject">{{ currentMessage.subject }}</div>
        <div class="message-body" v-html="messageBodyHtml"></div>
        <div
          v-if="attachmentList.length"
          ref="attachmentsSection"
          class="message-attachments"
        >
          <AttachmentListItem
            v-for="(attachment, index) in attachmentList"
            :key="attachment.id || index"
            :attachment="attachment"
            :hideRemove="true"
          />
        </div>
      </div>
    </div>
  </q-scroll-area>
</template>

<script>
import { colors } from 'quasar'
const { getPaletteColor } = colors

import { mapState, mapActions, mapGetters } from 'pinia'
import { useMailStore } from '../store/index-pinia'

import addressUtils from 'src/utils/address'
import dateUtils from 'src/utils/date'
import types from 'src/utils/types'

import StarIcon from '../components/icons/message-list/StarIcon'
import RepliedIcon from '../components/icons/message-list/RepliedIcon'
import ForwardedIcon from '../components/icons/message-list/ForwardedIcon'
import AttachmentIcon from '../components/icons/message-list/AttachmentIcon'
import AttachmentListItem from '../components/AttachmentListItem'
import CAttachment from '../classes/CAttachment'
import htmlForEditor from '../utils/html-for-editor'

export default {
  name: 'MessageView',
  
  props: {
    primaryColor: { type: String, default: getPaletteColor('primary') },
    goldColor: { type: String, default: '#febb0f' },
  },

  components: {
    StarIcon,
    RepliedIcon,
    ForwardedIcon,
    AttachmentIcon,
    AttachmentListItem
  },

  data() {
    return {
      isDetailVisible: false,
    }
  },

  computed: {
    ...mapState(useMailStore, ['currentAccountId', 'isUnifiedInbox', 'currentFolder', 'currentMessageList', 'isCurrentMessageLoading', 'currentMessageIdentifiers', 'currentMessage']),
    ...mapGetters(useMailStore, ['currentFoldersDelimiter']),

    isNoMessageOnServer() {
      return !this.isCurrentMessageLoading && !this.currentMessage
    },

    sender() {
      if (!this.currentMessage) {
        return ''
      }
      return addressUtils.getDisplayNamesFromMailsoAddresses(this.currentMessage.from).join(', ')
    },

    messageDate() {
      if (!this.currentMessage) {
        return ''
      }
      return dateUtils.getShortDate(this.currentMessage.timeStampInUTC, true)
    },

    messageFullDate() {
      if (!this.currentMessage) {
        return ''
      }
      return dateUtils.getFullDate(this.currentMessage.timeStampInUTC)
    },

    messageBodyHtml() {
      if (!this.currentMessage) {
        return ''
      }

      return htmlForEditor.prepareHtmlForEditor(this.currentMessage.html, {
        attachments: this.currentMessage.attachments,
        foundCids: this.currentMessage.foundedCIDs,
        sourceHtml: this.currentMessage.html,
      })
    },

    attachmentList() {
      const attachments = [];

      if (this.currentMessage?.attachments['@Collection']) {
        const filteredItemsData = this.currentMessage.attachments['@Collection']
          .filter((item) => !item.IsLinked && !item.IsInline)
        
        filteredItemsData.forEach((item) => {
          const attachment = new CAttachment()
          
          attachment.polulate({
            id: item.Hash,
            filename: item.FileName,
            size: item.EstimatedSize,
            thumbnailUrl: item.ThumbnailUrl,
            actions: item?.Actions
          })

          attachments.push(attachment)
        })
      }

      return attachments
    }
  },

  watch: {
    '$route.params.messageUid': {
      handler: async function () {
        this.setMessageFromRoute()
      },
      immediate: true,
    },

    currentMessageList() {
      this.setMessageFromRoute()
    },

    isNoMessageOnServer() {
      if (this.isNoMessageOnServer && this.currentFolder) {
        if (this.isUnifiedInbox) {
          this.$router.push({ name: 'message-list-unified' })
        } else {
          this.$router.push({
            name: 'message-list',
            params: {
              accountId: this.currentAccountId,
              folderPath: this.currentFolder.fullName.split(this.currentFoldersDelimiter),
            },
          })
        }
      }
    },
  },

  methods: {
    ...mapActions(useMailStore, [
      'changeCurrentMessageIdentifiers',
      'asyncGetCurrentMessage',
      'asyncSetMessageFlagged',
    ]),

    setMessageFromRoute() {
      const accountId = types.pInt(this.$route.params.accountId)
      const folderPath = Array.isArray(this.$route.params.folderPath) ? this.$route.params.folderPath : []
      const folder = folderPath.join(this.currentFoldersDelimiter)
      const uid = types.pInt(this.$route.params.messageUid)
      if (uid === 0) {
        this.changeCurrentMessageIdentifiers(null)
      } else {
        this.changeCurrentMessageIdentifiers({ accountId, folder, uid })
        this.asyncGetCurrentMessage()
      }
    },

    toggleDetails() {
      this.isDetailVisible = !this.isDetailVisible
    },

    formatRecipient(recipient) {
      if (!recipient) {
        return ''
      }

      if (recipient.DislpayName) {
        return recipient.DislpayName + ' <' + recipient.Email + '>'
      }

      return recipient.Email || ''
    },

    async onStarredClick(flag) {
      const prevFlag = this.currentMessage.isFlagged
      const uid = this.currentMessage.uid

      this.currentMessage.isFlagged = flag
      const result = await this.asyncSetMessageFlagged(
        uid,
        flag,
        this.currentMessage.folder,
        this.currentMessage.accountId,
      )
      if (!result) {
        this.currentMessage.isFlagged = prevFlag
      }
    },

    scrollToAttachments() {
      if (!this.attachmentList.length) {
        return
      }

      this.$nextTick(() => {
        const scrollArea = this.$refs.messageScrollArea
        const attachmentsSection = this.$refs.attachmentsSection

        if (!scrollArea || !attachmentsSection) {
          return
        }

        const scrollTarget = scrollArea.getScrollTarget()
        const offset = attachmentsSection.getBoundingClientRect().top
          - scrollTarget.getBoundingClientRect().top
          + scrollTarget.scrollTop

        scrollArea.setScrollPosition('vertical', offset, 300)
      })
    },
  },
}
</script>

<style lang="scss" scoped>
.message-header {
  font-size: 12px;
  
  &__subject {
    font-size: 18px;
    padding-bottom: 14px;
    margin: 6px 16px 24px;
    border-bottom: 1px solid #f6f6f6;
  }
  
  &__recipients {
    padding: 0px 16px;
    color: #B6B5B5;
    &-sender {
      color: #000;
      font-size: 14px;
      margin-bottom: 4px;
    }
    &-to {
      line-height: 1.5;
    }
  }

  &__recipient + &__recipient::before {
    content: ', ';
  }
  &__date {
    padding: 4px 16px 0;
    color: #B6B5B5;
  }

  &__switcher {
    padding: 8px 16px 0;
    color: #469CF8;
  }

  &__basic {
    padding-top: 24px;
  }

  &__details {
    background-color: #dbecfd;
    padding: 16px 0;
  }

  .recipients-list {
    padding: 0 16px;
    display: table;
    width: 100vw;
    .recipient-row {
      display: table-row;

      &__label {
        color: #969494;
        display: table-cell;
        width: 10%;
        padding: 6px 8px 6px 0;
        vertical-align: top;
        white-space: nowrap;
      }
      &__value {
        display: table-cell;
        padding: 6px 0;
        vertical-align: top;
        line-height: 1.5;
      }

      &__address + &__address::before {
        content: ', ';
      }
    }
  }
}

.message-body {
  padding: 0px 16px;
  overflow-x: auto;
  overflow-y: visible;
  width: 100vw;

  :deep(table) {
    max-width: 100%;
    width: auto !important;
  }

  :deep(td),
  :deep(th) {
    width: auto !important;
  }

  :deep(img) {
    max-width: 100%;
    width: auto !important;
    height: auto;
  }
}

.message-flags {
  display: flex;
  margin-top: 24px;
  padding: 0 16px;

  & > * {
    margin-right: 16px;
  }

  &__flag-folder {
    background-color: #B6B5B5;
    border-radius: 100px;
    padding: 0px 10px;
    color: #fff;
  }

  &__flag-attachment {
    fill: #469CF8;

    &_clickable {
      cursor: pointer;
    }
  }
}

.message-attachments {
  padding: 0 16px 16px;
}
</style>

<style lang="scss">
.message-view__scroll {
  .q-scrollarea__content {
    max-width: 100%;
  }
}
</style>
