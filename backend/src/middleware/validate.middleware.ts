
import { Request, Response, NextFunction } from 'express'
import { ZodSchema, ZodError } from 'zod'

export function validate(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const parsed = schema.parse(req.body)


      req.body = parsed

      next()
    } catch (err) {
      if (err instanceof ZodError) {

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