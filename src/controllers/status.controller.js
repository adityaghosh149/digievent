import mongoose from 'mongoose';
import os from 'os';
import process from 'process';
import { APIError } from '../utils/apiError.js'; // Assuming these are in the same directory
import { APIResponse } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHander.js';

// Utility function to check database connectivity
const checkDatabaseConnection = asyncHandler(async () => {
    try {
        const state = mongoose.connection.readyState; // 0: disconnected, 1: connected, 2: connecting, 3: disconnecting
        return state === 1; // Return true if connected
    } catch (error) {
        throw new APIError(500, 'Database connection error', [error.message]);
    }
});

// Main health check function
const getHealthStatus = asyncHandler (async (req, res, next) => {
	const startTime = process.uptime(); // Get the server uptime in seconds
	const cpuUsage = os.loadavg(); // Get CPU load averages (last 1, 5, 15 minutes)
	const memoryUsage = process.memoryUsage(); // Get memory usage details

	// Check database connectivity
	const dbStatus = await checkDatabaseConnection();

	const healthStatus = {
		status: dbStatus ? 'ok' : 'error',
		uptime: startTime, // Server uptime in seconds
		timestamp: new Date().toISOString(),
		systemInfo: {
		cpuLoad: cpuUsage, // System CPU load averages
		memoryUsage: {
			rss: memoryUsage.rss, // Resident Set Size (memory used by the process)
			heapUsed: memoryUsage.heapUsed, // Memory used by the heap
			heapTotal: memoryUsage.heapTotal, // Total memory allocated to the heap
		},
		freeMemory: os.freemem(), // System free memory
		totalMemory: os.totalmem(), // System total memory
		},
		database: dbStatus ? 'connected' : 'disconnected', // Database connection status
	};

  // Send a successful response with APIResponse
  	return new APIResponse(200, healthStatus, "System health is good").send(res);
});

export { getHealthStatus };

