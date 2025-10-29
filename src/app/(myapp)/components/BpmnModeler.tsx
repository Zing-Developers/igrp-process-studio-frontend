import { IGRPBpmnModeler } from '@igrp/framework-process-studio-bpmn-editor';
import { convertActivitiToCamunda } from '../functions/utils';

const BpmnModeler = ({
  xml,
  onChange,
  onLoad,
  processKey,
  processName,
  isActivitiXml = false,
}: {
  xml?: string;
  onChange?: (xml: string) => void;
  onLoad?: (modeler: unknown) => void;
  processKey: string;
  processName: string;
  isActivitiXml?: boolean;
}) => {
  console.log('xml', xml);
  return (
    <IGRPBpmnModeler
      xml={isActivitiXml ? convertActivitiToCamunda(xml || '') : xml || ''}
      processKey={processKey}
      processName={processName}
      onChange={onChange}
      onLoad={onLoad}
    />
  );
};

export { BpmnModeler };
