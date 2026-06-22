<template>
  <div class="recipients-input">
    <span class="recipients-input__label">{{ label }}</span>
    <q-select
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
      @new-value="createValue"
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
        <q-item v-bind="scope.itemProps">
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
    }
  },

  watch: {
    value (v) {
      this.$emit('update:modelValue', v)
    }
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

    createValue (val, done) {
        // Calling done(var) when new-value-mode is not set or "add", or done(var, "add") adds "var" content to the model
      // and it resets the input textbox to empty string
      // ----
      // Calling done(var) when new-value-mode is "add-unique", or done(var, "add-unique") adds "var" content to the model
      // only if is not already set
      // and it resets the input textbox to empty string
      // ----
      // Calling done(var) when new-value-mode is "toggle", or done(var, "toggle") toggles the model with "var" content
      // (adds to model if not already in the model, removes from model if already has it)
      // and it resets the input textbox to empty string
      // ----
      // If "var" content is undefined/null, then it doesn't tampers with the model
      // and only resets the input textbox to empty string

      if (val.length > 2 && Utils.isCorrectEmail(val)) {
        done({'label': val, 'value': val}, 'add-unique')
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
