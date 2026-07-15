<template>
  <AppDialog v-model="visible" :close="onCancel">
    <template v-slot:content>
      <div class="dialog__title-text q-mx-lg q-my-md">
        <span>{{ $t('COREWEBCLIENT.CONFIRM_DISCARD_CHANGES') }}</span>
      </div>
    </template>

    <template v-slot:actions>
      <ButtonDialog
        class="q-mb-sm"
        :action="onCancel"
        :label="$t('COREWEBCLIENT.ACTION_CANCEL')"
      />
      <ButtonDialog
        class="q-mr-sm q-mb-sm"
        :action="onOk"
        :label="$t('COREWEBCLIENT.ACTION_OK')"
      />
    </template>
  </AppDialog>
</template>

<script>
import AppDialog from 'components/common/AppDialog'
import ButtonDialog from 'src/components/common/ButtonDialog'

export const COMPOSE_EXIT_ANSWER = {
  OK: 'ok',
  CANCEL: 'cancel',
}

export default {
  name: 'ConfirmComposeExitDialog',

  components: {
    AppDialog,
    ButtonDialog,
  },

  data() {
    return {
      visible: false,
      resolver: null,
    }
  },

  methods: {
    open() {
      this.visible = true
      return new Promise((resolve) => {
        this.resolver = resolve
      })
    },

    settle(answer) {
      this.visible = false
      if (this.resolver) {
        const resolve = this.resolver
        this.resolver = null
        resolve(answer)
      }
    },

    onOk() {
      this.settle(COMPOSE_EXIT_ANSWER.OK)
    },

    onCancel() {
      this.settle(COMPOSE_EXIT_ANSWER.CANCEL)
    },
  },
}
</script>
