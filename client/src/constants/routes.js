/**
 * Application Routes Configuration & Navigation Items
 * Corresponding 1:1 with The Match Mirror (v1.0 Desktop)
 */

export const ROUTES = {
  HOME: '/',
  CAMERA: '/camera',
  ANALYSIS: '/analysis',
  FOUNDATION: '/shades',
  BLENDING: '/blending',
  DIAGNOSTICS: '/diagnostics',
  PROFILE: '/profile',
};

export const NAV_ITEMS = [
  { id: '01', num: '01', label: 'Dashboard / Home', shortcut: 'F1', path: ROUTES.HOME },
  { id: '02', num: '02', label: 'Camera & Quality Check', shortcut: 'F2', path: ROUTES.CAMERA },
  { id: '03', num: '03', label: 'Skin Color Analysis', shortcut: 'F3', path: ROUTES.ANALYSIS },
  { id: '04', num: '04', label: 'Foundation Recommen...', shortcut: 'F4', path: ROUTES.FOUNDATION },
  { id: '05', num: '05', label: 'Blending Heatmap', shortcut: 'F5', path: ROUTES.BLENDING },
  { id: '06', num: '06', label: 'System Diagnostics', shortcut: 'F6', path: ROUTES.DIAGNOSTICS },
];

export default ROUTES;
