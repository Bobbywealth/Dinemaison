import type { Express } from 'express';
import { config } from './config';

/**
 * OpenAPI/Swagger Documentation
 * This provides API documentation accessible at /api/docs
 */

export const swaggerSpec = {
  openapi: '3.0.0',
  info: {
    title: 'Dine Maison API',
    version: '1.0.0',
    description: 'API documentation for Dine Maison - Luxury Private Dining Marketplace',
    contact: {
      name: 'API Support',
      url: 'https://dinemaison.com/support',
    },
  },
  servers: [
    {
      url: config.urls.app || 'http://localhost:5000',
      description: config.server.isProduction ? 'Production' : 'Development',
    },
  ],
  tags: [
    { name: 'Auth', description: 'Authentication endpoints' },
    { name: 'Chefs', description: 'Chef profile and management' },
    { name: 'Bookings', description: 'Booking management' },
    { name: 'Reviews', description: 'Review and rating system' },
    { name: 'Admin', description: 'Admin operations' },
    { name: 'Payments', description: 'Payment and Stripe operations' },
  ],
  components: {
    securitySchemes: {
      cookieAuth: {
        type: 'apiKey',
        in: 'cookie',
        name: 'connect.sid',
      },
    },
    schemas: {
      Error: {
        type: 'object',
        properties: {
          message: { type: 'string' },
        },
      },
      ChefProfile: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          userId: { type: 'string' },
          displayName: { type: 'string' },
          bio: { type: 'string' },
          yearsExperience: { type: 'integer' },
          profileImageUrl: { type: 'string' },
          hourlyRate: { type: 'number' },
          minimumSpend: { type: 'number' },
          cuisines: { type: 'array', items: { type: 'string' } },
          averageRating: { type: 'number' },
          totalReviews: { type: 'integer' },
          isActive: { type: 'boolean' },
        },
      },
      Booking: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          customerId: { type: 'string' },
          chefId: { type: 'string' },
          eventDate: { type: 'string', format: 'date-time' },
          guestCount: { type: 'integer' },
          status: { type: 'string', enum: ['requested', 'accepted', 'confirmed', 'completed', 'cancelled'] },
          total: { type: 'number' },
          paymentStatus: { type: 'string' },
        },
      },
      Review: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          bookingId: { type: 'string' },
          chefId: { type: 'string' },
          customerId: { type: 'string' },
          rating: { type: 'integer', minimum: 1, maximum: 5 },
          comment: { type: 'string' },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
    },
  },
  paths: {
    '/api/chefs': {
      get: {
        tags: ['Chefs'],
        summary: 'Get list of chefs',
        description: 'Retrieve a list of active chefs with optional filtering',
        parameters: [
          {
            name: 'search',
            in: 'query',
            schema: { type: 'string' },
            description: 'Search term for chef name or cuisine',
          },
          {
            name: 'cuisine',
            in: 'query',
            schema: { type: 'string' },
            description: 'Filter by cuisine type',
          },
          {
            name: 'minPrice',
            in: 'query',
            schema: { type: 'number' },
            description: 'Minimum hourly rate',
          },
          {
            name: 'maxPrice',
            in: 'query',
            schema: { type: 'number' },
            description: 'Maximum hourly rate',
          },
          {
            name: 'minRating',
            in: 'query',
            schema: { type: 'number' },
            description: 'Minimum average rating',
          },
        ],
        responses: {
          200: {
            description: 'List of chefs',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/ChefProfile' },
                },
              },
            },
          },
        },
      },
    },
    '/api/chefs/{id}': {
      get: {
        tags: ['Chefs'],
        summary: 'Get chef by ID',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          200: {
            description: 'Chef profile',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ChefProfile' },
              },
            },
          },
          404: {
            description: 'Chef not found',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
              },
            },
          },
        },
      },
    },
    '/api/bookings': {
      get: {
        tags: ['Bookings'],
        summary: 'Get user bookings',
        security: [{ cookieAuth: [] }],
        responses: {
          200: {
            description: 'List of bookings',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/Booking' },
                },
              },
            },
          },
          401: {
            description: 'Not authenticated',
          },
        },
      },
      post: {
        tags: ['Bookings'],
        summary: 'Create new booking',
        security: [{ cookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['chefId', 'eventDate', 'eventTime', 'guestCount', 'eventAddress', 'subtotal', 'total'],
                properties: {
                  chefId: { type: 'string' },
                  eventDate: { type: 'string', format: 'date-time' },
                  eventTime: { type: 'string' },
                  guestCount: { type: 'integer' },
                  eventAddress: { type: 'string' },
                  specialRequests: { type: 'string' },
                  subtotal: { type: 'number' },
                  total: { type: 'number' },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Booking created',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Booking' },
              },
            },
          },
          400: {
            description: 'Invalid data',
          },
          401: {
            description: 'Not authenticated',
          },
        },
      },
    },
    '/api/bookings/{id}/review': {
      post: {
        tags: ['Reviews'],
        summary: 'Create review for booking',
        security: [{ cookieAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['rating'],
                properties: {
                  rating: { type: 'integer', minimum: 1, maximum: 5 },
                  comment: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Review created',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Review' },
              },
            },
          },
          400: {
            description: 'Invalid data or booking not completed',
          },
          401: {
            description: 'Not authenticated',
          },
          403: {
            description: 'Not authorized to review this booking',
          },
        },
      },
    },
    '/api/admin/stats': {
      get: {
        tags: ['Admin'],
        summary: 'Get platform statistics',
        security: [{ cookieAuth: [] }],
        responses: {
          200: {
            description: 'Platform stats',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    totalUsers: { type: 'integer' },
                    totalChefs: { type: 'integer' },
                    totalBookings: { type: 'integer' },
                    totalRevenue: { type: 'number' },
                    pendingVerifications: { type: 'integer' },
                  },
                },
              },
            },
          },
          401: {
            description: 'Not authenticated',
          },
          403: {
            description: 'Admin access required',
          },
        },
      },
    },
  },
};

export function setupSwagger(app: Express) {
  // Serve OpenAPI spec as JSON
  app.get('/api/docs/openapi.json', (req, res) => {
    res.json(swaggerSpec);
  });

  // Serve Swagger UI HTML
  app.get('/api/docs', (req, res) => {
    res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Dine Maison API Documentation</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui.css">
  <style>
    body { margin: 0; padding: 0; }
    .topbar { display: none; }
  </style>
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui-standalone-preset.js"></script>
  <script>
    window.onload = () => {
      SwaggerUIBundle({
        url: '/api/docs/openapi.json',
        dom_id: '#swagger-ui',
        deepLinking: true,
        presets: [
          SwaggerUIBundle.presets.apis,
          SwaggerUIStandalonePreset
        ],
        plugins: [
          SwaggerUIBundle.plugins.DownloadUrl
        ],
        layout: 'StandaloneLayout'
      });
    };
  </script>
</body>
</html>
    `);
  });
}

