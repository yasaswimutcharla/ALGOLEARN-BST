export const triggerActivityReset = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('bst-reset-current-activity'));
  }
};
