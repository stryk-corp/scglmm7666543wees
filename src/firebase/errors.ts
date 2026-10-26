'use client';

// Defines a detailed, serializable error object for Firestore permission errors.
// This is crucial for the AI to debug security rule violations effectively.

export type SecurityRuleContext = {
  path: string;
  operation: 'get' | 'list' | 'create' | 'update' | 'delete';
  // It's important to know what data the client *attempted* to write.
  requestResourceData?: any;
};

// Custom error class to capture the full context of a permission error.
export class FirestorePermissionError extends Error {
  public context: SecurityRuleContext;

  constructor(context: SecurityRuleContext) {
    const message = `Firestore Permission Error: Access denied for ${context.operation} on ${context.path}.`;
    super(message);
    this.name = 'FirestorePermissionError';
    this.context = context;

    // This is for environments that support it (like Node.js), useful for server-side actions.
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  // Converts the error and its context into a plain object for serialization.
  toJSON() {
    return {
      name: this.name,
      message: this.message,
      context: this.context,
      stack: this.stack,
    };
  }
}
