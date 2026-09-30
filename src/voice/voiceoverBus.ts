/**
 * PRIVACYGUARD VOICEOVER SUBSYSTEM & EVENT BUS
 * One-directional bridge between Navigation and Voiceover.
 * 
 * Rules:
 * - SCREEN_CHANGED is the ONLY event navigation sends to Voiceover.
 * - Voiceover CANNOT call navigate() and CANNOT publish assistant events.
 * - Transitions V01 and V02 govern Voiceover behavior upon SCREEN_CHANGED.
 */

import { PageId, NavParams, NavFilters } from './routeRegistry';
import { VoiceoverState, VoiceoverTransitionId } from './types';

export interface ScreenChangedEvent {
  type: 'SCREEN_CHANGED';
  page: PageId;
  params?: NavParams;
  filters?: NavFilters;
  timestamp: number;
}

export type VoiceoverListener = (event: ScreenChangedEvent) => void;

class VoiceoverBus {
  private state: VoiceoverState = 'VOICEOVER_IDLE';
  private readQueue: string[] = [];
  private listeners: VoiceoverListener[] = [];
  private lastTransition: VoiceoverTransitionId | null = null;
  private isSynthesizingSpeech: boolean = false;

  public getState(): VoiceoverState {
    return this.state;
  }

  public getLastTransition(): VoiceoverTransitionId | null {
    return this.lastTransition;
  }

  public getQueueLength(): number {
    return this.readQueue.length;
  }

  /**
   * Called only when user triggers explanation, demo mode, or explicit narration
   */
  public startSpeaking(text: string, queue: string[] = []): void {
    this.state = 'VOICEOVER_SPEAKING';
    this.readQueue = [...queue];
    this.isSynthesizingSpeech = true;
  }

  public pause(): void {
    if (this.state === 'VOICEOVER_SPEAKING') {
      this.state = 'VOICEOVER_PAUSED';
    }
  }

  /**
   * Navigation handler emits SCREEN_CHANGED upon successful navigation (T46–T48, T50, T51).
   * Implements V01 and V02.
   */
  public emitScreenChanged(event: Omit<ScreenChangedEvent, 'type' | 'timestamp'>): void {
    const fullEvent: ScreenChangedEvent = {
      type: 'SCREEN_CHANGED',
      ...event,
      timestamp: Date.now(),
    };

    if (this.state === 'VOICEOVER_SPEAKING' || this.state === 'VOICEOVER_PAUSED') {
      // V01: VOICEOVER_SPEAKING / VOICEOVER_PAUSED + SCREEN_CHANGED -> VOICEOVER_IDLE
      // Stop speech immediately, discard read queue, do NOT resume, do NOT auto-narrate
      this.state = 'VOICEOVER_IDLE';
      this.readQueue = [];
      this.isSynthesizingSpeech = false;
      this.lastTransition = 'V01';
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    } else {
      // V02: VOICEOVER_IDLE + SCREEN_CHANGED -> VOICEOVER_IDLE (noop)
      this.state = 'VOICEOVER_IDLE';
      this.lastTransition = 'V02';
    }

    for (const listener of this.listeners) {
      try {
        listener(fullEvent);
      } catch (err) {
        console.error('Voiceover listener error:', err);
      }
    }
  }

  public subscribe(listener: VoiceoverListener): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  public reset(): void {
    this.state = 'VOICEOVER_IDLE';
    this.readQueue = [];
    this.lastTransition = null;
    this.isSynthesizingSpeech = false;
  }
}

export const voiceoverBus = new VoiceoverBus();
