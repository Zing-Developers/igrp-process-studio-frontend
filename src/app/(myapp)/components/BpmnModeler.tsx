import BpmnJS from 'bpmn-js/lib/Modeler';
import { useEffect, useRef, useState } from 'react';
import 'bpmn-js/dist/assets/bpmn-js.css';
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn.css';
import 'bpmn-js/dist/assets/diagram-js.css';
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn-embedded.css';
import '@bpmn-io/properties-panel/assets/properties-panel.css';
import diagramXML from '@/app/(myapp)/resources/newDiagram';

import { IGRPBpmnModeler } from '@igrp/framework-process-studio-bpmn-editor';

interface BpmnModelerProps {
  xml?: string;
  onChange?: (xml: string) => void;
  onLoad?: (modeler: BpmnJS) => void;
  processKey: string;
  processName: string;
}

const BpmnModeler = ({ xml, onChange, onLoad, processKey, processName }: BpmnModelerProps) => {
  const [currentXml, setCurrentXml] = useState<string>(xml || '');
  const isFirstRender = useRef(true);

  useEffect(() => {
    const xml = diagramXML(processKey, processName);
    setCurrentXml(xml || '');
  }, []);

  useEffect(() => {
    if (isFirstRender.current && xml) {
      setCurrentXml(xml);
      isFirstRender.current = false;
    }
  }, [xml]);

  return (
    <IGRPBpmnModeler
      xml={currentXml}
      processKey="test-process"
      processName="Test Process"
      onChange={onChange}
      onLoad={onLoad}
      className="h-[78vh]"
    />
  );
};

export { BpmnModeler };
