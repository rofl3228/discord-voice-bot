/* eslint-disable max-classes-per-file */
const { parse } = require('stack-trace');

class ExtendableError extends Error {
  constructor(message, cause = null, meta = null, description = null) {
    super(message);
    Error.captureStackTrace(this, this.constructor);
    const trace = parse(this);

    this.name = this.constructor.name;
    this.meta = meta;
    this.cause = cause;
    this.description = description;
    this.className = trace[0].typeName;
    this.methodName = trace[0].methodName;
  }
}

class NotImplementedError extends ExtendableError {
  constructor() {
    super('NOT_IMPLEMENTED');
  }
}

class FileNotExistError extends ExtendableError {
  constructor(file) {
    super('FILE_NOT_EXISTS', null, { file });
  }
}

module.exports = {
  NotImplementedError,
  FileNotExistError,
};
