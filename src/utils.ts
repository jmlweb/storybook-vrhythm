import { PARENT_SELECTOR, DIV_ID } from './constants';
import { StyleObj } from './types';

function createElement() {
  const element = document.createElement('div') as HTMLDivElement;
  element.setAttribute('id', DIV_ID);
  return element;
}

function getOrCreateElement() {
  const elementOnDom = document.getElementById(DIV_ID);
  if (elementOnDom) {
    return elementOnDom;
  }
  return createElement();
}

export function removeElement() {
  const elementOnDom = document.getElementById(DIV_ID);
  elementOnDom &&
    elementOnDom.parentNode &&
    elementOnDom.parentNode.removeChild(elementOnDom);
}

export function injectStyle(style: StyleObj) {
  const element = getOrCreateElement();
  Object.assign(element.style, style);
  const parent = document.querySelector(PARENT_SELECTOR);
  parent && parent.append(element);
}
