<template>
  <div class="recipients-input" v-bind="$attrs">
    <span class="recipients-input__label">{{ label }}</span>
    <q-select
      ref="selectRef"
      dense
      options-dense
      v-model="value"
      multiple
      class="recipients-input__field"
      popup-content-class="recipients-input__popup"

      :options="options"
      hide-dropdown-icon
      :behavior="$q.platform.is.ios === true ? 'dialog' : 'menu'"
      :loading="true"
      
      use-input
      input-debounce="100"

      @filter="filterFn"
      @filter-abort="abortFilterFn"
      @input-value="onInputValue"
      @new-value="createValue"
      @blur="onFieldBlur"
      @popup-hide="onPopupHide"
      @add="onRecipientAdded"
    >
      <template v-slot:append v-if="showLink">
        <span style="font-size: 14px;" @click="extraLinkAction">{{ extraLink }}</span>
      </template>
      <template v-slot:loading />
      <template v-slot:selected-item="scope">
        <q-chip 
          dense
          rounded
          removable
          @remove="scope.removeAtIndex(scope.index)"
          :tabindex="scope.tabindex"
          color="#f5f5f5"
          text-color="#000"
          class="recipients-input__chip q-my-none q-ml-xs q-mr-none"
        >
          <span class="recipients-input__chip-label ellipsis">{{ scope.opt.label }}</span>
        </q-chip>
      </template>
      <template v-slot:option="scope">
        <q-item
          v-close-popup
          v-bind="scope.itemProps"
          v-on="scope.itemEvents"
          @mousedown.prevent
        >
          <q-item-section>
            <q-item-label class="recipients-input__option-label">{{ scope.opt.label }}</q-item-label>
          </q-item-section>
        </q-item>
      </template>
      <template v-slot:no-option>
        <q-item>
          <q-item-section class="text-grey">
            No contacts found
          </q-item-section>
        </q-item>
      </template>
    </q-select>
  </div>
</template>

<script>
import Utils from 'src/utils/address'

