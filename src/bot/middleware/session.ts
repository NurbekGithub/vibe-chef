import type { Middleware } from 'grammy';
import type { UserSession } from '../../types';
import type { StorageService } from '../../types';

export function sessionMiddleware(storage: StorageService): Middleware {
  return async (ctx, next) => {
    const userId = ctx.from?.id;
    
    if (!userId) {
      return next();
    }
    
    // Get or create session
    let session = storage.getSession(userId);
    
    if (!session) {
      session = {
        userId,
        state: 'idle',
      };
      storage.setSession(userId, session);
    }
    
    // Attach session to context
    (ctx as any).session = session;
    
    await next();
    
    // Save session after processing
    storage.setSession(userId, session);
  };
}
