import { logger } from '../logger';

describe('logger', () => {
  let consoleSpy: {
    log: jest.SpyInstance;
    error: jest.SpyInstance;
    warn: jest.SpyInstance;
    debug: jest.SpyInstance;
  };

  beforeEach(() => {
    consoleSpy = {
      log: jest.spyOn(console, 'log').mockImplementation(),
      error: jest.spyOn(console, 'error').mockImplementation(),
      warn: jest.spyOn(console, 'warn').mockImplementation(),
      debug: jest.spyOn(console, 'debug').mockImplementation(),
    };
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should log info messages', () => {
    logger.info('test info', { key: 'value' });

    expect(consoleSpy.log).toHaveBeenCalledWith(
      expect.stringContaining('[INFO]'),
      expect.objectContaining({ key: 'value' })
    );
  });

  it('should log info without meta', () => {
    logger.info('test info');

    expect(consoleSpy.log).toHaveBeenCalledWith(
      expect.stringContaining('test info'),
      ''
    );
  });

  it('should log error messages', () => {
    logger.error('test error', { err: true });

    expect(consoleSpy.error).toHaveBeenCalledWith(
      expect.stringContaining('[ERROR]'),
      expect.objectContaining({ err: true })
    );
  });

  it('should log warn messages', () => {
    logger.warn('test warn');

    expect(consoleSpy.warn).toHaveBeenCalledWith(
      expect.stringContaining('[WARN]'),
      ''
    );
  });

  it('should log debug messages', () => {
    logger.debug('test debug', { d: 1 });

    expect(consoleSpy.debug).toHaveBeenCalledWith(
      expect.stringContaining('[DEBUG]'),
      expect.objectContaining({ d: 1 })
    );
  });
});