export default {
  name: 'RecipientsInput',
  inheritAttrs: false,

  props: {
    getOptions: { type: Function, required: true },
    label: { type: String, default: 'Label' },
    modelValue: { type: Array, default: [] },
    showLink: { type: Boolean, default: false },
    extraLink: { type: String, default: '' },
    extraLinkAction: { type: Function, default: () => {} },
  },

  emits: ['update:modelValue'],

  data() {
    return {
      options: [],
      value: this.modelValue,
      // Text typed into the search box and not yet turned into a chip.
      pendingInput: '',
      // Kept when Quasar clears the box on popup close (iOS dialog).
      pendingOnClose: '',
      // The next empty input after an iOS dialog close is Quasar's own reset.
      ignoreNextEmptyInput: false,
      closeTimer: null,
    }
  },

  watch: {
    value (v) {
      this.$emit('update:modelValue', v)
    }
  },

  beforeUnmount() {
    clearTimeout(this.closeTimer)
  },

  methods: {
    filterFn (val, update, abort) {
      // call abort() at any time if you can't retrieve data somehow      
      update(async() => {
        this.options = await this.getOptions(val, this.value)
      },
      (ref) => {
        // if (val !== '' && ref.options.length > 0 && ref.getOptionIndex() === -1) {
        //   ref.moveOptionSelection(1, true) // focus the first selectable option and do not update the input-value
        //   ref.toggleOption(ref.options[ ref.optionIndex ], true) // toggle the focused option
        // }
        if (val !== '' && ref.options.length > 0) {
          ref.setOptionIndex(-1) // reset optionIndex in case there is something selected
          ref.moveOptionSelection(1, true) // focus the first selectable option and do not update the input-value
        }
      })
    },

    abortFilterFn () {
      // console.log('delayed filter aborted')
    },

    onInputValue(value) {
      const next = String(value || '').trim()
      this.pendingInput = next

      // iOS opens suggestions in a dialog and wipes the box when that dialog
      // closes, before blur. That empty update is not the user deleting text.
      if (next === '' && this.ignoreNextEmptyInput) {
        this.ignoreNextEmptyInput = false
        return
      }

      if (this.isRecipientFieldActive()) {
        this.pendingOnClose = next
      }
    },

    onPopupHide() {
      if (!this.pendingInput) {
        return
      }

      this.pendingOnClose = this.pendingInput
      if (this.$q.platform.is.ios === true) {
        this.ignoreNextEmptyInput = true
      }

      clearTimeout(this.closeTimer)
      this.closeTimer = setTimeout(() => {
        if (this.isRecipientFieldActive()) {
          return
        }
        this.commitPendingRecipient()
      }, 0)
    },

    onFieldBlur() {
      this.commitPendingRecipient()
    },

    isRecipientFieldActive() {
      const active = document.activeElement
      if (!active || typeof active.closest !== 'function') {
        return false
      }

      const root = this.$refs.selectRef?.$el
      if (root && root.contains(active)) {
        return true
      }

      // The iOS suggestion dialog is teleported outside the field.
      return !!active.closest('.q-select__dialog')
    },

    commitPendingRecipient() {
      const typed = (this.pendingInput || this.pendingOnClose || '').trim()
      this.pendingInput = ''
      this.pendingOnClose = ''
      this.ignoreNextEmptyInput = false
      clearTimeout(this.closeTimer)

      if (!typed) {
        return
      }

      const select = this.$refs.selectRef
      if (!select) {
        return
      }

      this.createValue(typed, (option, mode) => {
        select.add(option, mode === 'add-unique')
        select.updateInputValue('', true)
      })
    },

    onRecipientAdded() {
      // A chosen suggestion replaces the search text. Do not also keep it.
      this.pendingInput = ''
      this.pendingOnClose = ''
      this.ignoreNextEmptyInput = false
      clearTimeout(this.closeTimer)

      this.$nextTick(() => {
        const select = this.$refs.selectRef
        if (!select) {
          return
        }

        select.updateInputValue('')
        select.hidePopup()
      })
    },

    createValue (val, done) {
      // done(value, "add-unique") adds the value when it is not already selected
      // and clears the text box. A null value only clears the box.
      const email = String(val || '').trim()
      if (email.length > 2 && Utils.isCorrectEmail(email)) {
        done({ label: email, value: email }, 'add-unique')
      }
    },
  },
}
</script>

<style lang="scss" scoped>
.recipients-input {
  display: flex;
  align-items: flex-start;
  width: 100%;
  max-width: 100%;
  min-width: 0;
}

.recipients-input__label {
  flex: 0 0 4.5rem;
  width: 4.5rem;
  font-size: 14px;
  line-height: 40px;
  padding-right: 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.recipients-input__field {
  flex: 1 1 0;
  width: 0;
  min-width: 0;
  max-width: 100%;
  overflow: hidden;

  :deep(.q-field__inner),
  :deep(.q-field__control),
  :deep(.q-field__control-container),
  :deep(.q-field__native) {
    min-width: 0;
    max-width: 100%;
  }

  :deep(.q-field__control),
  :deep(.q-field__control-container) {
    overflow: hidden;
  }

  :deep(.q-field__native) {
    flex-wrap: wrap;
    overflow: hidden;
  }

  :deep(.q-field__input) {
    min-width: 0 !important;
    flex: 1 1 24px !important;
    width: 0 !important;
    max-width: 100%;
  }

  :deep(.q-field__append) {
    flex-shrink: 0;
  }
}

.recipients-input__chip {
  flex: 0 1 auto;
  max-width: 100%;
  min-width: 0;
  overflow: hidden;

  :deep(.q-chip__content) {
    min-width: 0;
    overflow: hidden;
  }
}

.recipients-input__chip-label {
  display: block;
  min-width: 0;
  max-width: 100%;
}

.recipients-input__option-label {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  word-break: break-word;
  white-space: normal;
}
</style>

<style lang="scss">
.recipients-input__popup {
  overflow-x: hidden;

  .q-item__section--main {
    min-width: 0;
  }
}
</style>
