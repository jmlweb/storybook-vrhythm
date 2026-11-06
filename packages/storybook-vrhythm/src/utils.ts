import {
  ANCHOR_DATA_KEY,
  ANCHOR_PAGE,
  ANCHOR_STORY,
  DIV_ID,
  OFFSET_DATA_KEY,
  PARENT_SELECTOR,
  STORY_ROOT_ATTRIBUTE,
} from './constants';
import type { StyleObj } from './types';

let stopWatching: (() => void) | null = null;

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

function queryOrNull(selector: string): Element | null {
  try {
    return document.querySelector(selector);
  } catch {
    return null;
  }
}

export function removeElement(): void {
  stopWatching?.();
  stopWatching = null;

  const element = document.getElementById(DIV_ID);
  if (element) {
    element.remove();
  }
}

export function injectStyle(
  style: StyleObj,
  dataset: Record<string, string> = {}
): void {
  const element = getOrCreateElement();

  // The element is reused across stories, so a key missing from the new style
  // or dataset would otherwise keep the previous story's value.
  element.style.cssText = '';
  for (const key of Object.keys(element.dataset)) {
    delete element.dataset[key];
  }
  Object.assign(element.style, style);
  Object.assign(element.dataset, dataset);

  const parent = document.querySelector(PARENT_SELECTOR);
  if (parent && element.parentNode !== parent) {
    parent.append(element);
  }
}

/**
 * The element the overlay's first line aligns to, or `null` for the page.
 * A selector that matches nothing is also `null`: `isAnchorMissing` tells them apart.
 */
export function resolveAnchor(
  overlay: HTMLElement,
  root?: Element | null
): Element | null {
  const anchor = overlay.dataset[ANCHOR_DATA_KEY] ?? ANCHOR_PAGE;

  if (anchor === ANCHOR_PAGE) {
    return null;
  }
  if (anchor === ANCHOR_STORY) {
    return (
      root?.closest(`[${STORY_ROOT_ATTRIBUTE}]`) ??
      root ??
      document.querySelector(`[${STORY_ROOT_ATTRIBUTE}]`)
    );
  }
  return queryOrNull(anchor);
}

export function isAnchorMissing(
  overlay: HTMLElement,
  anchor: Element | null
): boolean {
  const name = overlay.dataset[ANCHOR_DATA_KEY] ?? ANCHOR_PAGE;
  return !anchor && name !== ANCHOR_PAGE && name !== ANCHOR_STORY;
}

/**
 * Starts the overlay at the anchor and runs it to the end of the document.
 *
 * The overlay is collapsed while measuring: left at full height, it would hold
 * `scrollHeight` up after content shrinks. Measuring its own top at `top: 0`
 * finds the containing block, which is not the page when `body` is positioned.
 */
export function syncOverlay(
  overlay: HTMLElement,
  anchor: Element | null
): void {
  const offset = overlay.dataset[OFFSET_DATA_KEY] ?? '0px';

  overlay.style.bottom = 'auto';
  overlay.style.height = '0';
  overlay.style.top = '0';

  const blockTop = overlay.getBoundingClientRect().top;
  const anchorTop = anchor ? anchor.getBoundingClientRect().top : blockTop;
  overlay.style.top = `calc(${anchorTop - blockTop}px + ${offset})`;

  const overlayTop = overlay.getBoundingClientRect().top + window.scrollY;
  const documentHeight = document.documentElement.scrollHeight;
  overlay.style.height = `${Math.max(documentHeight - overlayTop, 0)}px`;
}

/**
 * Keeps the overlay on its anchor across renders and resizes. Stories render
 * after decorators run and hooks fire after `play`, so an observer is what puts
 * the picture in place. The audit syncs for itself before it measures.
 */
export function keepOverlayInSync(storyRoot?: Element): void {
  stopWatching?.();
  stopWatching = null;
  storyRoot?.setAttribute(STORY_ROOT_ATTRIBUTE, '');

  const sync = (): void => {
    const overlay = document.getElementById(DIV_ID);
    if (overlay) {
      syncOverlay(overlay, resolveAnchor(overlay, storyRoot));
    }
  };

  sync();

  if (typeof ResizeObserver === 'undefined') {
    return;
  }

  const observer = new ResizeObserver(sync);
  observer.observe(document.documentElement);
  observer.observe(document.body);
  if (storyRoot) {
    observer.observe(storyRoot);
  }
  stopWatching = () => observer.disconnect();
}
