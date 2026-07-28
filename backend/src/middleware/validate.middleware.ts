
import { Request, Response, NextFunction } from 'express'
import { ZodSchema, ZodError } from 'zod'

export function validate(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const parsed = schema.parse(req.body)

      // Replace req.body with the validated, sanitized version
      req.body = parsed

      next()
    } catch (err) {
      if (err instanceof ZodError) {
        // Return structured field-level errors
        // Never expose internal schema structure
        const errors = err.errors.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
        }))

        res.status(400).json({
          error: 'Validation failed',
          errors,
        })
        return
      }

      res.status(400).json({ error: 'Invalid request body' })
    }
  }
}