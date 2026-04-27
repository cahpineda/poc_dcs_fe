'use strict';

const swaggerJsdoc = require('swagger-jsdoc');

const seatObject = {
  type: 'object',
  properties: {
    seat_number: { type: 'string', example: '1A' },
    status: { type: 'string', enum: ['A', 'O', 'B', 'EA', 'EO', 'U', 'IO', 'C', 'D'], example: 'A' },
    cabin_class: { type: 'string', enum: ['F', 'J', 'Y'], example: 'Y' },
    passenger_name: { type: 'string', nullable: true, example: 'JOHN DOE' },
    has_infant: { type: 'boolean', example: false },
    block_note: { type: 'string', nullable: true, example: null },
    gender: { type: 'string', enum: ['M', 'F', 'U'], nullable: true, example: 'M' },
    passenger_key: { type: 'string', nullable: true, example: 'PAX-001' },
    boarding_group: { type: 'integer', nullable: true, example: 1 },
    pnr: { type: 'string', nullable: true, example: 'ABC123' },
    rush_status: { type: 'boolean', example: false },
    ssrs: { type: 'array', items: { type: 'string' }, example: ['WCHR'] },
  },
};

const seatRowObject = {
  type: 'object',
  properties: {
    row_number: { type: 'integer', example: 1 },
    is_exit_row: { type: 'boolean', example: false },
    cabin_class: { type: 'string', enum: ['F', 'J', 'Y'], example: 'Y' },
    seats: { type: 'array', items: seatObject },
  },
};

const successResponse = (dataSchema) => ({
  type: 'object',
  properties: {
    success: { type: 'boolean', example: true },
    data: dataSchema,
  },
});

const errorResponse = {
  type: 'object',
  properties: {
    success: { type: 'boolean', example: false },
    error: { type: 'string', example: 'Flight not found' },
  },
};

