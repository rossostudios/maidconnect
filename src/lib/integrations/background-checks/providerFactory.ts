/**
 * Background Check Provider Factory
 *
 * Factory pattern to instantiate the correct background check provider
 * based on admin configuration or country-specific requirements.
 *
 * Provider Selection by Country:
 * - Colombia (CO): Checkr
 * - Paraguay (PY), Uruguay (UY), Argentina (AR): Truora
 */

import type { CountryCode } from "@/lib/shared/config/territories";
import { CheckrClient } from "./checkrClient";
import { BackgroundCheckProviderInterface } from "./providerInterface";
import { TruoraClient } from "./truoraClient";
import { BackgroundCheckError, BackgroundCheckProvider, ErrorCodes } from "./types";

/**
 * Provider configuration stored in database or environment
 */
type StoredProviderConfig = {
  // Active provider
  activeProvider: BackgroundCheckProvider;

  // Checkr configuration
  checkr: {
    apiKey: string;
    webhookSecret: string;
    enabled: boolean;
  };

  // Truora configuration
  truora: {
    apiKey: string;
    webhookSecret: string;
    enabled: boolean;
  };

  // Fallback provider if primary fails
  fallbackProvider?: BackgroundCheckProvider;
};

/**
 * Factory class to create background check provider instances
 */
export class BackgroundCheckProviderFactory {
  private static instance: BackgroundCheckProviderFactory;
  private config: StoredProviderConfig | null = null;

  private constructor() {}

  /**
   * Get singleton instance
   */
  static getInstance(): BackgroundCheckProviderFactory {
    if (!BackgroundCheckProviderFactory.instance) {
      BackgroundCheckProviderFactory.instance = new BackgroundCheckProviderFactory();
    }
    return BackgroundCheckProviderFactory.instance;
  }

  /**
   * Initialize factory with configuration
   * Call this once at app startup or when config changes
   */
  async initialize(config: StoredProviderConfig): Promise<void> {
    this.config = config;

    // Validate that at least one provider is enabled
    if (!(config.checkr.enabled || config.truora.enabled)) {
      throw new Error("At least one background check provider must be enabled");
    }

    // Validate active provider is enabled
    const activeConfig = config[config.activeProvider];
    if (!activeConfig.enabled) {
      throw new Error(`Active provider ${config.activeProvider} is not enabled`);
    }

    console.log(`[BackgroundCheckFactory] Initialized with provider: ${config.activeProvider}`);
  }

  /**
   * Get the active background check provider instance
   */
  getProvider(): BackgroundCheckProviderInterface {
    if (!this.config) {
      throw new Error("Provider factory not initialized. Call initialize() first.");
    }

    const provider = this.createProvider(this.config.activeProvider);

    if (!provider) {
      throw new BackgroundCheckError(
        "Failed to create background check provider",
        ErrorCodes.PROVIDER_ERROR,
        this.config.activeProvider
      );
    }

    return provider;
  }

  /**
   * Get a specific provider by name (useful for testing/fallback)
   */
  getProviderByName(providerName: BackgroundCheckProvider): BackgroundCheckProviderInterface {
    if (!this.config) {
      throw new Error("Provider factory not initialized. Call initialize() first.");
    }

    const provider = this.createProvider(providerName);

    if (!provider) {
      throw new BackgroundCheckError(
        `Provider ${providerName} not available`,
        ErrorCodes.PROVIDER_ERROR,
        providerName
      );
    }

    return provider;
  }

  /**
   * Get provider based on country code (recommended for multi-country operations)
   *
   * Provider Selection:
   * - Colombia (CO): Checkr
   * - Paraguay (PY), Uruguay (UY), Argentina (AR): Truora
   *
   * @param countryCode - ISO 3166-1 alpha-2 country code
   * @returns Background check provider instance for the specified country
   * @throws Error if provider for country is not enabled or configured
   */
  getProviderByCountry(countryCode: CountryCode): BackgroundCheckProviderInterface {
    if (!this.config) {
      throw new Error("Provider factory not initialized. Call initialize() first.");
    }

    // Determine provider based on country
    let providerName: BackgroundCheckProvider;

    switch (countryCode) {
      case "CO":
        providerName = "checkr";
        break;
      case "PY":
      case "UY":
      case "AR":
        providerName = "truora";
        break;
      default:
        throw new BackgroundCheckError(
          `No background check provider configured for country: ${countryCode}`,
          ErrorCodes.PROVIDER_ERROR,
          "unknown"
        );
    }

    // Validate provider is enabled
    const providerConfig = this.config[providerName];
    if (!providerConfig.enabled) {
      throw new BackgroundCheckError(
        `Background check provider ${providerName} is not enabled for country ${countryCode}`,
        ErrorCodes.PROVIDER_ERROR,
        providerName
      );
    }

    const provider = this.createProvider(providerName);

    if (!provider) {
      throw new BackgroundCheckError(
        `Failed to create provider ${providerName} for country ${countryCode}`,
        ErrorCodes.PROVIDER_ERROR,
        providerName
      );
    }

    console.log(`[BackgroundCheckFactory] Using ${providerName} for country ${countryCode}`);

    return provider;
  }

