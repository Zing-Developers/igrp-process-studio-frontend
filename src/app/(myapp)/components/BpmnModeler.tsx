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
  return (
    <IGRPBpmnModeler
      xml={xml}
      processKey={processKey}
      processName={processName}
      onChange={onChange}
      onLoad={onLoad}
    />
  );
};

export { BpmnModeler };
