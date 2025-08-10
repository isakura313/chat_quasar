<script setup lang="ts">
import type { IContact } from '../types';

defineProps<{
  contacts: IContact[];
}>();

defineEmits<{
  (e: 'select', id: string): void;
}>();
</script>

<template>
  <q-list bordered separator>
    <q-item v-for="c in contacts" :key="c.id" clickable @click="$emit('select', c.id)">
      <q-item-section avatar>
        <q-avatar square>{{ c.name.charAt(0).toUpperCase() }}</q-avatar>
      </q-item-section>

      <q-item-section>
        <q-item-label class="text-weight-medium">{{ c.name }}</q-item-label>
        <q-item-label caption lines="1">{{ c.lastMessage || 'Без сообщений' }}</q-item-label>
      </q-item-section>

      <q-item-section side top>
        <div class="row items-center q-gutter-xs">
          <q-badge v-if="c.unread > 0" :label="c.unread" />
          <q-icon name="chevron_right" />
        </div>
      </q-item-section>
    </q-item>

    <q-item v-if="contacts.length === 0" dense>
      <q-item-section>
        <q-item-label caption>Пока нет контактов — ждём входящих сообщений…</q-item-label>
      </q-item-section>
    </q-item>
  </q-list>
</template>
