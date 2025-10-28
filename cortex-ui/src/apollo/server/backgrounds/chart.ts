import { ChartStatus } from '@server/models/adaptor';
import { IcortexAIAdaptor } from '@server/adaptors/cortexAIAdaptor';
import {
  IThreadResponseRepository,
  ThreadResponse,
} from '@server/repositories';
import { getLogger } from '@server/utils/logger';
import {
  PostHogTelemetry,
  TelemetryEvent,
  cortexService,
} from '@server/telemetry/telemetry';

const logger = getLogger('ChartBackgroundTracker');
logger.level = 'debug';

const isFinalized = (status: ChartStatus) => {
  return (
    status === ChartStatus.FINISHED ||
    status === ChartStatus.FAILED ||
    status === ChartStatus.STOPPED
  );
};

export class ChartBackgroundTracker {
  private tasks: Record<number, ThreadResponse> = {};
  private intervalTime: number;
  private cortexAIAdaptor: IcortexAIAdaptor;
  private threadResponseRepository: IThreadResponseRepository;
  private runningJobs = new Set();
  private telemetry: PostHogTelemetry;

  constructor({
    telemetry,
    cortexAIAdaptor,
    threadResponseRepository,
  }: {
    telemetry: PostHogTelemetry;
    cortexAIAdaptor: IcortexAIAdaptor;
    threadResponseRepository: IThreadResponseRepository;
  }) {
    this.telemetry = telemetry;
    this.cortexAIAdaptor = cortexAIAdaptor;
    this.threadResponseRepository = threadResponseRepository;
    this.intervalTime = 1000;
    this.start();
  }

  private start() {
    logger.info('Chart background tracker started');
    setInterval(() => {
      const jobs = Object.values(this.tasks).map(
        (threadResponse) => async () => {
          // check if same job is running
          if (this.runningJobs.has(threadResponse.id)) {
            return;
          }

          // mark the job as running
          this.runningJobs.add(threadResponse.id);

          // get the chart detail
          const chartDetail = threadResponse.chartDetail;

          // get the latest result from AI service
          const result = await this.cortexAIAdaptor.getChartResult(
            chartDetail.queryId,
          );

          // check if status change
          if (chartDetail.status === result.status) {
            // mark the job as finished
            logger.debug(
              `Job ${threadResponse.id} chart status not changed, finished`,
            );
            this.runningJobs.delete(threadResponse.id);
            return;
          }

          // update database
          const updatedChartDetail = {
            queryId: chartDetail.queryId,
            status: result?.status,
            error: result?.error,
            description: result?.response?.reasoning,
            chartType: result?.response?.chartType?.toUpperCase() || null,
            chartSchema: result?.response?.chartSchema,
          };
          logger.debug(
            `Job ${threadResponse.id} chart status changed, updating`,
          );
          await this.threadResponseRepository.updateOne(threadResponse.id, {
            chartDetail: updatedChartDetail,
          });

          // remove the task from tracker if it is finalized
          if (isFinalized(result.status)) {
            const eventProperties = {
              question: threadResponse.question,
              error: result.error,
            };
            if (result.status === ChartStatus.FINISHED) {
              this.telemetry.sendEvent(
                TelemetryEvent.HOME_ANSWER_CHART,
                eventProperties,
              );
            } else {
              this.telemetry.sendEvent(
                TelemetryEvent.HOME_ANSWER_CHART,
                eventProperties,
                cortexService.AI,
                false,
              );
            }
            logger.debug(
              `Job ${threadResponse.id} chart is finalized, removing`,
            );
            delete this.tasks[threadResponse.id];
          }

          // mark the job as finished
          this.runningJobs.delete(threadResponse.id);
        },
      );

      // run the jobs
      Promise.allSettled(jobs.map((job) => job())).then((results) => {
        // show reason of rejection
        results.forEach((result, index) => {
          if (result.status === 'rejected') {
            logger.error(`Job ${index} failed: ${result.reason}`);
          }
        });
      });
    }, this.intervalTime);
  }

  public addTask(threadResponse: ThreadResponse) {
    this.tasks[threadResponse.id] = threadResponse;
  }

  public getTasks() {
    return this.tasks;
  }
}

export class ChartAdjustmentBackgroundTracker {
  private tasks: Record<number, ThreadResponse> = {};
  private intervalTime: number;
  private cortexAIAdaptor: IcortexAIAdaptor;
  private threadResponseRepository: IThreadResponseRepository;
  private runningJobs = new Set();
  private telemetry: PostHogTelemetry;

  constructor({
    telemetry,
    cortexAIAdaptor,
    threadResponseRepository,
  }: {
    telemetry: PostHogTelemetry;
    cortexAIAdaptor: IcortexAIAdaptor;
    threadResponseRepository: IThreadResponseRepository;
  }) {
    this.telemetry = telemetry;
    this.cortexAIAdaptor = cortexAIAdaptor;
    this.threadResponseRepository = threadResponseRepository;
    this.intervalTime = 1000;
    this.start();
  }

  private start() {
    logger.info('Chart adjustment background tracker started');
    setInterval(() => {
      const jobs = Object.values(this.tasks).map(
        (threadResponse) => async () => {
          // check if same job is running
          if (this.runningJobs.has(threadResponse.id)) {
            return;
          }

          // mark the job as running
          this.runningJobs.add(threadResponse.id);

          // get the chart detail
          const chartDetail = threadResponse.chartDetail;

          // get the latest result from AI service
          const result = await this.cortexAIAdaptor.getChartAdjustmentResult(
            chartDetail.queryId,
          );

          // check if status change
          if (chartDetail.status === result.status) {
            // mark the job as finished
            logger.debug(
              `Job ${threadResponse.id} chart status not changed, finished`,
            );
            this.runningJobs.delete(threadResponse.id);
            return;
          }

          // update database
          const updatedChartDetail = {
            queryId: chartDetail.queryId,
            status: result?.status,
            error: result?.error,
            description: result?.response?.reasoning,
            chartType: result?.response?.chartType?.toUpperCase() || null,
            chartSchema: result?.response?.chartSchema,
            adjustment: true,
          };
          logger.debug(
            `Job ${threadResponse.id} chart status changed, updating`,
          );
          await this.threadResponseRepository.updateOne(threadResponse.id, {
            chartDetail: updatedChartDetail,
          });

          // remove the task from tracker if it is finalized
          if (isFinalized(result.status)) {
            const eventProperties = {
              question: threadResponse.question,
              error: result.error,
            };
            if (result.status === ChartStatus.FINISHED) {
              this.telemetry.sendEvent(
                TelemetryEvent.HOME_ANSWER_ADJUST_CHART,
                eventProperties,
              );
            } else {
              this.telemetry.sendEvent(
                TelemetryEvent.HOME_ANSWER_ADJUST_CHART,
                eventProperties,
                cortexService.AI,
                false,
              );
            }
            logger.debug(
              `Job ${threadResponse.id} chart is finalized, removing`,
            );
            delete this.tasks[threadResponse.id];
          }

          // mark the job as finished
          this.runningJobs.delete(threadResponse.id);
        },
      );

      // run the jobs
      Promise.allSettled(jobs.map((job) => job())).then((results) => {
        // show reason of rejection
        results.forEach((result, index) => {
          if (result.status === 'rejected') {
            logger.error(`Job ${index} failed: ${result.reason}`);
          }
        });
      });
    }, this.intervalTime);
  }

  public addTask(threadResponse: ThreadResponse) {
    this.tasks[threadResponse.id] = threadResponse;
  }

  public getTasks() {
    return this.tasks;
  }
}
