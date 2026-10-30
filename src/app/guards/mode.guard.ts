import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { UiModeService } from '../services/ui-mode.service';

export const rootModeGuard: CanActivateFn = (): UrlTree => {
  const uiModeService = inject(UiModeService);
  const router = inject(Router);

  if (uiModeService.isSimpleMode()) {
    return router.createUrlTree(['/simple']);
  } else {
    return router.createUrlTree(['/dashboard']);
  }
};

