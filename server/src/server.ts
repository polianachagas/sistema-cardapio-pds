import app from './app';
import { envConfig } from './config/env';

const PORT = envConfig.port;

//Start the server
const server = app.listen(PORT, () => {
  console.log(`🚀 Digital Menu API Server running on port ${PORT}`);
  console.log(`📊 Environment: ${envConfig.nodeEnv}`);
  console.log(`🔗 Local URL: http://localhost:${PORT}`);
  console.log(`📖 API Documentation: http://localhost:${PORT}/api/v1/health`);
});

//Graceful shutdown handler
const gracefulShutdown = (signal: string) => {
  console.log(`\n⚠️  Received ${signal}. Starting graceful shutdown...`);
  
  server.close(() => {
    console.log('✅ HTTP server closed');
    
    // Close database connections, cleanup resources, etc.
    // Add any cleanup logic here
    
    console.log('🔄 Cleanup completed');
    process.exit(0);
  });

  // Force close server after 30s
  setTimeout(() => {
    console.error('❌ Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 30000);
};

// Handle process termination
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (error: Error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

export default server;
