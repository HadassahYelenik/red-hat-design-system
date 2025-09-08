import { LitElement, html } from 'lit';
import { customElement } from 'lit/decorators/custom-element.js';
import { property } from 'lit/decorators/property.js';
import { queryAssignedElements } from 'lit/decorators/query-assigned-elements.js';

import { themable } from '@rhds/elements/lib/themable.js';

import styles from './rh-button-group.css';

@customElement('rh-button-group')
@themable
export class RhButtonGroup extends LitElement {
  static readonly styles = [styles];

  /**
   * Defines the relationship of the grouped buttons.
   * - "group": regular tab order
   * - "toolbar": roving tabindex (arrow key navigation)
   */
  @property({ reflect: true })
  role: 'group' | 'toolbar' = 'group';

  @queryAssignedElements({ flatten: true })
  private _buttons!: HTMLElement[];

  firstUpdated() {
    if (this.role === 'toolbar') {
      this._setupToolbar();
    }
  }

  private _setupToolbar() {
    // Initialize roving tabindex: only first button focusable
    this._buttons.forEach((btn, i) => {
      btn.setAttribute('tabindex', i === 0 ? '0' : '-1');
    });

    this.addEventListener('keydown', (event: KeyboardEvent) => {
      if (this.role !== 'toolbar') return;

      const currentIndex = this._buttons.findIndex(
        btn => btn.getAttribute('tabindex') === '0'
      );

      if (['ArrowRight', 'ArrowDown'].includes(event.key)) {
        event.preventDefault();
        this._moveFocus(currentIndex, 1);
      } else if (['ArrowLeft', 'ArrowUp'].includes(event.key)) {
        event.preventDefault();
        this._moveFocus(currentIndex, -1);
      } else if (event.key === 'Home') {
        event.preventDefault();
        this._focusButton(0);
      } else if (event.key === 'End') {
        event.preventDefault();
        this._focusButton(this._buttons.length - 1);
      }
    });
  }

  private _moveFocus(current: number, delta: number) {
    const nextIndex = (current + delta + this._buttons.length) % this._buttons.length;
    this._focusButton(nextIndex);
  }

  private _focusButton(index: number) {
    this._buttons.forEach((btn, i) => {
      btn.setAttribute('tabindex', i === index ? '0' : '-1');
    });
    this._buttons[index].focus();
  }

  override render() {
    return html`
      <div role="${this.role}">
        <slot></slot>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'rh-button-group': RhButtonGroup;
  }
}
