'use client'

/* THIS FILE WAS GENERATED AUTOMATICALLY BY iGRP STUDIO. */
/* DO NOT MODIFY IT BECAUSE IT COULD BE REWRITTEN AT ANY TIME. */

/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { use, useState, useEffect, useRef } from 'react';
import { cn, useIGRPMenuNavigation, useIGRPToast } from '@igrp/igrp-framework-react-design-system';
import { IGRPFormHandle } from "@igrp/igrp-framework-react-design-system";
import { z } from "zod"
import { IGRPOptionsProps } from "@igrp/igrp-framework-react-design-system";
import { 
  IGRPModalDialog,
	IGRPModalDialogContent,
	IGRPModalDialogHeader,
	IGRPModalDialogTitle,
	IGRPModalDialogDescription,
	IGRPForm,
	IGRPFormList,
	IGRPInputText,
	IGRPCombobox,
	IGRPCheckbox,
	IGRPInputHidden,
	IGRPModalDialogFooter,
	IGRPModalDialogClose,
	IGRPButton 
} from "@igrp/igrp-framework-react-design-system";
import {createOrUpdateVariable} from '@/app/(myapp)/functions/process-definition'
import {getDataTypes} from '@/app/(myapp)/functions/process-definition'
import {useGetVariables} from '@/app/(myapp)/hooks/process'

export default function Variables({ open, setOpen, currentProcess } : { open: boolean, setOpen: (prompt: boolean) => void, currentProcess: any }) {

  
  const form1 = z.object({
    variables: z.array(z.object({ name: z.string().nonempty(), type: z.string().nonempty(), defaultValue: z.string().optional(), required: z.boolean().optional(), id: z.string().optional() })).optional()
})

type Form1ZodType = typeof form1;

const initForm1: z.infer<Form1ZodType> = {
    variables: [{ name: ``, type: ``, defaultValue: undefined, required: undefined, id: undefined }]
}


  const formform1Ref = useRef<IGRPFormHandle<Form1ZodType> | null>(null);
  const [form1Data, setForm1Data] = useState<any>(initForm1);
  const [formListvariablesDefault, setFormListvariablesDefault] = useState<any>({});
  const [selecttypeOptions, setSelecttypeOptions] = useState<IGRPOptionsProps[]>([]);
  
const { igrpToast } = useIGRPToast()

async function handleSubmit (values: z.infer<any>): Promise<void  | undefined> {

  
try {
  const response = await createOrUpdateVariable(currentProcess?.processDefinitionId, values.variables);
  setForm1Data({ variables: response })
  igrpToast({
    title: 'Success',
    description: 'Add varaibles definition with successfully',
    type: 'success',
  });
} catch (error: any) {
  igrpToast({
    title: 'Error',
    description: `An error occurred while processing the data. [${error.message}]`,
    type: 'error',
  });
}

}

const { data, isLoading } = useGetVariables(currentProcess?.processDefinitionId);
useEffect(() => {
  getDataTypes().then((dataTypes) => {
    setSelecttypeOptions(dataTypes || [])

  });

  if (data) {
    console.log(data)
    setForm1Data({ variables: data })

  }

}, [isLoading])


  return (
<div className={ cn('component',)}    >
	<div className={ cn('section',' space-x-6 space-y-6',)}    >
	<IGRPModalDialog
  onOpenChange={ setOpen }
  open={ open }
>
  <IGRPModalDialogContent
  size={ `lg` }
  className={ cn() }
  
  
>
  <IGRPModalDialogHeader
  className={ cn('',) }
  
  
>
  <IGRPModalDialogTitle
  
  
  
>
  Process Varaibles
</IGRPModalDialogTitle>
  <IGRPModalDialogDescription
  
  
  
>
  Enter a name, type, and value. The process will use them to make decisions.
</IGRPModalDialogDescription>
</IGRPModalDialogHeader>
  <IGRPForm
  schema={ form1 }
  validationMode={ `onBlur` }
formRef={ formform1Ref }
  className={ cn('',) }
  onSubmit={ handleSubmit }
  defaultValues={ form1Data }
>
  <>
  <IGRPFormList
  id={ `formlist_ddfcxt` }
  name={ `variables` }
  label={ `Variable` }
  color={ `primary` }
  variant={ `solid` }
  addButtonLabel={ `Add` }
  addButtonIconName={ `Plus` }
renderItem={ (_: any, index: number) => (
      <>
        <div className={ cn('grid','grid-cols-1 ',' gap-4',)}    >
	<IGRPInputText
  name={ `variables.${index}.name` }
  label={ `Name` }
showIcon={ false }
required={ true }
  className={ cn('col-span-1',) }
  
  
>
</IGRPInputText>
<IGRPCombobox
  name={ `variables.${index}.type` }
  label={ `Data Type` }
variant={ `single` }
placeholder={ `Select an option...` }
required={ true }
selectLabel={ `No option found` }
showSearch={ true }
showIcon={ false }
iconName={ `CornerDownRight` }
  className={ cn('col-span-1',) }
  onChange={ () => {} }
  options={ selecttypeOptions }
>
</IGRPCombobox>
<IGRPInputText
  name={ `variables.${index}.defaultValue` }
  label={ `Default Value` }
showIcon={ false }
required={ false }
  className={ cn('col-span-1',) }
  
  
>
</IGRPInputText>
<IGRPCheckbox
  name={ `variables.${index}.required` }
  label={ `Required` }
  className={ cn('col-span-1',) }
  
  
>
</IGRPCheckbox>
<IGRPInputHidden
  name={ `variables.${index}.id` }
  label={ `Hidden` }
required={ false }
  className={ cn('col-span-1',) }
  
  
>
</IGRPInputHidden></div>
</>
    )
  }
  computeLabel={
    (item: any, index: number) => `Item ${index}`
  }
  className={ cn('space-y-3 ','flex flex-col flex-wrap items-stretch justify-start gap-2',) }
  
  defaultItem={ formListvariablesDefault }
>
</IGRPFormList>

</>
</IGRPForm>
  <IGRPModalDialogFooter
  className={ cn('',) }
  
  
>
  <IGRPModalDialogClose
  name={ `modalDialogClose1` }
  
  onClick={ () => {} }
  
>
  Close
</IGRPModalDialogClose>
  <IGRPButton
  name={ `button1` }
  variant={ `default` }
size={ `default` }
showIcon={ true }
iconName={ `Save` }
  onClick={ () => formform1Ref.current?.submit() }
  
>
  Save
</IGRPButton>
</IGRPModalDialogFooter>
</IGRPModalDialogContent>
</IGRPModalDialog></div></div>
  );
}