import { PARENT_SELECTOR, DIV_ID } from './constants';
import { StyleObj } from './types';

function createElement(): HTMLDivElement {
  const element = document.createElement('div');
  element.setAttribute('id', DIV_ID);
  return element;
}

function getOrCreateElement(): HTMLDivElement {
  const existing = document.getElementById(DIV_ID) as HTMLDivElement | null;
  if (existing) {
    return existing;
  }
  return createElement();
}

export function removeElement(): void {
  const element = document.getElementById(DIV_ID);
  if (element) {
    element.remove();
  }
}

export function injectStyle(style: StyleObj, container?: string): void {
  const element = getOrCreateElement();
  Object.assign(element.style, style);

  if (!element.parentNode) {
    const parent = document.querySelector(container ?? PARENT_SELECTOR);
    if (parent) {
      parent.append(element);
    }
  }
}
