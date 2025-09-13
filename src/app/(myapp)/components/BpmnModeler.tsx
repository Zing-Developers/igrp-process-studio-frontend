import { useEffect, useState } from 'react';
import diagramXML from '@/app/(myapp)/resources/newDiagram';

import { IGRPBpmnModeler } from '@igrp/framework-process-studio-bpmn-editor';

interface BpmnModelerProps {
  xml?: string;
  onChange?: (xml: string) => void;
  onLoad?: (modeler: unknown) => void;
  processKey: string;
  processName: string;
}

const BpmnModeler = ({ xml, onChange, onLoad, processKey, processName }: BpmnModelerProps) => {
  const [currentXml, setCurrentXml] = useState<string>('');

  useEffect(() => {
    const updateXml = xml ?? diagramXML(processKey, processName);
    setCurrentXml(updateXml || '');
  }, [xml]);

  return (
    <IGRPBpmnModeler
      xml={currentXml}
      processKey={processKey}
      processName={processName}
      onChange={onChange}
      onLoad={onLoad}
    />
  );
};

export { BpmnModeler };
