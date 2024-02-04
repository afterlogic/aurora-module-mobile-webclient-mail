<template>
  <q-select
    dense
    options-dense
    v-model="value"
    multiple

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
    <template v-slot:prepend>
      <span style="font-size: 14px;">{{ label }}</span>
    </template>
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
        class="q-my-none q-ml-xs q-mr-none"
      >
        {{ scope.opt.label }}
      </q-chip>
    </template>
    <template v-slot:no-option>
      <q-item>
        <q-item-section class="text-grey">
          No contacts found
        </q-item-section>
      </q-item>
    </template>
  </q-select>
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