const options = {
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'DCS Mock Server',
      version: '1.0.0',
      description:
        'Mock backend for the poc_dcs_fe React POC. Simulates cloud_2 seat_plan endpoints with stateful in-memory data for FL001 and FL002.',
    },
    servers: [{ url: 'http://localhost:3001', description: 'Local mock server' }],
    tags: [
      { name: 'Health', description: 'Server status' },
      { name: 'Seat Plan', description: 'Query seat map and occupancy' },
      { name: 'Commands', description: 'Seat assignment, blocking, and passenger operations' },
    ],
    components: {
      schemas: {
        Seat: seatObject,
        SeatRow: seatRowObject,
        Error: errorResponse,
        SeatPlanData: {
          type: 'object',
          properties: {
            flight_id: { type: 'string', example: 'FL001' },
            is_upper_deck: { type: 'boolean', example: false },
            seat_rows: { type: 'array', items: seatRowObject },
          },
        },
      },
    },
    paths: {
      '/health': {
        get: {
          tags: ['Health'],
          summary: 'Health check',
          responses: {
            200: {
              description: 'Server is running',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      status: { type: 'string', example: 'ok' },
                      flights: { type: 'array', items: { type: 'string' }, example: ['FL001', 'FL002'] },
                    },
                  },
                },
              },
            },
          },
        },
      },
      '/ws/v1.8/get_seat_plan': {
        get: {
          tags: ['Seat Plan'],
          summary: 'Get full seat map for a flight',
          parameters: [
            {
              name: 'flight_id',
              in: 'query',
              required: true,
              schema: { type: 'string', enum: ['FL001', 'FL002'] },
              example: 'FL001',
            },
          ],
          responses: {
            200: {
              description: 'Seat plan returned',
              content: {
                'application/json': {
                  schema: successResponse({ $ref: '#/components/schemas/SeatPlanData' }),
                },
              },
            },
            400: { description: 'Missing flight_id', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
            404: { description: 'Flight not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          },
        },
      },
      '/ws/v1.8/get_seat_occupancy': {
        get: {
          tags: ['Seat Plan'],
          summary: 'Get seat occupancy (same shape as get_seat_plan)',
          parameters: [
            {
              name: 'flight_id',
              in: 'query',
              required: true,
              schema: { type: 'string', enum: ['FL001', 'FL002'] },
              example: 'FL001',
            },
          ],
          responses: {
            200: {
              description: 'Seat occupancy returned',
              content: {
                'application/json': {
                  schema: successResponse({ $ref: '#/components/schemas/SeatPlanData' }),
                },
              },
            },
            400: { description: 'Missing flight_id', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
            404: { description: 'Flight not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          },
        },
      },
      '/ajax/seat_plan/assign_seat': {
        post: {
          tags: ['Commands'],
          summary: 'Assign a passenger to an available seat',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['flight_id', 'seat_number'],
                  properties: {
                    flight_id: { type: 'string', example: 'FL001' },
                    seat_number: { type: 'string', example: '3A' },
                    passenger_id: { type: 'string', example: 'PAX-001' },
                    passenger_name: { type: 'string', example: 'JOHN DOE' },
                  },
                },
              },
            },
          },
          responses: {
            200: {
              description: 'Seat assigned',
              content: {
                'application/json': {
                  schema: successResponse({
                    type: 'object',
                    properties: {
                      seat_number: { type: 'string', example: '3A' },
                      new_status: { type: 'string', example: 'O' },
                    },
                  }),
                },
              },
            },
            400: { description: 'Missing required fields', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
            404: { description: 'Flight or seat not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
            409: { description: 'Seat already occupied', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          },
        },
      },
      '/ajax/seat_plan/block_seat': {
        post: {
          tags: ['Commands'],
          summary: 'Block a seat (taken out of service)',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['flight_id', 'seat_number'],
                  properties: {
                    flight_id: { type: 'string', example: 'FL001' },
                    seat_number: { type: 'string', example: '2B' },
                    reason: { type: 'string', example: 'Technical issue' },
                  },
                },
              },
            },
          },
          responses: {
            200: {
              description: 'Seat blocked',
              content: {
                'application/json': {
                  schema: successResponse({
                    type: 'object',
                    properties: {
                      seat_number: { type: 'string', example: '2B' },
                      new_status: { type: 'string', example: 'B' },
                    },
                  }),
                },
              },
            },
            400: { description: 'Missing required fields', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
            404: { description: 'Flight or seat not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          },
        },
      },
      '/ajax/seat_plan/unblock_seat': {
        post: {
          tags: ['Commands'],
          summary: 'Unblock a previously blocked seat',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['flight_id', 'seat_number'],
                  properties: {
                    flight_id: { type: 'string', example: 'FL001' },
                    seat_number: { type: 'string', example: '2B' },
                  },
                },
              },
            },
          },
          responses: {
            200: {
              description: 'Seat unblocked',
              content: {
                'application/json': {
                  schema: successResponse({
                    type: 'object',
                    properties: {
                      seat_number: { type: 'string', example: '2B' },
                      new_status: { type: 'string', example: 'A' },
                    },
                  }),
                },
              },
            },
            400: { description: 'Missing required fields', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
            404: { description: 'Flight or seat not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          },
        },
      },
      '/ajax/seat_plan/reseat_passenger': {
        post: {
          tags: ['Commands'],
          summary: 'Move a passenger from one seat to another',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['flight_id', 'from_seat', 'to_seat'],
                  properties: {
                    flight_id: { type: 'string', example: 'FL001' },
                    from_seat: { type: 'string', example: '1B' },
                    to_seat: { type: 'string', example: '4A' },
                    passenger_id: { type: 'string', example: 'PAX-001' },
                  },
                },
              },
            },
          },
          responses: {
            200: {
              description: 'Passenger reseated',
              content: {
                'application/json': {
                  schema: successResponse({
                    type: 'object',
                    properties: {
                      from_seat: { type: 'string', example: '1B' },
                      to_seat: { type: 'string', example: '4A' },
                    },
                  }),
                },
              },
            },
            400: { description: 'Missing required fields', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
            404: { description: 'Flight or seat not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
            409: { description: 'Destination seat not available', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          },
        },
      },
      '/dc/unseat_passenger': {
        post: {
          tags: ['Commands'],
          summary: 'Remove a passenger from their seat (unseat)',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['flight_id', 'seat_number'],
                  properties: {
                    flight_id: { type: 'string', example: 'FL001' },
                    seat_number: { type: 'string', example: '1B' },
                  },
                },
              },
            },
          },
          responses: {
            200: {
              description: 'Passenger unseated',
              content: {
                'application/json': {
                  schema: successResponse({
                    type: 'object',
                    properties: {
                      seat_number: { type: 'string', example: '1B' },
                      new_status: { type: 'string', example: 'A' },
                    },
                  }),
                },
              },
            },
            400: { description: 'Missing required fields', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
            404: { description: 'Flight or seat not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          },
        },
      },
      '/dc/swap_seats': {
        post: {
          tags: ['Commands'],
          summary: 'Swap two passengers between their seats',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['flight_id', 'seat_a', 'seat_b'],
                  properties: {
                    flight_id: { type: 'string', example: 'FL001' },
                    seat_a: { type: 'string', example: '1A' },
                    seat_b: { type: 'string', example: '2C' },
                  },
                },
              },
            },
          },
          responses: {
            200: {
              description: 'Seats swapped',
              content: {
                'application/json': {
                  schema: successResponse({
                    type: 'object',
                    properties: {
                      seat_a: { type: 'string', example: '1A' },
                      seat_b: { type: 'string', example: '2C' },
                    },
                  }),
                },
              },
            },
            400: { description: 'Missing required fields', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
            404: { description: 'Flight or seat not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          },
        },
      },
      '/dc/reseat_group': {
        post: {
          tags: ['Commands'],
          summary: 'Move a group of passengers to available seats',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['flight_id', 'passenger_ids'],
                  properties: {
                    flight_id: { type: 'string', example: 'FL001' },
                    passenger_ids: {
                      type: 'array',
                      items: { type: 'string' },
                      example: ['PAX-001', 'PAX-002'],
                    },
                    target_row: { type: 'integer', nullable: true, example: 4 },
                  },
                },
              },
            },
          },
          responses: {
            200: {
              description: 'Group reseated',
              content: {
                'application/json': {
                  schema: successResponse({
                    type: 'object',
                    properties: {
                      moved: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            from: { type: 'string', example: '1B' },
                            to: { type: 'string', example: '4A' },
                          },
                        },
                      },
                    },
                  }),
                },
              },
            },
            400: { description: 'Missing required fields', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
            404: { description: 'Flight or passenger not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
            409: { description: 'No available seats for a passenger', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          },
        },
      },
    },
  },
  apis: [],
};

module.exports = swaggerJsdoc(options);
