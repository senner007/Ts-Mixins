type Constructable<T> = new (...args: any[]) => T;
function Operational<BaseClass extends Constructable<{}>>(Base: BaseClass) {
  return class extends Base {
    postCommands: [Function, Function] = [() => 'foo', () => 'bar'];
  };
}

function ReadClass<BaseClass extends Constructable<ReadJob>>(Base: BaseClass) {
  return class extends Base {
    readFunc: IReadOperation<EReadCommand> = async (command: EReadCommand) =>
      EReadCommand[command];
  };
}

function WriteClass<BaseClass extends Constructable<WriteJob>>(
  Base: BaseClass
) {
  return class extends Base {
    writeFunc: IReadOperation<EWriteCommand> = async (command: EWriteCommand) =>
      EWriteCommand[command];
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
  action: () => void;
  constructor(obj: { action: () => void }) {
    this.action = obj.action;
  }
}

class OtherIdenticalOperation {
  action: () => void;
  constructor(obj: { action: () => void }) {
    this.action = obj.action;
  }
}

class OtherOperationAsync {
  func: () => Promise<string>;
  constructor(obj: { func: () => Promise<string> }) {
    this.func = obj.func;
  }
}

function voidFunction() {
  console.log('not returning anything');
}

async function stringPromiseFunction() {
  return new Promise((resolve: (value: string) => void) => {
    resolve('promising a string');
  });
}

const OperationalRead = Operational(ReadClass(ReadJob));
const OperationalWrite = Operational(WriteClass(WriteJob));

type TypeExecutorJob = (
  | InstanceType<typeof OperationalRead>
  | InstanceType<typeof OperationalWrite>
  | OtherOperation
  | OtherOperationAsync
)[];

async function executor(jobs: TypeExecutorJob) {
  for (const job of jobs) {
    if (job instanceof ReadJob) {
      const result = await job.readFunc(job.param);
      console.log(job);
      for (const postCommand of job.postCommands) {
        console.log(postCommand());
      }
      console.log(result);
    }
    if (job instanceof WriteJob) {
      console.log(job);
      for (const postCommand of job.postCommands) {
        console.log(postCommand());
      }
      const result = await job.writeFunc(job.param);
      console.log(result);
    }
    if (job instanceof OtherOperation) {
      console.log(job);
      job.action();
    }
    if (job instanceof OtherIdenticalOperation) {
      console.log(job);
      job.action();
    }
    if (job instanceof OtherOperationAsync) {
      console.log(job);
      const result = await job.func();
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
  new OtherOperation({
    action: voidFunction,
  }),
  new OtherIdenticalOperation({
    action: voidFunction,
  }),
  new OtherOperationAsync({
    func: stringPromiseFunction,
  }),
]);


// ReadJob {
//   param: 0,
//   readFunc: [AsyncFunction (anonymous)],
//   postCommands: [ [Function (anonymous)], [Function (anonymous)] ]
// }
// foo
// bar
// DATA
// WriteJob {
//   param: 0,
//   writeFunc: [AsyncFunction (anonymous)],
//   postCommands: [ [Function (anonymous)], [Function (anonymous)] ]
// }
// foo
// bar
// MCU
// OtherOperation { action: [Function: voidFunction] }
// not returning anything
// OtherIdenticalOperation { action: [Function: voidFunction] }
// not returning anything
// OtherOperationAsync { func: [AsyncFunction: stringPromiseFunction] }
// promising a string
