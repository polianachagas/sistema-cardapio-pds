import { z } from 'zod';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

//Environment variables validation schema
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).default('3001'),
  
  // Firebase Configuration
  FIREBASE_PROJECT_ID: z.string().min(1, 'Firebase Project ID is required'),
  FIREBASE_SERVICE_ACCOUNT_KEY: z.string().optional(),
  FIREBASE_STORAGE_BUCKET: z.string().optional(),
  
  // API Configuration
  API_VERSION: z.string().default('v1'),
  API_BASE_PATH: z.string().default('/api'),
  
  // CORS Configuration
  ALLOWED_ORIGINS: z.string().default('http://localhost:3000,http://localhost:5173'),
  
  // Upload Configuration
  MAX_FILE_SIZE_MB: z.string().transform(Number).default('10'),
  UPLOAD_PATH: z.string().default('uploads')
});

//Validated environment configuration
class EnvConfig {
  private static instance: EnvConfig;
  private config: z.infer<typeof envSchema>;

  private constructor() {
    this.validateEnv();
  }

  static getInstance(): EnvConfig {
    if (!EnvConfig.instance) {
      EnvConfig.instance = new EnvConfig();
    }
    return EnvConfig.instance;
  }

  private validateEnv(): void {
    try {
      this.config = envSchema.parse(process.env);
      console.log('✅ Environment variables validated successfully');
    } catch (error) {
      console.error('❌ Environment validation failed:', error);
      process.exit(1);
    }
  }

  get nodeEnv(): string {
    return this.config.NODE_ENV;
  }

  get port(): number {
    return this.config.PORT;
  }

  get isProduction(): boolean {
    return this.config.NODE_ENV === 'production';
  }

  get isDevelopment(): boolean {
    return this.config.NODE_ENV === 'development';
  }

  get firebase() {
    return {
      projectId: this.config.FIREBASE_PROJECT_ID,
      serviceAccountKey: this.config.FIREBASE_SERVICE_ACCOUNT_KEY,
      storageBucket: this.config.FIREBASE_STORAGE_BUCKET
    };
  }

  get api() {
    return {
      version: this.config.API_VERSION,
      basePath: this.config.API_BASE_PATH,
      fullPath: `${this.config.API_BASE_PATH}/${this.config.API_VERSION}`
    };
  }

  get cors() {
    return {
      origins: this.config.ALLOWED_ORIGINS.split(',').map(origin => origin.trim())
    };
  }

  get upload() {
    return {
      maxFileSizeMB: this.config.MAX_FILE_SIZE_MB,
      maxFileSizeBytes: this.config.MAX_FILE_SIZE_MB * 1024 * 1024,
      path: this.config.UPLOAD_PATH
    };
  }

 //Get all configuration as object
  getAll() {
    return {
      nodeEnv: this.nodeEnv,
      port: this.port,
      isProduction: this.isProduction,
      isDevelopment: this.isDevelopment,
      firebase: this.firebase,
      api: this.api,
      cors: this.cors,
      upload: this.upload
    };
  }
}

// Export singleton instance
export const envConfig = EnvConfig.getInstance();
