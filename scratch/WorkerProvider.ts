import { IocContract } from '@adonisjs/fold'
import Queue from 'bull'
import Task from 'App/Models/Task'

export default class WorkerProvider {
  constructor(protected container: IocContract) {}

  public register() {
    // Optional: register bindings here
  }

  public async boot() {
    const taskQueue = new Queue('tasks')

    taskQueue.process(async (job) => {
      const taskData = job.data
      console.log(`Worker processing task`, taskData)
      await Task.create({ description: taskData.description })
      return Promise.resolve()
    })

    taskQueue.on('completed', (job) => {
      console.log(`Job completed with result ${job.returnvalue}`)
    })

    taskQueue.on('failed', (job, err) => {
      console.log(`Job failed with error ${err}`)
    })

    console.log(`Worker is ready to process tasks`)
  }

  public async shutdown() {
    // Optional: clean up resources
  }
}
