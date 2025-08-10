<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import { useQuasar } from 'quasar';
import { useChatStore } from '../stores/chat';
import ContactList from '../components/ContactList.vue';
import ChatWindow from '../components/ChatWindow.vue';

const $q = useQuasar();
const store = useChatStore();
const mobileView = ref<'contacts' | 'chat'>('contacts');

function onSelectContact(id: string) {
  store.openChat(id);
  if (!$q.screen.gt.sm) mobileView.value = 'chat';
}

function onBack() {
  store.backToContacts();
  mobileView.value = 'contacts';
}

onMounted(() => {
  store.seedDemo();
  if ($q.screen.gt.sm) {
    const first = store.sortedContacts[0]?.id;
    if (first) store.openChat(first);
  }
  store.connectWs();
});

watch(
  () => $q.screen.gt.sm,
  (isDesktop) => {
    if (!isDesktop) mobileView.value = 'contacts';
  },
);
</script>

<template>
  <q-layout view="lHh Lpr lFf">
    <!-- ДВУХПАНЕЛЬНЫЙ РЕЖИМ (десктоп) -->
    <q-drawer v-if="$q.screen.gt.sm" show-if-above :width="320" bordered>
      <contact-list :contacts="store.sortedContacts" @select="onSelectContact" />
    </q-drawer>

    <q-page-container>
      <q-page class="fit">
        <!-- Десктопная панель диалога -->
        <div v-if="$q.screen.gt.sm" class="fit">
          <div v-if="store.selectedContact" class="fit">
            <chat-window :contact-id="store.selectedContact.id" />
          </div>
          <div v-else class="full-height flex flex-center text-grey-6">
            <div class="text-center">
              <q-icon name="chat" size="64px" class="q-mb-md" />
              <div>Выберите контакт, чтобы открыть диалог</div>
            </div>
          </div>
        </div>

        <!-- МОБИЛЬНЫЙ РЕЖИМ (одна панель) -->
        <div v-else class="fit">
          <div v-if="mobileView === 'contacts'" class="fit">
            <contact-list :contacts="store.sortedContacts" @select="onSelectContact" />
          </div>

          <div v-else class="fit">
            <chat-window
              v-if="store.selectedContact"
              :contact-id="store.selectedContact.id"
              :showBack="true"
              @back="onBack"
            />
          </div>
        </div>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<style>
html,
body,
#q-app,
.fit,
.q-page-container,
.q-page {
  height: 100%;
}
</style>
