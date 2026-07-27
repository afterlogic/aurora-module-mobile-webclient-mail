<template>
  <div class="add-account q-px-lg q-pt-lg" data-test-id="settings-add-account">
    <q-form @submit.prevent="onSubmit">
      <q-input
        data-test-id="settings-add-account-name"
        v-model="friendlyName"
        dense
        autocomplete="name"
        :placeholder="$t('MAILWEBCLIENT.LABEL_YOUR_NAME')"
        class="q-mb-md"
      />
      <q-input
        data-test-id="settings-add-account-email"
        v-model="email"
        dense
        type="email"
        autocomplete="username"
        :placeholder="$t('COREWEBCLIENT.LABEL_EMAIL')"
        class="q-mb-md"
      />
      <q-input
        data-test-id="settings-add-account-password"
        v-model="password"
        dense
        type="password"
        autocomplete="new-password"
        :placeholder="$t('COREWEBCLIENT.LABEL_PASSWORD')"
        class="q-mb-xl"
      />
    </q-form>
  </div>
</template>

<script>
import { mapActions } from 'pinia'
import { useMailStore } from '../../store/index-pinia'

import eventBus from 'src/event-bus'
import notification from 'src/utils/notification'
import { i18n } from 'src/boot/i18n'

export default {
  name: 'AddAccount',

  data() {
    return {
      friendlyName: '',
      email: '',
      password: '',
      loading: false,
    }
  },

  watch: {
    email() {
      this.updateHeaderActionDisabled()
    },
    password() {
      this.updateHeaderActionDisabled()
    },
  },

  mounted() {
    eventBus.$on('MailMobileWebclient::AddAccount', this.onSubmit)
    this.updateHeaderActionDisabled()
  },

  beforeUnmount() {
    eventBus.$off('MailMobileWebclient::AddAccount', this.onSubmit)
    eventBus.$emit('SettingsMobileWebclient::SetHeaderActionDisabled', false)
  },

  methods: {
    ...mapActions(useMailStore, ['asyncCreateAccount']),

    updateHeaderActionDisabled() {
      eventBus.$emit(
        'SettingsMobileWebclient::SetHeaderActionDisabled',
        !this.email || !this.password
      )
    },

    async onSubmit() {
      if (!this.email || !this.password || this.loading) {
        return
      }

      eventBus.$emit('SettingsMobileWebclient::SetHeaderActionSaving', true)
      this.loading = true
      try {
        const result = await this.asyncCreateAccount({
          friendlyName: this.friendlyName,
          email: this.email,
          password: this.password,
        })

        if (!result) {
          notification.showError(i18n.global.t('MAILWEBCLIENT.ERROR_REQUIRED_FIELDS_EMPTY'))
          return
        }

        if (result.error === 'server_not_found') {
          notification.showError(i18n.global.t('MAILMOBILEWEBCLIENT.ERROR_DOMAIN_NOT_FOUND'))
          return
        }

        // Toast already shown by web-api (credentials / create error).
        if (result.error === 'create_failed') {
          return
        }

        if (result.accountId) {
          this.$router.replace({
            name: 'message-list',
            params: { accountId: result.accountId, folderPath: ['INBOX'] },
          })
        }
      } finally {
        this.loading = false
        eventBus.$emit('SettingsMobileWebclient::SetHeaderActionSaving', false)
      }
    },
  },
}
</script>

<style lang="scss" scoped>
.add-account {
  :deep(.q-field__native) {
    font-size: 16px;
  }
}
</style>
