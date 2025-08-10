<script setup lang="ts">
import { computed, onMounted, onUpdated, ref, watch } from 'vue';
import { useChatStore } from '../stores/chat';
import type { IScrollComponent } from '../types';

const props = defineProps<{
  contactId: string;
  showBack?: boolean;
}>();
defineEmits<{ (e: 'back'): void }>();

const store = useChatStore();
const draft = ref('');
const scrollRef = ref();

onMounted(scrollToBottom);
onUpdated(scrollToBottom);

const contact = computed(() => store.contacts.get(props.contactId) ?? null);
const contactName = computed(() => contact.value?.name ?? 'Диалог');
const messages = computed(() => contact.value?.messages ?? []);

function scrollToBottom() {
  const el = (scrollRef.value as IScrollComponent)?.getScrollTarget?.();
  if (!el) return;
  // небольшой timeout чтобы DOM успел обновиться
  setTimeout(() => {
    (scrollRef.value as IScrollComponent)?.setScrollPosition('vertical', 10_000_000, 200);
  }, 10);
}

function onSend() {
  const text = draft.value.trim();
  if (!text) return;
  store.sendMessage(text);
  draft.value = '';
  scrollToBottom();
}

function formatTime(ts: number) {
  const d = new Date(ts);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

watch(
  () => props.contactId,
  () => {
    store.openChat(props.contactId);
    scrollToBottom();
  },
  { immediate: true },
);

</script>

<template>
  <div class="chat-wrap">
    <q-toolbar class="bg-grey-2 text-dark" v-if="showBack">
      <q-btn flat round dense icon="arrow_back" @click="$emit('back')" />
      <q-toolbar-title>{{ contactName }}</q-toolbar-title>
    </q-toolbar>
    <q-scroll-area ref="scrollRef" class="chat-scroll">
      <div class="q-pa-md column q-gutter-sm">
        <q-chat-message
          v-for="m in messages"
          :key="m.id"
          :text="[m.text]"
          :sent="m.from === 'me'"
          :stamp="formatTime(m.at)"
        />
      </div>
    </q-scroll-area>

    <div class="q-pa-sm">
      <q-input
        v-model="draft"
        type="textarea"
        autogrow
        placeholder="Напишите сообщение…"
        @keyup.enter.exact.stop.prevent="onSend"
      >
        <template #after>
          <q-btn flat round icon="send" @click="onSend" :disable="!draft.trim()" />
        </template>
      </q-input>
    </div>
  </div>
</template>

<style scoped lang="scss">
.chat-wrap {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0; /* важно для корректной высоты flex-детей */
}
.chat-scroll {
  flex: 1 1 auto;
  /* height: ; */
  min-height: 0;
  height: 90vh; /* не даём переполняться/схлопываться */
}
</style>
