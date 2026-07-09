<template>
  <div class="account-switcher q-pl-lg q-pr-lg q-pt-lg q-pb-md">
    <div class="account-switcher__name">
      {{ holderDisplayName }}
    </div>

    <div
      v-if="hasMultipleAccounts"
      ref="dropdown"
      class="account-dropdown q-mt-md"
    >
      <div class="account-dropdown__header" @click.stop="toggleOpen">
        <span class="account-dropdown__current-email">{{ currentAccountEmail }}</span>
        <span class="account-dropdown__caret" :class="{ 'account-dropdown__caret--up': isOpen }" />
      </div>

      <div v-if="isOpen" class="account-dropdown__panel">
        <div
          v-for="account in accountList"
          :key="account.id"
          class="account-dropdown__item"
          @click="onAccountSelect(account.id)"
        >
          {{ account.email }}
        </div>
      </div>
    </div>

    <div v-else class="account-switcher__email q-mt-md">
      {{ currentAccountEmail }}
    </div>
  </div>
</template>

<script>
import { mapState, mapGetters } from 'pinia'
import { useMailStore } from '../../store/index-pinia'
import accountsUtils from '../../utils/accounts'
import eventBus from 'src/event-bus'

export default {
  name: 'AccountSwitcher',

  data() {
    return {
      isOpen: false,
    }
  },

  computed: {
    ...mapState(useMailStore, ['accountList']),
    ...mapGetters(useMailStore, ['currentAccount']),

    currentAccountId() {
      return (this.currentAccount && this.currentAccount.id) || 0
    },

    hasMultipleAccounts() {
      return this.accountList.length > 1
    },

    holderDisplayName() {
      if (this.currentAccount) {
        return accountsUtils.getAccountHolderDisplayName(this.currentAccount)
      }
      return ''
    },

    currentAccountEmail() {
      return this.currentAccount?.email || ''
    },
  },

  mounted() {
    eventBus.$on('closeDrawer', this.closeDropdown)
    document.addEventListener('touchstart', this.handleDocumentClick)
    document.addEventListener('click', this.handleDocumentClick)
  },

  beforeUnmount() {
    eventBus.$off('closeDrawer', this.closeDropdown)
    document.removeEventListener('touchstart', this.handleDocumentClick)
    document.removeEventListener('click', this.handleDocumentClick)
  },

  methods: {
    toggleOpen() {
      this.isOpen = !this.isOpen
    },

    closeDropdown() {
      this.isOpen = false
    },

    handleDocumentClick(event) {
      if (!this.isOpen) {
        return
      }

      const dropdown = this.$refs.dropdown
      if (dropdown && !dropdown.contains(event.target)) {
        this.closeDropdown()
      }
    },

    onAccountSelect(accountId) {
      if (accountId === this.currentAccountId) {
        this.closeDropdown()
        return
      }

      this.closeDropdown()
      this.$router.push({
        name: 'message-list',
        params: { accountId, folderPath: ['INBOX'] },
      })
      eventBus.$emit('closeDrawer')
    },
  },
}
</script>

<style lang="scss" scoped>
.account-switcher {
  position: relative;
  z-index: 2;

  &__name {
    font-size: 20px;
    font-weight: 400;
    line-height: 1.25;
    color: #000;
    word-break: break-word;
  }

  &__email {
    font-size: 16px;
    line-height: 1.3;
    color: #000;
    word-break: break-all;
  }
}

.account-dropdown {
  position: relative;

  &__header {
    position: relative;
    z-index: 2;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 14px 16px;
    border: 1px solid #469cf8;
    border-radius: 12px;
    background-color: #fff;
    cursor: pointer;
    user-select: none;
  }

  &__current-email {
    flex: 1;
    min-width: 0;
    font-size: 16px;
    line-height: 1.3;
    color: #000;
    word-break: break-all;
  }

  &__caret {
    flex-shrink: 0;
    width: 0;
    height: 0;
    border-left: 5px solid transparent;
    border-right: 5px solid transparent;
    border-top: 6px solid #469cf8;
    transition: transform 0.15s ease;

    &--up {
      transform: rotate(180deg);
    }
  }

  &__panel {
    position: absolute;
    top: calc(100% - 10px);
    left: 0;
    right: 0;
    z-index: 1;
    padding: 22px 16px 14px;
    border: 1px solid #469cf8;
    border-radius: 0 0 12px 12px;
    background-color: #edf6ff;
  }

  &__item {
    padding: 10px 0 0;
    font-size: 16px;
    line-height: 1.3;
    color: #969494;
    word-break: break-all;
    cursor: pointer;

    &:first-child {
      padding-top: 0;
    }
  }
}
</style>
