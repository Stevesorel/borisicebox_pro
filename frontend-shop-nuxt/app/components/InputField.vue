<template>
  <div class="field" :class="{ error: !!errorMsg }">
    <label v-if="label">{{ label }} <span v-if="required" class="req">*</span></label>
    <textarea
      v-if="type === 'textarea'"
      :value="modelValue"
      @input="$emit('update:modelValue', $event.target.value)"
      :placeholder="placeholder"
      :rows="rows"
      :class="{ invalid: !!errorMsg }"
    ></textarea>
    <select
      v-else-if="type === 'select'"
      :value="modelValue"
      @change="$emit('update:modelValue', $event.target.value)"
      :class="{ invalid: !!errorMsg }"
    >
      <slot />
    </select>
    <input
      v-else
      :type="type"
      :value="modelValue"
      @input="$emit('update:modelValue', $event.target.value)"
      :placeholder="placeholder"
      :class="{ invalid: !!errorMsg }"
    />
    <span v-if="errorMsg" class="err-msg">{{ errorMsg }}</span>
  </div>
</template>

<script setup>
defineProps({
  modelValue:  { default: '' },
  label:       { type: String,  default: '' },
  placeholder: { type: String,  default: '' },
  type:        { type: String,  default: 'text' },
  rows:        { type: Number,  default: 3 },
  required:    { type: Boolean, default: false },
  errorMsg:    { type: String,  default: '' },
})
defineEmits(['update:modelValue'])
</script>

<style scoped>
.field { margin-bottom: 18px; }
label { display: block; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted); margin-bottom: 8px; }
.req  { color: var(--danger); }
input, textarea, select {
  width: 100%; padding: 12px 16px;
  border: 2px solid var(--border); border-radius: var(--radius-sm);
  font-size: 15px; font-family: inherit;
  transition: border 0.2s; background: white;
}
input:focus, textarea:focus, select:focus { border-color: var(--accent); }
.invalid { border-color: var(--danger) !important; background: #fff8f8; }
.err-msg { display: block; color: var(--danger); font-size: 12px; font-weight: 600; margin-top: 5px; }
</style>