  /**
   * Get fallback provider if configured
   */
  getFallbackProvider(): BackgroundCheckProviderInterface | null {
    if (!this.config?.fallbackProvider) {
      return null;
    }

    return this.createProvider(this.config.fallbackProvider);
  }

  /**
   * Test if a provider's credentials are valid
   */
  async testProvider(providerName: BackgroundCheckProvider): Promise<boolean> {
    try {
      const provider = this.getProviderByName(providerName);
      return await provider.testCredentials();
    } catch (error) {
      console.error(`[BackgroundCheckFactory] Failed to test ${providerName}:`, error);
      return false;
    }
  }

  /**
   * Get active provider name
   */
  getActiveProviderName(): BackgroundCheckProvider {
    if (!this.config) {
      throw new Error("Provider factory not initialized");
    }
    return this.config.activeProvider;
  }

  /**
   * Update active provider (admin action)
   */
  async setActiveProvider(providerName: BackgroundCheckProvider): Promise<void> {
    if (!this.config) {
      throw new Error("Provider factory not initialized");
    }

    const providerConfig = this.config[providerName];
    if (!providerConfig.enabled) {
      throw new Error(`Cannot set ${providerName} as active: provider is disabled`);
    }

    // Test credentials before switching
    const isValid = await this.testProvider(providerName);
    if (!isValid) {
      throw new Error(`Cannot set ${providerName} as active: invalid credentials`);
    }

    this.config.activeProvider = providerName;

    console.log(`[BackgroundCheckFactory] Switched to provider: ${providerName}`);
  }

  // ============================================================================
  // Private Methods
  // ============================================================================

  private createProvider(
    providerName: BackgroundCheckProvider
  ): BackgroundCheckProviderInterface | null {
    if (!this.config) {
      return null;
    }

    switch (providerName) {
      case "checkr": {
        const { apiKey, webhookSecret, enabled } = this.config.checkr;
        if (!enabled) {
          throw new Error("Checkr provider is disabled");
        }
        if (!(apiKey && webhookSecret)) {
          throw new Error("Checkr credentials missing");
        }
        return new CheckrClient(apiKey, webhookSecret);
      }

      case "truora": {
        const { apiKey, webhookSecret, enabled } = this.config.truora;
        if (!enabled) {
          throw new Error("Truora provider is disabled");
        }
        if (!(apiKey && webhookSecret)) {
          throw new Error("Truora credentials missing");
        }
        return new TruoraClient(apiKey, webhookSecret);
      }

      default:
        return null;
    }
  }
}

/**
 * Helper function to initialize factory from environment variables
 * Call this at app startup
 */
export async function initializeBackgroundCheckFactory(): Promise<void> {
  const config: StoredProviderConfig = {
    activeProvider: (process.env.BACKGROUND_CHECK_PROVIDER as BackgroundCheckProvider) || "checkr",

    checkr: {
      apiKey: process.env.CHECKR_API_KEY || "",
      webhookSecret: process.env.CHECKR_WEBHOOK_SECRET || "",
      enabled: process.env.CHECKR_ENABLED === "true",
    },

    truora: {
      apiKey: process.env.TRUORA_API_KEY || "",
      webhookSecret: process.env.TRUORA_WEBHOOK_SECRET || "",
      enabled: process.env.TRUORA_ENABLED === "true",
    },

    fallbackProvider: process.env.BACKGROUND_CHECK_FALLBACK_PROVIDER as BackgroundCheckProvider,
  };

  const factory = BackgroundCheckProviderFactory.getInstance();
  await factory.initialize(config);
}

/**
 * Convenience function to get active provider
 */
export function getBackgroundCheckProvider(): BackgroundCheckProviderInterface {
  const factory = BackgroundCheckProviderFactory.getInstance();
  return factory.getProvider();
}

/**
 * Convenience function to get provider by country (recommended for multi-country operations)
 *
 * @param countryCode - ISO 3166-1 alpha-2 country code (CO, PY, UY, AR)
 * @returns Background check provider instance for the specified country
 */
export function getBackgroundCheckProviderByCountry(
  countryCode: CountryCode
): BackgroundCheckProviderInterface {
  const factory = BackgroundCheckProviderFactory.getInstance();
  return factory.getProviderByCountry(countryCode);
}
