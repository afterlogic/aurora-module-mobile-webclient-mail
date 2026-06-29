<template>
  <div class="add-account q-px-lg q-pt-lg">
    <q-form @submit.prevent="onSubmit">
      <q-input
        v-model="friendlyName"
        dense
        autocomplete="name"
        :placeholder="$t('MAILWEBCLIENT.LABEL_YOUR_NAME')"
        class="q-mb-md"
      />
      <q-input
        v-model="email"
        dense
        type="email"
        autocomplete="username"
        :placeholder="$t('COREWEBCLIENT.LABEL_EMAIL')"
        class="q-mb-md"
      />
      <q-input
        v-model="password"
        dense
        type="password"
        autocomplete="new-password"
        :placeholder="$t('COREWEBCLIENT.LABEL_PASSWORD')"
        class="q-mb-xl"
      />

      <q-btn
        class="full-width q-mb-md app-button"
        type="submit"
        unelevated
        no-caps
        rounded
        color="primary"
        size="lg"
        :label="$t('MAILWEBCLIENT.ACTION_ADD')"
        :loading="loading"
        :disable="!email || !password"
      />
      <q-btn
        class="full-width"
        flat
        no-caps
        color="primary"
        :label="$t('COREWEBCLIENT.ACTION_CANCEL')"
        @click="onCancel"
      />
    </q-form>
  </div>
</template>

<script>
import { mapActions } from 'pinia'
import { useMailStore } from '../../store/index-pinia'

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

  methods: {
    ...mapActions(useMailStore, ['asyncCreateAccount']),

    onCancel() {
      this.$router.back()
    },

    async onSubmit() {
      this.loading = true
      const result = await this.asyncCreateAccount({
        friendlyName: this.friendlyName,
        email: this.email,
        password: this.password,
      })
      this.loading = false

      if (!result) {
        notification.showError(i18n.global.t('MAILWEBCLIENT.ERROR_REQUIRED_FIELDS_EMPTY'))
        return
      }

      if (result.error === 'server_not_found') {
        notification.showError(i18n.global.t('MAILMOBILEWEBCLIENT.ERROR_DOMAIN_NOT_FOUND'))
        return
      }

      if (result.error === 'create_failed') {
        notification.showError(i18n.global.t('MAILWEBCLIENT.ERROR_CREATE_ACCOUNT'))
        return
      }

      if (result.accountId) {
        this.$router.replace({
          name: 'message-list',
          params: { accountId: result.accountId, folderPath: ['INBOX'] },
        })
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
