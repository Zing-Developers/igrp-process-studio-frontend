'use client';

import { IRNAuthForm } from '@irn/irn-backoffice-design-system';
import { signInIRN } from '@irn/irn-core-framework/client';

type LoginTexts = {
  welcome: string;
  description: string;
  copyright: string;
  igrpLabel: string;
  igrpUrl: string;
  nosiLabel: string;
  nosiUrl: string;
};

type LoginFormProps = {
  texts: LoginTexts;
  logo: { src: string; width: number; height: number };
  name: string;
  callbackUrl: string;
  backgroundImage: { image: string; title: string };
};

export function LoginForm({ texts, logo, name, callbackUrl, backgroundImage }: LoginFormProps) {
  return (
    <IRNAuthForm
      backgroundImage={{ src: backgroundImage.image.trim(), alt: backgroundImage.title }}
      btnText="Autenticar"
      description={texts.description}
      logo={{ src: logo.src, alt: name }}
      onAuthenticate={async () => {
        await signInIRN('keycloak', { callbackUrl });
      }}
      title={texts.welcome}
    />
  );
}
