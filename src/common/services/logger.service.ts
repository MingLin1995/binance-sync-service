import { Injectable, Logger, Scope } from '@nestjs/common';

@Injectable({ scope: Scope.TRANSIENT })
export class CustomLogger extends Logger {
  error(message: string, trace?: string, context?: string) {
    super.error(`[Error] ${message}`, trace, context || this.context);
  }

  warn(message: string, context?: string) {
    super.warn(`[Warning] ${message}`, context || this.context);
  }

  log(message: string, context?: string) {
    super.log(`[Info] ${message}`, context || this.context);
  }

  debug(message: string, context?: string) {
    super.debug(`[Debug] ${message}`, context || this.context);
  }

  verbose(message: string, context?: string) {
    super.verbose(`[Verbose] ${message}`, context || this.context);
  }
}
