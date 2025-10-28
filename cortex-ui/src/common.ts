import { getConfig } from '@server/config';
import { bootstrapKnex } from './apollo/server/utils/knex';
import {
  ProjectRepository,
  ViewRepository,
  DeployLogRepository,
  ThreadRepository,
  ThreadResponseRepository,
  ModelRepository,
  ModelColumnRepository,
  RelationRepository,
  SchemaChangeRepository,
  ModelNestedColumnRepository,
  LearningRepository,
  DashboardItemRepository,
  DashboardRepository,
  SqlPairRepository,
  AskingTaskRepository,
  InstructionRepository,
  ApiHistoryRepository,
  DashboardItemRefreshJobRepository,
} from '@server/repositories';
import {
  cortexEngineAdaptor,
  cortexAIAdaptor,
  IbisAdaptor,
} from '@server/adaptors';
import {
  DataSourceMetadataService,
  QueryService,
  ProjectService,
  DeployService,
  AskingService,
  MDLService,
  DashboardService,
  AskingTaskTracker,
  InstructionService,
} from '@server/services';
import { PostHogTelemetry } from './apollo/server/telemetry/telemetry';
import {
  ProjectRecommendQuestionBackgroundTracker,
  ThreadRecommendQuestionBackgroundTracker,
  DashboardCacheBackgroundTracker,
} from './apollo/server/backgrounds';
import { SqlPairService } from './apollo/server/services/sqlPairService';

export const serverConfig = getConfig();

export const initComponents = () => {
  const telemetry = new PostHogTelemetry();
  const knex = bootstrapKnex({
    dbType: serverConfig.dbType,
    pgUrl: serverConfig.pgUrl,
    debug: serverConfig.debug,
    sqliteFile: serverConfig.sqliteFile,
  });

  // repositories
  const projectRepository = new ProjectRepository(knex);
  const deployLogRepository = new DeployLogRepository(knex);
  const threadRepository = new ThreadRepository(knex);
  const threadResponseRepository = new ThreadResponseRepository(knex);
  const viewRepository = new ViewRepository(knex);
  const modelRepository = new ModelRepository(knex);
  const modelColumnRepository = new ModelColumnRepository(knex);
  const modelNestedColumnRepository = new ModelNestedColumnRepository(knex);
  const relationRepository = new RelationRepository(knex);
  const schemaChangeRepository = new SchemaChangeRepository(knex);
  const learningRepository = new LearningRepository(knex);
  const dashboardRepository = new DashboardRepository(knex);
  const dashboardItemRepository = new DashboardItemRepository(knex);
  const sqlPairRepository = new SqlPairRepository(knex);
  const askingTaskRepository = new AskingTaskRepository(knex);
  const instructionRepository = new InstructionRepository(knex);
  const apiHistoryRepository = new ApiHistoryRepository(knex);
  const dashboardItemRefreshJobRepository =
    new DashboardItemRefreshJobRepository(knex);

  // adaptors
  const cortexEngineAdaptor = new cortexEngineAdaptor({
    cortexEngineEndpoint: serverConfig.cortexEngineEndpoint,
  });
  const cortexAIAdaptor = new cortexAIAdaptor({
    cortexAIBaseEndpoint: serverConfig.cortexAIEndpoint,
  });
  const ibisAdaptor = new IbisAdaptor({
    ibisServerEndpoint: serverConfig.ibisServerEndpoint,
  });

  // services
  const metadataService = new DataSourceMetadataService({
    ibisAdaptor,
    cortexEngineAdaptor,
  });
  const queryService = new QueryService({
    ibisAdaptor,
    cortexEngineAdaptor,
    telemetry,
  });
  const deployService = new DeployService({
    cortexAIAdaptor,
    deployLogRepository,
    telemetry,
  });
  const mdlService = new MDLService({
    projectRepository,
    modelRepository,
    modelColumnRepository,
    modelNestedColumnRepository,
    relationRepository,
    viewRepository,
  });
  const projectService = new ProjectService({
    projectRepository,
    metadataService,
    mdlService,
    cortexAIAdaptor,
    telemetry,
  });
  const askingTaskTracker = new AskingTaskTracker({
    cortexAIAdaptor,
    askingTaskRepository,
    threadResponseRepository,
    viewRepository,
  });
  const askingService = new AskingService({
    telemetry,
    cortexAIAdaptor,
    deployService,
    projectService,
    viewRepository,
    threadRepository,
    threadResponseRepository,
    queryService,
    mdlService,
    askingTaskTracker,
    askingTaskRepository,
  });
  const dashboardService = new DashboardService({
    projectService,
    dashboardItemRepository,
    dashboardRepository,
  });
  const sqlPairService = new SqlPairService({
    sqlPairRepository,
    cortexAIAdaptor,
    ibisAdaptor,
  });
  const instructionService = new InstructionService({
    instructionRepository,
    cortexAIAdaptor,
  });

  // background trackers
  const projectRecommendQuestionBackgroundTracker =
    new ProjectRecommendQuestionBackgroundTracker({
      telemetry,
      cortexAIAdaptor,
      projectRepository,
    });
  const threadRecommendQuestionBackgroundTracker =
    new ThreadRecommendQuestionBackgroundTracker({
      telemetry,
      cortexAIAdaptor,
      threadRepository,
    });
  const dashboardCacheBackgroundTracker = new DashboardCacheBackgroundTracker({
    dashboardRepository,
    dashboardItemRepository,
    dashboardItemRefreshJobRepository,
    projectService,
    deployService,
    queryService,
  });

  return {
    knex,
    telemetry,

    // repositories
    projectRepository,
    deployLogRepository,
    threadRepository,
    threadResponseRepository,
    viewRepository,
    modelRepository,
    modelColumnRepository,
    relationRepository,
    schemaChangeRepository,
    learningRepository,
    modelNestedColumnRepository,
    dashboardRepository,
    dashboardItemRepository,
    sqlPairRepository,
    askingTaskRepository,
    apiHistoryRepository,
    instructionRepository,
    dashboardItemRefreshJobRepository,

    // adaptors
    cortexEngineAdaptor,
    cortexAIAdaptor,
    ibisAdaptor,

    // services
    metadataService,
    projectService,
    queryService,
    deployService,
    askingService,
    mdlService,
    dashboardService,
    sqlPairService,
    instructionService,
    askingTaskTracker,

    // background trackers
    projectRecommendQuestionBackgroundTracker,
    threadRecommendQuestionBackgroundTracker,
    dashboardCacheBackgroundTracker,
  };
};

// singleton components
export const components = initComponents();
