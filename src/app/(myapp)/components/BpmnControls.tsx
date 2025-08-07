import { IGRPButton, IGRPSeparator } from '@igrp/igrp-framework-react-design-system';
import React, { useCallback, useRef, useState } from 'react';
import BpmnJS from 'bpmn-js/lib/Modeler';
import { 
  downloadFile, 
  validateBpmnFile, 
  generateFilename, 
  showError, 
  showSuccess 
} from './utils/bpmnUtils';

interface BpmnControlsProps {
  modeler: BpmnJS;
  processKey: string;
  processName: string;
}

const BpmnControls: React.FC<BpmnControlsProps> = ({ modeler, processKey, processName }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Download diagram as XML
  const handleDownloadDiagram = useCallback(async () => {
    if (!modeler) return;

    setIsLoading(true);
    try {
      const { xml } = await modeler.saveXML({ format: true });
      
      if (xml) {
        const filename = generateFilename(processKey, processName, 'bpmn');
        downloadFile(xml, filename, 'application/xml');
        showSuccess('Diagram downloaded successfully!');
      }
    } catch (error) {
      showError('Error downloading diagram. Please try again.', error as Error);
    } finally {
      setIsLoading(false);
    }
  }, [modeler, processKey, processName]);

  // Download diagram as image (PNG)
  const handleDownloadImage = useCallback(async () => {
    if (!modeler) return;

    setIsLoading(true);
    try {
      const canvas = modeler.get('canvas');
      const container = canvas.get('container');
      
      // Get the SVG element from the canvas
      const svgElement = container.querySelector('svg');
      if (!svgElement) {
        console.error('SVG element not found');
        return;
      }

      // Get the current viewbox to capture the full diagram
      const viewbox = canvas.viewbox();
      const { x, y, width, height } = viewbox;
      
      // Create a temporary SVG with the current view
      const tempSvg = svgElement.cloneNode(true) as SVGElement;
      tempSvg.setAttribute('width', width.toString());
      tempSvg.setAttribute('height', height.toString());
      tempSvg.setAttribute('viewBox', `${x} ${y} ${width} ${height}`);
      
      // Convert SVG to data URL
      const svgData = new XMLSerializer().serializeToString(tempSvg);
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const svgUrl = URL.createObjectURL(svgBlob);
      
      // Create canvas for conversion
      const tempCanvas = document.createElement('canvas');
      const ctx = tempCanvas.getContext('2d');
      
      // Set canvas size with higher resolution
      const scale = 2;
      tempCanvas.width = width * scale;
      tempCanvas.height = height * scale;
      
      if (ctx) {
        ctx.scale(scale, scale);
        
        // Create image from SVG
        const img = new window.Image();
        img.onload = () => {
          ctx.drawImage(img, 0, 0, width, height);
          
          // Download the PNG
          tempCanvas.toBlob((blob) => {
            if (blob) {
              const filename = generateFilename(processKey, processName, 'png');
              downloadFile(blob, filename, 'image/png');
              showSuccess('Image downloaded successfully!');
            }
          }, 'image/png', 0.95);
        };
        img.src = svgUrl;
      }
      
      // Clean up
      setTimeout(() => URL.revokeObjectURL(svgUrl), 1000);
    } catch (error) {
      showError('Error downloading image. Please try again.', error as Error);
    } finally {
      setIsLoading(false);
    }
  }, [modeler, processKey, processName]);

  // Upload diagram from file
  const handleUploadDiagram = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !modeler) return;

    setIsLoading(true);
    try {
      // Validate the file
      const isValid = await validateBpmnFile(file);
      if (!isValid) {
        showError('Invalid BPMN file. Please select a valid BPMN XML file.');
        return;
      }

      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const xml = e.target?.result as string;
          const result = await modeler.importXML(xml);
          
          const { warnings } = result;
          if (warnings && warnings.length) {
            console.warn('Warnings during BPMN import:', warnings);
          }
          
          // Fit to viewport after import
          const canvas = modeler.get('canvas');
          canvas.zoom('fit-viewport');
          
          showSuccess('Diagram uploaded successfully!');
          
          // Clear the file input
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        } catch (error) {
          showError('Error importing diagram. Please check if the file is a valid BPMN XML file.', error as Error);
        } finally {
          setIsLoading(false);
        }
      };
      reader.readAsText(file);
    } catch (error) {
      showError('Error reading file. Please try again.', error as Error);
      setIsLoading(false);
    }
  }, [modeler]);

  // Trigger file input click
  const handleUploadClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  // Download diagram as SVG
  const handleDownloadSvg = useCallback(async () => {
    if (!modeler) return;

    setIsLoading(true);
    try {
      const canvas = modeler.get('canvas');
      const container = canvas.get('container');
      
      // Get the SVG element from the canvas
      const svgElement = container.querySelector('svg');
      if (!svgElement) {
        console.error('SVG element not found');
        return;
      }

      // Get the current viewbox to capture the full diagram
      const viewbox = canvas.viewbox();
      const { x, y, width, height } = viewbox;
      
      // Create a temporary SVG with the current view
      const tempSvg = svgElement.cloneNode(true) as SVGElement;
      tempSvg.setAttribute('width', width.toString());
      tempSvg.setAttribute('height', height.toString());
      tempSvg.setAttribute('viewBox', `${x} ${y} ${width} ${height}`);
      
      // Convert SVG to string and download
      const svgData = new XMLSerializer().serializeToString(tempSvg);
      const filename = generateFilename(processKey, processName, 'svg');
      downloadFile(svgData, filename, 'image/svg+xml');
      showSuccess('SVG downloaded successfully!');
    } catch (error) {
      showError('Error downloading SVG. Please try again.', error as Error);
    } finally {
      setIsLoading(false);
    }
  }, [modeler, processKey, processName]);

  return (
    <div className="flex flex-col gap-1">
      {/* Download Diagram as XML */}
      <IGRPButton
        onClick={handleDownloadDiagram}
        title="Download Diagram (XML)"
        size={'icon'}
        showIcon
        iconName="FileText"
        variant="outline"
        disabled={isLoading}
      />
      
      <IGRPSeparator />
      
      {/* Download Diagram as SVG */}
      <IGRPButton
        onClick={handleDownloadSvg}
        title="Download as SVG"
        size={'icon'}
        showIcon
        iconName="Download"
        variant="outline"
        disabled={isLoading}
      />
      
      <IGRPSeparator />
      
      {/* Download Diagram as Image */}
      <IGRPButton
        onClick={handleDownloadImage}
        title="Download as Image (PNG)"
        size={'icon'}
        showIcon
        iconName="Image"
        variant="outline"
        disabled={isLoading}
      />
      
      <IGRPSeparator />
      
      {/* Upload Diagram */}
      <IGRPButton
        onClick={handleUploadClick}
        title="Upload Diagram"
        size={'icon'}
        showIcon
        iconName="Upload"
        variant="outline"
        disabled={isLoading}
      />
      
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".bpmn,.xml"
        onChange={handleUploadDiagram}
        style={{ display: 'none' }}
      />
    </div>
  );
};

export default BpmnControls; 