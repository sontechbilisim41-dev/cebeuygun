import { BaseConnector } from '@/types';
import { CSVConnector } from './csvConnector';
import { LogoConnector } from './logoConnector';
import { NetsisConnector } from './netsisConnector';
import { logger } from '@/utils/logger';

class ConnectorFactory {
  private connectors: Map<string, () => BaseConnector> = new Map();

  constructor() {
    this.registerConnectors();
  }

  private registerConnectors(): void {
    this.connectors.set('csv', () => new CSVConnector());
    this.connectors.set('logo', () => new LogoConnector());
    this.connectors.set('netsis', () => new NetsisConnector());
  }

  createConnector(type: string): BaseConnector {
    const connectorFactory = this.connectors.get(type);
    
    if (!connectorFactory) {
      throw new Error(`Unsupported connector type: ${type}`);
    }

    const connector = connectorFactory();
    
    logger.info(`Connector created: ${type}`, {
      connectorId: connector.id,
      version: connector.version,
    });

    return connector;
  }

  getAvailableConnectors(): Array<{
    id: string;
    name: string;
    version: string;
    supportedOperations: string[];
  }> {
    const connectors = [];
    
    for (const [type, factory] of this.connectors.entries()) {
      const connector = factory();
      connectors.push({
        id: connector.id,
        name: connector.name,
        version: connector.version,
        supportedOperations: connector.supportedOperations,
      });
    }

    return connectors;
  }

  registerCustomConnector(
    type: string,
    connectorFactory: () => BaseConnector
  ): void {
    this.connectors.set(type, connectorFactory);
    
    logger.info(`Custom connector registered: ${type}`);
  }

  isConnectorSupported(type: string): boolean {
    return this.connectors.has(type);
  }

  getConnectorInfo(type: string): {
    id: string;
    name: string;
    version: string;
    supportedOperations: string[];
  } | null {
    const connectorFactory = this.connectors.get(type);
    
    if (!connectorFactory) {
      return null;
    }

    const connector = connectorFactory();
    
    return {
      id: connector.id,
      name: connector.name,
      version: connector.version,
      supportedOperations: connector.supportedOperations,
    };
  }
}

export const connectorFactory = new ConnectorFactory();