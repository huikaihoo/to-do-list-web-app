import { BadRequestException } from '@nestjs/common';

const handleError = (error: any) => {
  const message = error.detail ?? error.toString();
  throw new BadRequestException(message);
};

export { handleError };
