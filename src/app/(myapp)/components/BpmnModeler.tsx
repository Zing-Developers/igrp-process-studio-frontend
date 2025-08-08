import { cn } from '@/lib/utils';
import BpmnJS from 'bpmn-js/lib/Modeler';
import { useRef, useEffect, useCallback } from 'react';
import 'bpmn-js/dist/assets/bpmn-js.css';
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn.css';
import 'bpmn-js/dist/assets/diagram-js.css';
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn-embedded.css';
import '@bpmn-io/properties-panel/assets/properties-panel.css';

import diagramXML from '@/app/(myapp)/resources/newDiagram';

import {
  BpmnPropertiesPanelModule,
  BpmnPropertiesProviderModule,
  CamundaPlatformPropertiesProviderModule,
} from 'bpmn-js-properties-panel';
import ZoomControls from './ZoomControls';

import CamundaBpmnModdle from 'camunda-bpmn-moddle/resources/camunda.json';
import BpmnControls from './BpmnControls';

interface BpmnModelerProps {
  xml?: string;
  onChange?: (xml: string) => void;
  onLoad?: (modeler: BpmnJS) => void;
  processKey: string;
  processName: string;
}

const BpmnModeler = ({ xml, onChange, onLoad, processKey, processName }: BpmnModelerProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const modelerRef = useRef<BpmnJS | null>(null);

  const createNewDiagram = useCallback(async (modeler: BpmnJS) => {
    try {
      // Ensure canvas is initialized
      const xml = diagramXML(processKey, processName);
      const canvas = modeler.get('canvas');
      
      if (!canvas) {
        console.warn('Canvas not available, retrying...');
        setTimeout(() => createNewDiagram(modeler), 100);
        return;
      }

      // Use Promise API for importXML
      const result = await modeler.importXML(xml);
      const { warnings } = result;
      if (warnings && warnings.length) {
        console.warn('Warnings during default diagram import:', warnings);
      }

      // Adjust zoom after import
      canvas.zoom('fit-viewport');

      // Notify change
      onChange?.(xml);
    } catch (err) {
      console.error('Error creating new diagram:', err);
    }
  }, [processKey, processName, onChange]);

  useEffect(() => {
    if (!containerRef.current) return;

    const modeler = new BpmnJS({
      container: containerRef.current,
      propertiesPanel: {
        parent: '#js-properties-panel',
      },
      additionalModules: [
        BpmnPropertiesPanelModule,
        BpmnPropertiesProviderModule,
        CamundaPlatformPropertiesProviderModule,
      ],
      moddleExtensions: {
        camunda: CamundaBpmnModdle,
      },
    });

    modelerRef.current = modeler;
    onLoad?.(modeler);

    // Initialize canvas and create necessary layers
    const canvas = modeler.get('canvas');

    // Ensure diagram is rendered before any operation
    const initializeDiagram = () => {
      try {
        // Initialize with an empty diagram to ensure layers are created
        if (xml) {
          // Use Promise API for importXML
          modeler
            .importXML(xml)
            .then((result) => {
              const { warnings } = result;
              if (warnings && warnings.length) {
                console.warn('Warnings during BPMN import:', warnings);
              }
              // Adjust zoom after import
              canvas.zoom('fit-viewport');
            })
            .catch((err) => {
              console.error('Error importing BPMN XML:', err);
              // In case of error, create a default diagram
              createNewDiagram(modeler);
            });
        } else {
          createNewDiagram(modeler);
        }

        // Setup change events
        modeler.on('commandStack.changed', async () => {
          try {
            const { xml } = await modeler.saveXML({ format: true });
            // Ensure onChange is called only when xml is successfully retrieved
            if (xml) {
              onChange?.(xml);
            }
          } catch (err) {
            console.error('Failed to save BPMN XML:', err);
          }
        });
      } catch (error) {
        console.error('Error during diagram initialization:', error);
        // Retry initialization after a delay
        setTimeout(initializeDiagram, 200);
      }
    };

    // Small delay to ensure DOM is ready
    setTimeout(initializeDiagram, 100);

    return () => {
      try {
        modeler.destroy();
      } catch (error) {
        console.error('Error destroying modeler:', error);
      }
    };
  }, [onLoad, onChange, xml, createNewDiagram]); // Added createNewDiagram to dependencies

  return (
    <div className={cn('flex h-[78vh] relative', 'border rounded-lg', 'bg-white')}>
      <div
        ref={containerRef}
        className={cn(
          'flex-1 w-full h-full transition-all duration-300 ease-in-out',
          'bg-[radial-gradient(circle_at_0.5px_0.5px,rgba(0,0,0,0.2)_0.5px,transparent_0)]',
          'bg-[length:10px_10px]',
          'relative',
        )}
      >
        {/* BPMN Controls */}
        {modelerRef.current && (
          <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-lg shadow-lg p-2 z-10">
            <BpmnControls modeler={modelerRef.current} processKey={processKey} processName={processName} />
          </div>
        )}
        
        {/* Zoom Controls */}
        {modelerRef.current && (
          <div className="absolute bottom-10 right-4 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-lg shadow-lg p-2 z-10">
            <ZoomControls modeler={modelerRef.current} />
          </div>
        )}
      </div>
      <div id="js-properties-panel" className="w-80 h-full  border-l overflow-y-auto" />
    </div>
  );
};

export { BpmnModeler };
