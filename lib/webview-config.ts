/**
 * Advanced ad-blocking script - focused and minimal.
 * Removes ads without interfering with page interactivity.
 */
export const ADVANCED_AD_BLOCKING_SCRIPT = `
(function() {
  // Remove ad containers and elements
  const adSelectors = [
    '.ad-container',
    '.advertisement',
    '[data-ad-slot]',
    '.ytp-ad-module',
    '.ytp-ad-player-overlay',
    '.video-ads',
    '.ad-interrupting',
    'ytd-ad-slot-renderer',
    'yt-formatted-string[aria-label*="advertisement"]',
    '.yt-simple-endpoint[href*="ads"]',
    'ytd-promoted-sparkles-web-renderer',
    '.ytp-pause-overlay-container',
    'div[data-is-ad="true"]',
  ];

  // Throttled ad removal to improve performance
  let removeAdsTimeout;
  function removeAds() {
    clearTimeout(removeAdsTimeout);
    removeAdsTimeout = setTimeout(() => {
      adSelectors.forEach(selector => {
        try {
          const elements = document.querySelectorAll(selector);
          elements.forEach(el => {
            if (el && el.parentNode) {
              el.style.display = 'none';
              el.remove?.();
            }
          });
        } catch (e) {
          // Ignore selector errors
        }
      });

      // Remove video ads by skipping them
      const skipButton = document.querySelector('.ytp-ad-skip-button-modern, .ytp-skip-ad-button');
      if (skipButton && skipButton.offsetHeight > 0) {
        try {
          skipButton.click();
        } catch (e) {
          // Ignore click errors
        }
      }
    }, 100);
  }

  // Run on load
  removeAds();

  // Watch for new ads being injected with throttling
  let mutationTimeout;
  const observer = new MutationObserver(() => {
    clearTimeout(mutationTimeout);
    mutationTimeout = setTimeout(removeAds, 200);
  });
  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });

  window.adBlockerActive = true;
  window.ReactNativeWebView?.postMessage(JSON.stringify({ type: 'AD_BLOCKER_READY' }));
})();
`;
