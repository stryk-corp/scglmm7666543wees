'use client';

import { EventEmitter } from 'events';
import type { FirestorePermissionError } from './errors';

// This is a type-safe event emitter for handling permission errors globally.
// It decouples the data layer from the UI layer.

type ErrorEvents = {
  'permission-error': (error: FirestorePermissionError) => void;
};

class TypedEventEmitter<T extends Record<string, any>> {
  private emitter = new EventEmitter();

  on<E extends keyof T>(event: E, listener: T[E]): void {
    this.emitter.on(event as string, listener);
  }

  emit<E extends keyof T>(event: E, ...args: Parameters<T[E]>): void {
    this.emitter.emit(event as string, ...args);
  }
}

export const errorEmitter = new TypedEventEmitter<ErrorEvents>();
