import { IGRPButton, IGRPSeparator } from '@igrp/igrp-framework-react-design-system';
import React, { useEffect, useCallback } from 'react';
import BpmnJS from 'bpmn-js/lib/Modeler';

interface ZoomControlsProps {
  modeler: BpmnJS;
}

const ZoomControls: React.FC<ZoomControlsProps> = ({ modeler }) => {
  // Zoom step size
  const ZOOM_STEP = 0.1;
  const MIN_ZOOM = 0.2;
  const MAX_ZOOM = 4;

  // Initialize zoom level from canvas
  useEffect(() => {
    if (!modeler) return;

    try {
      const canvas = modeler.get('canvas');
      if (canvas && canvas._container) {
        // Initialize zoom level if needed
        canvas.zoom();
      }

      // Listen for zoom changes
      const eventBus = modeler.get('eventBus');
      if (eventBus) {
        const onZoomChanged = () => {
          // Handle zoom changes if needed
        };

        eventBus.on('canvas.viewbox.changed', onZoomChanged);

        return () => {
          eventBus.off('canvas.viewbox.changed', onZoomChanged);
        };
      }
    } catch (error) {
      console.error('Error initializing zoom level:', error);
    }
  }, [modeler]);

  // Zoom in function
  const handleZoomIn = useCallback(() => {
    if (!modeler) return;

    try {
      const canvas = modeler.get('canvas');
      if (!canvas) return;
      
      const currentZoom = canvas.zoom();
      const newZoom = Math.min(currentZoom + ZOOM_STEP, MAX_ZOOM);

      canvas.zoom(newZoom);
    } catch (error) {
      console.error('Error handling zoom in:', error);
    }
  }, [modeler]);

  // Zoom out function
  const handleZoomOut = useCallback(() => {
    if (!modeler) return;

    try {
      const canvas = modeler.get('canvas');
      if (!canvas) return;
      
      const currentZoom = canvas.zoom();
      const newZoom = Math.max(currentZoom - ZOOM_STEP, MIN_ZOOM);

      canvas.zoom(newZoom);
    } catch (error) {
      console.error('Error handling zoom out:', error);
    }
  }, [modeler]);

  // Reset zoom function (fit to viewport)
  const handleResetZoom = useCallback(() => {
    if (!modeler) return;

    try {
      const canvas = modeler.get('canvas');
      if (!canvas) return;
      
      canvas.zoom('fit-viewport');
    } catch (error) {
      console.error('Error handling reset zoom:', error);
    }
  }, [modeler]);

  // Register keyboard shortcuts
  useEffect(() => {
    if (!modeler) return;

    try {
      const keyboard = modeler.get('keyboard');
      if (!keyboard) return;

      // Add zoom in shortcut (Ctrl/Cmd + +)
      const zoomInListener = function (context: { keyEvent: KeyboardEvent }) {
        const event = context.keyEvent;

        if (keyboard.isKey(['=', '+'], event) && keyboard.isCmd(event)) {
          handleZoomIn();
          return true;
        }
      };

      // Add zoom out shortcut (Ctrl/Cmd + -)
      const zoomOutListener = function (context: { keyEvent: KeyboardEvent }) {
        const event = context.keyEvent;

        if (keyboard.isKey(['-', '_'], event) && keyboard.isCmd(event)) {
          handleZoomOut();
          return true;
        }
      };

      // Add reset zoom shortcut (Ctrl/Cmd + 0)
      const resetZoomListener = function (context: { keyEvent: KeyboardEvent }) {
        const event = context.keyEvent;

        if (keyboard.isKey(['0'], event) && keyboard.isCmd(event)) {
          handleResetZoom();
          return true;
        }
      };

      keyboard.addListener(zoomInListener);
      keyboard.addListener(zoomOutListener);
      keyboard.addListener(resetZoomListener);

      return () => {
        // Clean up keyboard listeners
        try {
          keyboard.removeListener(zoomInListener);
          keyboard.removeListener(zoomOutListener);
          keyboard.removeListener(resetZoomListener);
        } catch (error) {
          console.error('Error removing keyboard listeners:', error);
        }
      };
    } catch (error) {
      console.error('Error setting up keyboard shortcuts:', error);
      // Continue rendering the component even if keyboard shortcuts fail
    }
  }, [modeler, handleZoomIn, handleZoomOut, handleResetZoom]);

  // Register touch gestures for pinch zoom
  useEffect(() => {
    if (!modeler) return;

    // Wait for the modeler to be fully initialized
    const setupTouchGestures = () => {
      try {
        const canvas = modeler.get('canvas');
        if (!canvas || !canvas._container) {
          // If canvas is not ready, retry after a short delay
          setTimeout(setupTouchGestures, 100);
          return;
        }

        const container = canvas._container;

        let initialDistance = 0;
        let initialZoom = 1;

        const handleTouchStart = (event: TouchEvent) => {
          if (event.touches.length === 2) {
            const touch1 = event.touches[0];
            const touch2 = event.touches[1];

            initialDistance = Math.hypot(
              touch2.clientX - touch1.clientX,
              touch2.clientY - touch1.clientY,
            );

            initialZoom = canvas.zoom();
          }
        };

        const handleTouchMove = (event: TouchEvent) => {
          if (event.touches.length === 2) {
            const touch1 = event.touches[0];
            const touch2 = event.touches[1];

            const currentDistance = Math.hypot(
              touch2.clientX - touch1.clientX,
              touch2.clientY - touch1.clientY,
            );

            const distanceRatio = currentDistance / initialDistance;
            const newZoom = Math.min(Math.max(initialZoom * distanceRatio, MIN_ZOOM), MAX_ZOOM);

            canvas.zoom(newZoom);

            event.preventDefault();
          }
        };

        container.addEventListener('touchstart', handleTouchStart);
        container.addEventListener('touchmove', handleTouchMove);

        return () => {
          container.removeEventListener('touchstart', handleTouchStart);
          container.removeEventListener('touchmove', handleTouchMove);
        };
      } catch (error) {
        console.error('Error setting up touch gestures:', error);
        // Continue rendering the component even if touch gestures fail
      }
    };

    // Start the setup process
    setupTouchGestures();
  }, [modeler]);

  return (
    <div className="flex flex-col gap-1">
      <IGRPButton
        onClick={handleZoomIn}
        title="Aumentar Zoom (Ctrl++)"
        size={'icon'}
        showIcon
        iconName="ZoomIn"
        variant="outline"
      ></IGRPButton>
      <IGRPSeparator />
      <IGRPButton
        onClick={handleZoomOut}
        title="Diminuir Zoom (Ctrl+-)"
        size={'icon'}
        showIcon
        iconName="ZoomOut"
        variant="outline"
      ></IGRPButton>
      <IGRPSeparator />
      <IGRPButton
        onClick={handleResetZoom}
        title="Ajustar à Tela (Ctrl+0)"
        size={'icon'}
        showIcon
        iconName="Maximize"
        variant="outline"
      ></IGRPButton>
    </div>
  );
};

export default ZoomControls;
