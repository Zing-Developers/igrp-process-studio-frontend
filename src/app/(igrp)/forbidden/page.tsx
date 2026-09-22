import { IRNErrorPage } from '@irn/irn-backoffice-design-system';

export default function ForbiddenPage() {
  return <IRNErrorPage errorCode={403}
  />;
}
