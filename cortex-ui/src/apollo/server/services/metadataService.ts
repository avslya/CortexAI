/** 
    This class is responsible for handling the retrieval of metadata from the data source.
    For DuckDB, we control the access logic and directly query the cortexEngine.
    For PostgreSQL and BigQuery, we will use the Ibis server API.
 */

import { IIbisAdaptor } from '../adaptors/ibisAdaptor';
import { IcortexEngineAdaptor } from '../adaptors/cortexEngineAdaptor';
import { Project } from '../repositories';
import { DataSourceName } from '../types';
import { getLogger } from '@server/utils';

const logger = getLogger('MetadataService');
logger.level = 'debug';

export interface CompactColumn {
  name: string;
  type: string;
  notNull: boolean;
  description?: string;
  properties?: Record<string, any>;
  nestedColumns?: CompactColumn[];
}

export enum ConstraintType {
  PRIMARY_KEY = 'PRIMARY KEY',
  FOREIGN_KEY = 'FOREIGN KEY',
  UNIQUE = 'UNIQUE',
}

export interface CompactTable {
  name: string;
  columns: CompactColumn[];
  description?: string;
  properties?: Record<string, any>;
  primaryKey?: string;
}

export interface RecommendConstraint {
  constraintName: string;
  constraintType: ConstraintType;
  constraintTable: string;
  constraintColumn: string;
  constraintedTable: string;
  constraintedColumn: string;
}

export interface IDataSourceMetadataService {
  listTables(project: Project): Promise<CompactTable[]>;
  listConstraints(project: Project): Promise<RecommendConstraint[]>;
  getVersion(project: Project): Promise<string>;
}

export class DataSourceMetadataService implements IDataSourceMetadataService {
  private readonly ibisAdaptor: IIbisAdaptor;
  private readonly cortexEngineAdaptor: IcortexEngineAdaptor;

  constructor({
    ibisAdaptor,
    cortexEngineAdaptor,
  }: {
    ibisAdaptor: IIbisAdaptor;
    cortexEngineAdaptor: IcortexEngineAdaptor;
  }) {
    this.ibisAdaptor = ibisAdaptor;
    this.cortexEngineAdaptor = cortexEngineAdaptor;
  }

  public async listTables(project): Promise<CompactTable[]> {
    const { type: dataSource, connectionInfo } = project;
    if (dataSource === DataSourceName.DUCKDB) {
      const tables = await this.cortexEngineAdaptor.listTables();
      return tables;
    }
    return await this.ibisAdaptor.getTables(dataSource, connectionInfo);
  }

  public async listConstraints(
    project: Project,
  ): Promise<RecommendConstraint[]> {
    const { type: dataSource, connectionInfo } = project;
    if (dataSource === DataSourceName.DUCKDB) {
      return [];
    }
    return await this.ibisAdaptor.getConstraints(dataSource, connectionInfo);
  }

  public async getVersion(project: Project): Promise<string> {
    const { type: dataSource, connectionInfo } = project;
    return await this.ibisAdaptor.getVersion(dataSource, connectionInfo);
  }
}
