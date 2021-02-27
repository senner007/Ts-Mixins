type Constructable<T> = new (...args: any[]) => T;
function Operational<BaseClass extends Constructable<{}>>(Base: BaseClass) {
  return class extends Base {
    postCommands: [Function, Function] = [() => 'foo', () => 'bar'];
  };
}

function ReadClass<BaseClass extends Constructable<{}>>(Base: BaseClass) {
  return class extends Base {
    readFunc: IReadOperation<EReadCommand> = async (command: EReadCommand) => EReadCommand[command];
  };
}

function WriteClass<BaseClass extends Constructable<{}>>(Base: BaseClass) {
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

const OperationalRead = Operational(ReadClass(ReadJob));
const OperationalWrite = Operational(WriteClass(WriteJob));

async function executor(
  jobs: (
    | InstanceType<typeof OperationalRead>
    | InstanceType<typeof OperationalWrite>
  )[]
) {
  for (const job of jobs) {
    if (job instanceof ReadJob) {
      const result = await job.readFunc(EReadCommand.DATA);
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
        const result = await job.writeFunc(EWriteCommand.MCU);
        console.log(result);
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
]);
