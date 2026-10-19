import { createIRNAuthHandler } from '@irn/irn-core-framework/server/auth';
import { authOptions } from '@/lib/auth-options';

const handler = createIRNAuthHandler({
  ...authOptions,
  debug: process.env.NODE_ENV === 'development',
});

export { handler as GET, handler as POST };
