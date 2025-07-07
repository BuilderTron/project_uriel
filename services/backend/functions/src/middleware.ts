// Rate limiting and security middleware for Express routes
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import {Request, Response, NextFunction} from "express";

/**
 * Rate limiting configuration for different endpoints
 */
export const createRateLimit = (windowMs: number = 15 * 60 * 1000, max: number = 100) => {
  return rateLimit({
    windowMs, // Time window in milliseconds
    max, // Maximum number of requests per window
    message: {
      error: "Too Many Requests",
      message: "Rate limit exceeded. Please try again later.",
      retryAfter: Math.ceil(windowMs / 1000)
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    // Store rate limit info in memory (for development)
    // In production, consider using Redis or another persistent store
    skip: (req: Request) => {
      // Skip rate limiting for health checks
      return req.path === "/health" || req.path === "/healthz";
    }
  });
};

/**
 * Different rate limits for different types of endpoints
 */
export const rateLimits = {
  // Strict rate limit for auth endpoints
  auth: createRateLimit(15 * 60 * 1000, 10), // 10 requests per 15 minutes
  
  // Moderate rate limit for contact forms
  contact: createRateLimit(10 * 60 * 1000, 5), // 5 requests per 10 minutes
  
  // General API rate limit
  general: createRateLimit(15 * 60 * 1000, 100), // 100 requests per 15 minutes
  
  // Admin endpoints (more lenient for authenticated admins)
  admin: createRateLimit(15 * 60 * 1000, 200) // 200 requests per 15 minutes
};

/**
 * Security headers middleware using Helmet
 */
export const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://apis.google.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://api.sendgrid.com"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"]
    }
  },
  crossOriginEmbedderPolicy: false, // Disable for Firebase Functions compatibility
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
});

/**
 * CORS configuration for different environments
 */
export const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    const allowedOrigins = [
      "http://localhost:5173", // Vite dev server
      "http://localhost:3000", // Alternative dev server
      "https://project-uriel.web.app", // Firebase hosting
      "https://project-uriel.firebaseapp.com", // Firebase hosting
      "https://projecturiel.com", // Custom domain (if configured)
      "https://www.projecturiel.com" // Custom domain with www
    ];

    // In development, allow all localhost origins
    if (process.env.NODE_ENV === "development" || 
        process.env.FUNCTIONS_EMULATOR === "true") {
      if (origin.includes("localhost") || origin.includes("127.0.0.1")) {
        return callback(null, true);
      }
    }

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: [
    "Origin",
    "X-Requested-With", 
    "Content-Type", 
    "Accept",
    "Authorization",
    "Cache-Control"
  ]
};

/**
 * Input validation middleware
 */
export const validateInput = (schema: any) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // Basic validation example - in production, use a library like Joi or Yup
      const { error, value } = validateData(req.body, schema);
      
      if (error) {
        return res.status(400).json({
          error: "Validation Error",
          message: error.message,
          details: error.details
        });
      }
      
      req.body = value;
      return next();
    } catch (error) {
      console.error("Validation middleware error:", error);
      return res.status(500).json({
        error: "Internal Server Error",
        message: "Validation failed"
      });
    }
  };
};

/**
 * Basic data validation function
 */
function validateData(data: any, schema: any): { error?: any; value: any } {
  // This is a simplified validation - replace with proper validation library
  if (!data) {
    return { 
      error: { 
        message: "Request body is required",
        details: []
      }, 
      value: null 
    };
  }

  // Check required fields
  if (schema.required) {
    for (const field of schema.required) {
      if (!(field in data) || data[field] === null || data[field] === undefined) {
        return {
          error: {
            message: `Missing required field: ${field}`,
            details: [{ field, message: "Required field is missing" }]
          },
          value: null
        };
      }
    }
  }

  // Basic type checking
  if (schema.fields) {
    for (const [fieldName, fieldSchema] of Object.entries(schema.fields)) {
      if (fieldName in data) {
        const fieldValue = data[fieldName];
        const expectedType = (fieldSchema as any).type;
        
        if (expectedType && typeof fieldValue !== expectedType) {
          return {
            error: {
              message: `Invalid type for field ${fieldName}. Expected ${expectedType}`,
              details: [{ field: fieldName, message: `Expected ${expectedType}` }]
            },
            value: null
          };
        }
        
        // String length validation
        if (expectedType === "string" && (fieldSchema as any).maxLength) {
          if (fieldValue.length > (fieldSchema as any).maxLength) {
            return {
              error: {
                message: `Field ${fieldName} exceeds maximum length`,
                details: [{ field: fieldName, message: "String too long" }]
              },
              value: null
            };
          }
        }
        
        // Email validation
        if ((fieldSchema as any).format === "email") {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(fieldValue)) {
            return {
              error: {
                message: `Invalid email format for field ${fieldName}`,
                details: [{ field: fieldName, message: "Invalid email format" }]
              },
              value: null
            };
          }
        }
      }
    }
  }

  return { value: data };
}

/**
 * Error handling middleware
 */
export const errorHandler = (
  err: any, 
  req: Request, 
  res: Response, 
  next: NextFunction
) => {
  console.error("Express error:", err);

  // Handle different types of errors
  if (err.type === "time-out") {
    return res.status(408).json({
      error: "Request Timeout",
      message: "Request took too long to process"
    });
  }

  if (err.type === "entity.parse.failed") {
    return res.status(400).json({
      error: "Bad Request",
      message: "Invalid JSON in request body"
    });
  }

  if (err.type === "entity.too.large") {
    return res.status(413).json({
      error: "Payload Too Large",
      message: "Request body is too large"
    });
  }

  // Default error response
  return res.status(500).json({
    error: "Internal Server Error",
    message: "An unexpected error occurred"
  });
};

/**
 * Request logging middleware
 */
export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  
  // Log request
  console.log(`${req.method} ${req.url} - ${req.ip} - ${new Date().toISOString()}`);
  
  // Log response when it finishes
  res.on("finish", () => {
    const duration = Date.now() - start;
    console.log(
      `${req.method} ${req.url} - ${res.statusCode} - ${duration}ms - ${req.ip}`
    );
  });
  
  next();
};

/**
 * Health check endpoint
 */
export const healthCheck = (req: Request, res: Response) => {
  res.status(200).json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    service: "project-uriel-functions",
    version: "1.0.0",
    environment: process.env.NODE_ENV || "development",
    uptime: process.uptime()
  });
};

/**
 * Common validation schemas
 */
export const validationSchemas = {
  contact: {
    required: ["name", "email", "subject", "message"],
    fields: {
      name: { type: "string", maxLength: 100 },
      email: { type: "string", format: "email", maxLength: 254 },
      subject: { type: "string", maxLength: 200 },
      message: { type: "string", maxLength: 2000 }
    }
  },
  
  user: {
    required: ["email"],
    fields: {
      email: { type: "string", format: "email", maxLength: 254 },
      displayName: { type: "string", maxLength: 100 },
      role: { type: "string", enum: ["admin", "user"] }
    }
  },
  
  project: {
    required: ["title", "description"],
    fields: {
      title: { type: "string", maxLength: 200 },
      description: { type: "string", maxLength: 2000 },
      technologies: { type: "object" }, // Array of strings
      githubUrl: { type: "string", maxLength: 500 },
      liveUrl: { type: "string", maxLength: 500 }
    }
  }
};