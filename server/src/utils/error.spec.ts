import { BadRequestException } from '@nestjs/common';
import { handleError } from './error';

describe('handleError', () => {
  it('should throw a BadRequestException with the error detail when error object has a detail property', () => {
    const error = { detail: 'This is the error detail' };

    // Call the handleError function and expect it to throw a BadRequestException
    expect(() => handleError(error)).toThrowError(BadRequestException);
    expect(() => handleError(error)).toThrowError('This is the error detail');
  });

  it('should throw a BadRequestException with the error string representation when error object does not have a detail property', () => {
    const error = new Error('An error occurred');

    // Call the handleError function and expect it to throw a BadRequestException
    expect(() => handleError(error)).toThrowError(BadRequestException);
    expect(() => handleError(error)).toThrowError('Error: An error occurred');
  });
});
