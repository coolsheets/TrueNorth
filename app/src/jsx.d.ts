/// <reference types="react" />

declare namespace JSX {
  interface IntrinsicElements {
    // Allow any property on any HTML element
    [elemName: string]: any;
  }
}
