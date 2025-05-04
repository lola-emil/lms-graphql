type ValidationError = {
    property: string;
    reason: string;
  };
  
  type PropertyValidator = Record<string, ((property: string, value: any) => ValidationError | undefined) | ((property: string, value: any) => (ValidationError | undefined)[])>;
  
  type SchemaValidator = ((body: any) => ValidationError | undefined)[];
  
  const isValidationError = (value: any): value is ValidationError =>
    typeof value?.property !== 'undefined' && typeof value?.reason !== 'undefined';
  
  /* CURRIED VALIDATORS */
  export const inNumberArray = (allowedNumbers: number[]) => (property: string, value: any): ValidationError | undefined => {
    if (typeof value === 'undefined') return;
  
    if (typeof value !== 'number' || isNaN(value)) {
      return {
        property,
        reason: `Value ${value} not allowed, must be of type number`
      };
    }
  
    if (!allowedNumbers.includes(value)) {
      return {
        property,
        reason: `Value is not valid. Got ${value}, expected ${allowedNumbers}`
      };
    }
  };
  
  export const isBetween = (min: number, max: number) => (property: string, value: any): ValidationError | undefined => {
    if (typeof value === 'undefined') return;
  
    if (typeof value !== 'number' || isNaN(value)) {
      return {
        property,
        reason: `Value ${value} not allowed, must be of type number`
      };
    }
  
    if (value < min || value > max) {
      return {
        property,
        reason: `Value must in between ${min} and ${max}`
      };
    }
  };
  
  export const isRequiredAllOrNone = (requiredKeys: string[]) => (body: any): ValidationError | undefined => {
    const presentKeys = Object.keys(body).filter((x) => typeof body[x] !== 'undefined');
    const isValid =
      requiredKeys.every((x) => presentKeys.includes(x)) || requiredKeys.every((x) => !presentKeys.includes(x));
  
    if (!isValid) {
      return {
        property: '$schema',
        reason: `If one of the following properties is present, all or none must be present: ${requiredKeys.join(', ')}`
      };
    }
  };
  
  /* VALIDATION RUNNER */
  export const validateRequest = (
    body: any,
    propertyValidator: PropertyValidator,
    schemaValidator: SchemaValidator
  ): ValidationError[] => {
    const schemaValidations = schemaValidator.map((validator) => validator?.(body));
    const propValidations = Object.keys(propertyValidator).flatMap((property) => {
      const value = body?.[property];
      const func = propertyValidator[property];
      const validations = Array.isArray(func)
        ? func.map((f) => f(property, value))
        : func?.(property, value);
      return Array.isArray(validations) ? validations : [validations];
    });
    return [...schemaValidations, ...propValidations].filter(isValidationError);
  };
  