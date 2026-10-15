import React from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { ROUTES } from '../constants/routes';
import DesktopLayout from '../components/layout/DesktopLayout';
import DesktopHomePage from '../features/home/pages/DesktopHomePage';
import DesktopCameraView from '../features/analysis/pages/DesktopCameraView';
import DesktopSkinAnalysisView from '../features/analysis/pages/DesktopSkinAnalysisView';
import DesktopFoundationView from '../features/foundation/pages/DesktopFoundationView';
import DesktopBlendingHeatmapView from '../features/blending/pages/DesktopBlendingHeatmapView';
import DesktopDiagnosticsView from '../features/diagnostics/pages/DesktopDiagnosticsView';
import NotFound from '../pages/NotFound';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <DesktopLayout />,
    errorElement: <NotFound />,
    children: [
      {
        index: true,
        element: <DesktopHomePage />,
      },
      {
        path: ROUTES.CAMERA,
        element: <DesktopCameraView />,
      },
      {
        path: ROUTES.ANALYSIS,
        element: <DesktopSkinAnalysisView />,
      },
      {
        path: ROUTES.FOUNDATION,
        element: <DesktopFoundationView />,
      },
      {
        path: ROUTES.BLENDING,
        element: <DesktopBlendingHeatmapView />,
      },
      {
        path: ROUTES.DIAGNOSTICS,
        element: <DesktopDiagnosticsView />,
      },
      {
        path: '*',
        element: <NotFound />,
      },
    ],
  },
]);

export default router;
