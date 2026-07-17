"use client"
import { IGRPTemplateThemeSelector } from '@igrp/framework-next-ui';
import { IGRPButton, useIGRPToast } from '@igrp/igrp-framework-react-design-system';

export default function SettingsPage() {

  const { igrpToast } = useIGRPToast();

  const handlerButton = () => {
    console.log("Clicked...");
    igrpToast({
      type: 'info',
      title: 'Informação',
      description: <span className='text-foreground'>Esta é uma mensagem informativa.</span>,
      action: {
        label: 'Desfazer',
        onClick: () => console.log('Desfazer'),
      },
    })
  }


  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Configurações do sistema</h1>
      <IGRPTemplateThemeSelector />
      <IGRPButton onClick={() => handlerButton()}>
        Informação
      </IGRPButton>
    </div >
  );
}
