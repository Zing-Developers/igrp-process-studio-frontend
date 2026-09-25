import { carouselItems, loginConfig } from '@/config/login';
import { siteConfig } from '@/config/site';
import { LoginForm } from './login-form';

const { texts } = loginConfig;
const { logo, name } = siteConfig;

export default async function AuthPage({
  searchParams,
}: {
  searchParams: PageProps<'/login'>['searchParams'];
}) {
  //const { callbackUrl } = await searchParams;

  //const raw = (await searchParams)?.callbackUrl as string | undefined;
  //const callbackUrl = raw && raw.startsWith('/') ? raw : '/';

  const raw = (await searchParams)?.callbackUrl as string | undefined;
  const base = (process.env.NEXTAUTH_URL ?? '').replace(/\/$/, '');
  let callbackUrl = '/';
  if (raw) {
    try {
      const u = new URL(raw);
      callbackUrl = base
        ? `${base}${u.pathname}${u.search}${u.hash}`
        : `${u.pathname}${u.search}${u.hash}`;
    } catch {
      if (raw.startsWith('/')) callbackUrl = raw;
    }
  }

  return (
    <LoginForm
      backgroundImage={carouselItems[0]}
      callbackUrl={callbackUrl}
      logo={logo}
      name={name}
      texts={texts}
    />
  );
}
