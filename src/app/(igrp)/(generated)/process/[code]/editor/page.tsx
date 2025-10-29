'use client'

/* THIS FILE WAS GENERATED AUTOMATICALLY BY iGRP STUDIO. */
/* DO NOT MODIFY IT BECAUSE IT COULD BE REWRITTEN AT ANY TIME. */

/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { use, useState, useEffect, useRef } from 'react';
import { cn, useIGRPMenuNavigation, useIGRPToast } from '@igrp/igrp-framework-react-design-system';
import {Spinner} from '@/app/(myapp)/components/spinner'
import {IgrpLoading} from '@/app/(myapp)/components/igrp-loading'
import {BpmnModeler} from '@/app/(myapp)/components/BpmnModeler'
import {DelegatesHelper} from '@/app/(myapp)/components/delegates-helper'
import { 
  IGRPPageHeader,
	IGRPButton,
	IGRPTabs,
	IGRPTabItem,
	IGRPTextarea 
} from "@igrp/igrp-framework-react-design-system";
import {saveDiagramProcessDefinition} from '@/app/(myapp)/functions/process-definition'
import {deployProcessDefinition} from '@/app/(myapp)/functions/process-definition'
import {useCallback } from 'react';
import {useDetailProcessDefinition} from '@/app/(myapp)/hooks/process'
import { IGRPLoadingSpinner } from '@igrp/igrp-framework-react-design-system'
import {useSaveDiagramProcessDefinition} from '@/app/(myapp)/hooks/process'


export default function PageEditorComponent({ params } : { params: Promise<{ code: string }> } ) {

  const { code } = use(params);

  const [tabstabs1Items, setTabstabs1Items] = useState<IGRPTabItem[]>([]);
  
  
const [bpmnXml, setBpmnXml] = useState<any>(undefined);

const [pageHeader1Description, setPageHeader1Description] = useState<any>(undefined);

const [inputTextarea1Value, setInputTextarea1Value] = useState<string>('');

const [isAutoSave, setIsAutoSave] = useState<boolean>(false);

const { igrpToast } = useIGRPToast()

async function handleSave (dataToSave?: any, xmlToSave?: string, isAutoSave?: boolean): Promise<void  | undefined> {

  try {
  const xml = xmlToSave || bpmnXml;
  const processKey = dataToSave?.processKey || data?.processKey;
  
  if (!processKey || !xml) return;
  
  await saveDraft({ content: xml, processKey });

  if (!isAutoSave)
    igrpToast({
      title: 'Success',
      description: 'Process definition saved successfully',
      type: 'success',
    });
    
} catch (error: any) {
  igrpToast({
    title: 'Error',
    description: `An error occurred while processing the data. [${error.message}]`,
    type: 'error',
  });
  console.log(error);
} finally {
  setIsAutoSave(false)
}

}

async function handleDeploy (): Promise<void  | undefined> {

  try {
   if (!data) return
  await deployProcessDefinition(data.processKey,{content: bpmnXml});
  igrpToast({
    title: 'Success',
    description: 'Process definition published successfully',
    type: 'success',
  });
} catch (error: any) {
  igrpToast({
    title: 'Error',
    description: `An error occurred while processing the data. [${error.message}]`,
    type: 'error',
  });
  console.log(error);
}

}


const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
const { data, isLoading, error } = useDetailProcessDefinition(code);

const { mutateAsync: saveDraft } = useSaveDiagramProcessDefinition(code)

const autoSave = useCallback((data: any, xml: string) => {
  // Clear existing timeout
  if (autoSaveTimeoutRef.current) {
    clearTimeout(autoSaveTimeoutRef.current);
  }

  setIsAutoSave(true)

  // Set a new timeout for auto-save (debounce)
  autoSaveTimeoutRef.current = setTimeout(() => {
    handleSave(data, xml, true);
  }, 2000); // Wait 2 seconds after the user stops editing
}, []);

const handleBpmnChange = useCallback(
  (xml: string) => {
    setBpmnXml(xml);
    setInputTextarea1Value(xml);
    autoSave(data, xml);
  },
  [autoSave, data],
);

useEffect(() => {
  if (isLoading || !data) return;
  setPageHeader1Description(`${data.title} [${data.processKey}] - ${data.statusDesc}`);
  setBpmnXml(data.bpmFileContent);
  setInputTextarea1Value(data.bpmFileContent);
}, [isLoading]);

// Cleanup timeout on unmount
useEffect(() => {
  return () => {
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }
  };
}, []);


  return (
<div className={ cn('page','space-y-6',)}    >
	<div className={ cn('section',' space-x-6 space-y-6',)}    >
	<IGRPPageHeader
  name={ `pageHeader1` }
  title={ `Process Editor` }
  iconBackButton={ `ArrowLeft` }
  showBackButton={ true }
  urlBackButton={ `/process` }
  variant={ `h3` }
  description={ pageHeader1Description }
>
  <div className="flex items-center gap-2">
    <Spinner  isLoading={ isAutoSave }   ></Spinner>
    <IGRPButton
  name={ `button2` }
  variant={ `destructive` }
size={ `default` }
showIcon={ false }
  className={ cn('bg-green-600 hover:bg-green-600',) }
  onClick={ handleDeploy }
  
>
  Deploy
</IGRPButton>
    <IGRPButton
  name={ `button1` }
  variant={ `default` }
size={ `default` }
showIcon={ true }
iconName={ `Save` }
  className={ cn('',) }
  onClick={ () => handleSave('','',false) }
  
>
  Save
</IGRPButton>
</div>
</IGRPPageHeader>
</div>
<IgrpLoading  loading={ isLoading }   ></IgrpLoading>
{ !isLoading && data && (<IGRPTabs
  variant={ `default` }
  tabContentClassName={ `border rounded-lg border-transparent-none` }
  showIcon={ true }
  iconPlacement={ `start` }
  tabListClassName={ cn() }
  items={
    [
        {
          value: `tabsItem1-eM2k`,
          label: `Diagram Editor`,
          icon: `Workflow`,
content: (<>
            <BpmnModeler  processName={ data.title } processKey={ data.processKey } xml={ bpmnXml || data.bpmFileContent } isActivitiXml={ bpmnXml === '' }  onChange={ handleBpmnChange } ></BpmnModeler>
</>),
        },
        {
          value: `tabsItem2-sYqo`,
          label: `XML`,
          icon: `CodeXml`,
content: (<>
            <IGRPTextarea
  name={ `inputTextarea1` }
  label={ `XML` }
rows={ `20` }
required={ false }
  
  value={ inputTextarea1Value }
>
</IGRPTextarea>
            <div className={ cn('flex','flex flex-row flex-wrap-reverse items-end justify-end gap-2',' mt-3',)}    >
	<IGRPButton
  name={ `button3` }
  variant={ `outline` }
size={ `default` }
showIcon={ true }
iconName={ `Copy` }
  className={ cn() }
  onClick={ () => {} }
  
>
  Copy XML
</IGRPButton></div>
</>),
        },
        {
          value: `tabsItem3-D9am`,
          label: `Delegates & Variables`,
          icon: `BookOpen`,
content: (<>
            <DelegatesHelper    ></DelegatesHelper>
</>),
        },
]
  }
/>)}</div>
  );
}
