import { useCallback, useEffect, useState } from 'react';
import diagramXML from '@/app/(myapp)/resources/newDiagram';

import { IGRPBpmnModeler } from '@igrp/framework-process-studio-bpmn-editor';

const BpmnModeler = ({
  xml,
  onChange,
  onLoad,
  processKey,
  processName,
}: {
  xml?: string;
  onChange?: (xml: string) => void;
  onLoad?: (modeler: unknown) => void;
  processKey: string;
  processName: string;
}) => {
  const [currentXml, setCurrentXml] = useState<string>('');
  const [isInitialized, setIsInitialized] = useState<boolean>(false);

  useEffect(() => {
    // Only set the XML on initial load, not on subsequent updates
    if (!isInitialized) {
      const updateXml = xml ?? diagramXML(processKey, processName);
      setCurrentXml(updateXml || '');
      setIsInitialized(true);
    }

  }, [xml, isInitialized, processKey, processName]);

  const handleChange = useCallback((newXml: string) => {
    setCurrentXml(newXml);
    onChange?.(newXml);
  }, []);

  return (
    <IGRPBpmnModeler
      xml={currentXml}
      processKey={processKey}
      processName={processName}
      onChange={handleChange}
      onLoad={onLoad}
    />
  );
};

export { BpmnModeler };
