import { SerialPort } from 'serialport';
import { ReadlineParser } from '@serialport/parser-readline';
import { DefaultConfig, GlobalConfig } from './models/config';
import { takePhoto } from './utils/CameraUtils';
import { ConfigManager } from './store/configManager';
import { Button } from './models/button';
import { pressButton } from './services/pressBtn';

let mainConfig = ConfigManager.deserialize<GlobalConfig>("GlobalConfig");
if (mainConfig === undefined) {
  mainConfig = DefaultConfig;
}

const port = new SerialPort({ path: mainConfig.serialPort, baudRate: mainConfig.baudRate }).setEncoding('utf-8');
const parser = port.pipe(new ReadlineParser({ delimiter: '\n' }));
// const parser = port.pipe(new ReadlineParser()).setEncoding('utf-8');

let canRing: boolean = true;

// const parser = port.pipe(new ReadlineParser());

// Read the port data
port.on("open", () => {
  console.log('serial port open');
  const startup = Buffer.from('startup', 'utf8');
  setTimeout(() => {
    port.write(startup, (err) => {
      if (err) {
        console.error('Error writing to serial port:', err);
      }
    });
  }, 1000);
});
parser.on('data', async data =>{
  data = data.replace(/(\r\n|\n|\r)/gm, "");
  if (canRing) {
    canRing = false;
    port.write("send");
    console.log('got word from arduino:', data);

    await pressButton(sendMessage, data);

    setTimeout(() => canRing = true, 3000);
  }
});

const sendMessage = (mess: string) => {
  setTimeout(() => {
    port.write(mess);
  }, 180);
  // port.write(mess);
}

// takePhoto("shot_me");
// console.log("shoted");
// const someData = ConfigManager.deserialize("ok");
// console.log(someData);
// ConfigManager.serialize("GlobalConfig", DefaultConfig);

// const buttons: Button[] = [
//   {
//     roofId: "562FE",
//     buttonLabel: "1"
//   },
//   {
//     roofId: "500FG",
//     buttonLabel: "2"
//   },
// ]

// ConfigManager.serialize("Buttons", buttons);