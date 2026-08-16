/**
 * Littiwale — Location Selector (Cloud Kitchen Default)
 * Physical Outlet modal and banners removed.
 * Defaults permanently to Cloud Kitchen ('cloud').
 */
(function () {
  'use strict';
  try {
    sessionStorage.setItem('littiWaleLocation', 'cloud');
    window.currentLocationFilter = 'cloud';
    document.dispatchEvent(new CustomEvent('littiWaleLocationSelected', { detail: 'cloud' }));
  } catch (e) {}
})();
