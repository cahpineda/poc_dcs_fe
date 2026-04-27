'use strict';

const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger');
const seatPlanRoutes = require('./routes/seatPlan');
const commandRoutes = require('./routes/commands');

const app = express();
const PORT = process.env.PORT || 3001;

// CORS — allow FE dev servers with credentials
app.use(
  cors({
    origin: ['http://localhost:5174', 'http://localhost:5173'],
    credentials: true,
  })
);

// Parse JSON bodies
app.use(express.json());

// Swagger UI
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get('/docs.json', (req, res) => res.json(swaggerSpec));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', flights: ['FL001', 'FL002'] });
});

// Seat plan query routes  →  /ws/v1.8/get_seat_plan  &  /ws/v1.8/get_seat_occupancy
app.use('/ws/v1.8', seatPlanRoutes);

// Command (mutation) routes
//   /ajax/seat_plan/{assign_seat, block_seat, unblock_seat, reseat_passenger}
app.use('/ajax/seat_plan', commandRoutes);

//   /dc/{unseat_passenger, swap_seats, reseat_group}
app.use('/dc', commandRoutes);

app.listen(PORT, () => {
  console.log(`Mock DCS server running on http://localhost:${PORT}`);
  console.log(`Swagger UI:  http://localhost:${PORT}/docs`);
  console.log(`OpenAPI JSON: http://localhost:${PORT}/docs.json`);
});
