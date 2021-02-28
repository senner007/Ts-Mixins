type Constructable<T> = new (...args: any[]) => T;
function Operational<BaseClass extends Constructable<{}>>(Base: BaseClass) {
  return class extends Base {
    postCommands: [Function, Function] = [() => 'foo', () => 'bar'];
  };
}

function ReadClass<BaseClass extends Constructable<ReadJob>>(Base: BaseClass) {
  return class extends Base {
    readFunc: IReadOperation<EReadCommand> = async (command: EReadCommand) => EReadCommand[command];
  };
}

function WriteClass<BaseClass extends Constructable<WriteJob>>(Base: BaseClass) {
    return class extends Base {
      writeFunc: IReadOperation<EWriteCommand> = async (command: EWriteCommand) => EWriteCommand[command];
    };
  }


class WriteJob implements IWriteJob {
  param: EWriteCommand;
  constructor(obj: IWriteJob) {
    this.param = obj.param;
  }
}

class ReadJob implements IReadJob {
  param: EReadCommand;
  constructor(obj: IReadJob) {
    this.param = obj.param;
  }
}

interface IReadJob {
  param: EReadCommand;
}

interface IWriteJob {
  param: EWriteCommand;
}

type IReadOperation<T> = (arg1: T) => Promise<string>;

enum EReadCommand {
  DATA,
}

enum EWriteCommand {
  MCU,
}

class OtherOperation {
  action : () => void;
  constructor(obj: {action : () => void }) {
    this.action = obj.action;
  }
}

class OtherOperationAsync {
  action : () => Promise<void>;
  constructor(obj: {action : () => Promise<void> }) {
    this.action = obj.action;
  }
}

function voidFunction() {
  console.log("not returning anything")
}

async function voidPromiseFunction() {
  console.log("not promising anything")
}

const OperationalRead = Operational(ReadClass(ReadJob));
const OperationalWrite = Operational(WriteClass(WriteJob));

async function executor(
  jobs: (
    | InstanceType<typeof OperationalRead>
    | InstanceType<typeof OperationalWrite>
    | OtherOperation
    | OtherOperationAsync
  )[]
) {
  for (const job of jobs) {
    if (job instanceof ReadJob) {
      const result = await job.readFunc(job.param);
      console.log(job)
      for (const postCommand of job.postCommands) {
          console.log(postCommand())
      }
      console.log(result);
    }
    if (job instanceof WriteJob) {
        console.log(job)
        for (const postCommand of job.postCommands) {
            console.log(postCommand())
        }
        const result = await job.writeFunc(job.param);
        console.log(result);
    }
    if (job instanceof OtherOperation) {
      console.log(job)
      job.action();
    }
    if (job instanceof OtherOperationAsync) {
      console.log(job)
      await job.action();
    }
  }
}

executor([
  new OperationalRead({
    param: EReadCommand.DATA,
  }),
  new OperationalWrite({
    param: EWriteCommand.MCU,
  }),
  new OtherOperation({
    action : voidFunction,
  }),
  new OtherOperationAsync({
    action : voidPromiseFunction,
  })
]);
